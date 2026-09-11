import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { classify, check } from '../check-links.mjs';

test('classify splits fragments and queries off the path', () => {
	assert.deepEqual(classify('/a/b/'), { path: '/a/b/', fragment: '' });
	assert.deepEqual(classify('/a/b'), { path: '/a/b/', fragment: '' });
	assert.deepEqual(classify('/a/b/#frag'), { path: '/a/b/', fragment: 'frag' });
	assert.deepEqual(classify('/a/b#frag'), { path: '/a/b/', fragment: 'frag' });
	assert.deepEqual(classify('/a/b/?x=1'), { path: '/a/b/', fragment: '' });
	assert.deepEqual(classify('/a/b/?x=1#f'), { path: '/a/b/', fragment: 'f' });
});

test('classify ignores assets and external links', () => {
	assert.equal(classify('/logo.png'), null);
	assert.equal(classify('/font.woff2'), null);
	assert.equal(classify('https://example.com/'), null);
	assert.equal(classify('mailto:a@b.c'), null);
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
	assert.deepEqual(classify('#top', 'a/'), { path: '/a/', fragment: 'top', samePage: true });
	assert.deepEqual(classify('/foo.html'), { path: '/foo.html', fragment: '' });
	// A version directory must not be mistaken for a file extension.
	assert.deepEqual(classify('/1.2.31'), { path: '/1.2.31/', fragment: '' });
	assert.equal(classify('/a/b.png'), null);
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
});
