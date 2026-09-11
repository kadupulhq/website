import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { classify, check } from '../check-links.mjs';

const pathOf = (h, from) => { const c = classify(h, from); return c && [c.path, c.fragment]; };

test('classify splits fragments and queries off the path', () => {
	assert.deepEqual(pathOf('/a/b/'), ['/a/b/', '']);
	assert.deepEqual(pathOf('/a/b'), ['/a/b/', '']);
	assert.deepEqual(pathOf('/a/b/#frag'), ['/a/b/', 'frag']);
	assert.deepEqual(pathOf('/a/b#frag'), ['/a/b/', 'frag']);
	assert.deepEqual(pathOf('/a/b/?x=1'), ['/a/b/', '']);
	assert.deepEqual(pathOf('/a/b/?x=1#f'), ['/a/b/', 'f']);
});

test('classify ignores anything that is not a site-absolute path', () => {
	assert.equal(classify('https://example.com/'), null);
	assert.equal(classify('mailto:a@b.c'), null);
	assert.equal(classify('relative/page/'), null);
});

test('a dotted path is marked, and resolved against the build rather than a list', () => {
	// No extension allowlist: an allowlist goes stale the first time someone
	// adds a feed or a download. The build decides.
	assert.equal(classify('/logo.png').dotted, true);
	assert.equal(classify('/feed.atom').dotted, true);
	assert.equal(classify('/1.2.31').dotted, true);
	assert.equal(classify('/a/b/').dotted, false);
});

test('an asset present in the build is skipped, a missing one is reported', () => {
	const d = build({
		'index.html': '<a href="/real.png">a</a><a href="/gone.png">b</a>',
		'real.png': 'binary',
	});
	const r = check(d);
	assert.equal(r.broken.length, 1, 'a link to a missing file must be caught');
	assert.match(r.broken[0], /gone\.png/);
	rmSync(d, { recursive: true });
});

function build(files) {
	const dir = mkdtempSync(join(tmpdir(), 'linkcheck-'));
	for (const [path, html] of Object.entries(files)) {
		const full = join(dir, path);
		mkdirSync(join(full, '..'), { recursive: true });
		writeFileSync(full, html);
	}
	return dir + '/';
}

test('reports a broken route', () => {
	const d = build({ 'index.html': '<a href="/nope/">x</a>' });
	const r = check(d);
	assert.equal(r.broken.length, 1);
	assert.match(r.broken[0], /no such route/);
	rmSync(d, { recursive: true });
});

test('checks anchors against target ids, and does not skip them', () => {
	const d = build({
		'index.html': '<a href="/page/#here">x</a><a href="/page/#gone">y</a>',
		'page/index.html': '<h2 id="here">H</h2>',
	});
	const r = check(d);
	assert.equal(r.fragmentsChecked, 2, 'anchor links must be counted, not skipped');
	assert.equal(r.broken.length, 1);
	assert.match(r.broken[0], /no such anchor/);
	rmSync(d, { recursive: true });
});

test('fails when dist is missing or empty rather than reporting success', () => {
	assert.ok(check('/definitely/not/here/').fatal);
	const empty = mkdtempSync(join(tmpdir(), 'linkcheck-')) + '/';
	assert.ok(check(empty).fatal, 'an empty build must not pass');
	rmSync(empty, { recursive: true });
});

test('404 is not reported as an orphan', () => {
	const d = build({ 'index.html': '<a href="/a/">x</a>', 'a/index.html': 'a', '404.html': 'nope' });
	assert.deepEqual(check(d).orphans, []);
	rmSync(d, { recursive: true });
});

test('same-page fragments resolve against the current page', () => {
	const d = build({ 'p/index.html': '<h2 id="ok">H</h2><a href="#ok">a</a><a href="#no">b</a>' });
	const r = check(d);
	assert.equal(r.fragmentsChecked, 2, 'same-page anchors must be checked, not dropped');
	assert.equal(r.broken.length, 1);
	assert.match(r.broken[0], /no such anchor/);
	rmSync(d, { recursive: true });
});

test('classify handles same-page, .html routes and dotted route segments', () => {
	assert.deepEqual(pathOf('#top', 'a/'), ['/a/', 'top']);
	assert.equal(classify('#top', 'a/').samePage, true);
	assert.deepEqual(pathOf('/foo.html'), ['/foo.html', '']);
	// A version directory must not be forced into a trailing slash as if it
	// were a route, nor dropped as if it were a file.
	assert.equal(classify('/1.2.31').path, '/1.2.31');
});

test('the CLI entry point fails closed', async () => {
	const { execFileSync } = await import('node:child_process');
	const script = fileURLToPath(new URL('../check-links.mjs', import.meta.url));
	const run = (dir) => {
		try {
			execFileSync(process.execPath, [script], {
				env: { ...process.env, CHECK_LINKS_DIST: dir }, encoding: 'utf8',
			});
			return 0;
		} catch (e) { return e.status; }
	};
	assert.equal(run('/definitely/not/here/'), 2, 'a missing build must exit 2');
	const d = build({ 'index.html': '<a href="/nope/">x</a>' });
	assert.equal(run(d), 1, 'a broken link must exit 1');
	rmSync(d, { recursive: true });

	// Build the symlink rather than depending on the host having one. On Linux
	// os.tmpdir() is a real directory, so asserting otherwise would redden CI.
	const { symlinkSync } = await import('node:fs');
	const real = build({ 'index.html': '<a href="/nope/">x</a>' });
	const link = mkdtempSync(join(tmpdir(), 'linkcheck-ln-')) + '/via';
	symlinkSync(real, link);
	assert.equal(run(link + '/'), 1, 'must still run when reached through a symlink');
	rmSync(link, { recursive: true, force: true });
	rmSync(real, { recursive: true });
});

test('a dotted directory is route-checked, not swallowed as an asset', () => {
	const d = build({
		'index.html': '<a href="/1.2.31">v</a><a href="/1.2.31#top">a</a>',
		'1.2.31/index.html': '<h2 id="top">T</h2>',
	});
	const r = check(d);
	assert.equal(r.broken.length, 0, 'the dotted directory resolves as a route');
	assert.ok(r.checked >= 2, 'both links must be counted, not skipped');
	assert.equal(r.fragmentsChecked, 1, 'the anchor on a dotted directory must be checked');
	rmSync(d, { recursive: true });
});

test('a traversing href cannot reach outside the build', () => {
	const d = build({ 'index.html': '<a href="/../escape.png">x</a>' });
	const r = check(d);
	assert.equal(r.broken.length, 1, 'traversal must be reported, not silently skipped');
	rmSync(d, { recursive: true });
});

test('an explicit /path/index.html link is checked, not dropped', () => {
	const d = build({
		'index.html': '<a href="/sub/index.html#nope">x</a><a href="/sub/">ok</a>',
		'sub/index.html': '<h2 id="real">R</h2>',
	});
	const r = check(d);
	assert.equal(r.fragmentsChecked, 1, 'the anchor must be validated');
	assert.equal(r.broken.length, 1, 'a bad anchor must be reported');
	assert.match(r.broken[0], /no such anchor/);
	rmSync(d, { recursive: true });
});

test('an index.html link counts as inbound, so the target is not an orphan', () => {
	const d = build({ 'index.html': '<a href="/only/index.html">x</a>', 'only/index.html': 'y' });
	const r = check(d);
	assert.deepEqual(r.orphans, []);
	assert.ok(r.checked >= 1);
	rmSync(d, { recursive: true });
});
