import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildMaps, frontmatter } from '../build-map.mjs';
import { lintProse } from '../lint-prose.mjs';
import { translatedLocales } from '../../src/i18n/locales.mjs';

function fixture(t) {
	const root = mkdtempSync(join(tmpdir(), 'content-tools-'));
	t.after(() => rmSync(root, { recursive: true, force: true }));
	const write = (p, value) => { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), value); };
	return { root, write };
}
const page = (title, body = '', extra = '') => `---\ntitle: "${title}"\ndescription: A useful page.\n${extra}---\n\n${body}\n`;
const run = (name, args = []) => spawnSync(process.execPath, [fileURLToPath(new URL(`../${name}.mjs`, import.meta.url)), ...args], { encoding: 'utf8' });

test('maps use local titles, mark English fallback and keep links locale-specific', (t) => {
	const { root, write } = fixture(t);
	write('start/z.md', page('Z', '', 'sidebar:\n  order: 1\n'));
	write('start/b.md', page('B'));
	write('start/a.mdx', page('A'));
	write('start/no-description.md', '---\ntitle: No description\n---\n');
	write('start/empty.md', '---\ndescription: No title\n---\n');
	write('start/invalid.md', 'Not markdown frontmatter');
	write('start/ignored.txt', 'ignored');
	write('es/start/z.md', page('Zeta'));
	write('fr/start/z.md', 'not frontmatter');
	buildMaps(root, ['es', 'fr']);
	const en = readFileSync(join(root, 'map.md'), 'utf8');
	assert.ok(en.indexOf('[Z]') < en.indexOf('[A]'));
	assert.ok(en.indexOf('[A]') < en.indexOf('[B]'));
	assert.match(en, /\[A\]\(\/start\/a\/\)\. A useful page/);
	assert.match(en, /\[No description\]\(\/start\/no-description\/\)\n/);
	assert.doesNotMatch(en, /ignored|invalid|empty/);
	const es = readFileSync(join(root, 'es/map.md'), 'utf8');
	assert.match(es, /\[Zeta\]\(\/es\/start\/z\/\)/);
	assert.match(es, /\[A \(English\)\]\(\/es\/start\/a\/\)/);
	assert.match(readFileSync(join(root, 'fr/map.md'), 'utf8'), /Z \(English\)/);
});

test('frontmatter handles malformed input and optional title, description and ordering', (t) => {
	const { root, write } = fixture(t);
	write('bad.md', '---\ntitle: Unterminated');
	assert.equal(frontmatter(join(root, 'bad.md')), null);
	write('minimal.md', '---\ndescription: Only a description\n---\n');
	assert.deepEqual(frontmatter(join(root, 'minimal.md')), { title: '', description: 'Only a description', order: 999 });
});

test('map generation propagates filesystem errors instead of treating them as missing translations', (t) => {
	const { root, write } = fixture(t);
	write('start', 'not a directory');
	assert.throws(() => buildMaps(root, []), { code: 'ENOTDIR' });
	rmSync(join(root, 'start'));
	write('start/a.md', page('A'));
	mkdirSync(join(root, 'es/start/a.md'), { recursive: true });
	assert.throws(() => buildMaps(root, ['es']), { code: 'EISDIR' });
});

test('prose validation checks structure in every locale and English rules only in English', (t) => {
	const { root, write } = fixture(t);
	write('start/good.md', page('Good', '## Heading\n\n### Detail\n\nUse `leverage` as a literal. [Link](https://example.com/robust).'));
	write('es-419/start/local.md', page('Local', 'robust — comprehensive'));
	write('ignore.json', '{}');
	assert.deepEqual(lintProse(root), []);
	write('start/bad.md', page('Bad', '# Extra title\n\n### Too deep\n\nA robust tool — comprehensive.'));
	const issues = lintProse(root);
	for (const expected of ['h1 in body', 'h3 before any h2', 'em dash', 'banned: "robust"', 'banned: "comprehensive"']) assert.ok(issues.some((i) => i.includes(expected)));
	write('es-419/start/bad.md', 'No frontmatter');
	assert.equal(lintProse(root).filter((i) => i.startsWith('es-419/start/bad.md')).length, 3);
});

test('fenced headings, including other fence markers inside a fence, do not become headings', (t) => {
	const { root, write } = fixture(t);
	write('fences.mdx', page('Fences', '```sh\n# shell comment\n~~~\n### still a comment\n```\n\n~~~text\n# example\n~~~\n\n## Real heading\n\n### Detail\n\n#### Extra detail'));
	assert.deepEqual(lintProse(root), []);
});

test('content CLIs report successful generation and actionable prose failures', (t) => {
	const { root, write } = fixture(t);
	write('start/a.md', page('A'));
	for (const locale of translatedLocales) mkdirSync(join(root, locale));
	const map = run('build-map', [root]);
	assert.equal(map.status, 0, map.stderr);
	assert.match(map.stdout, /maps generated/);
	assert.doesNotThrow(() => buildMaps(root, undefined, { check: true }));
	assert.equal(run('lint-prose', [root]).status, 0);
	write('bad.md', page('Bad', '# Duplicate title'));
	const lint = run('lint-prose', [root]);
	assert.equal(lint.status, 1);
	assert.match(lint.stderr, /bad.md:.*h1 in body/);
	assert.match(lint.stderr, /1 prose issue/);
});

test('default CLI paths validate repository maps without rewriting them', () => {
	const maps = ['', ...translatedLocales].map((locale) => new URL(`../../src/content/docs/${locale ? locale + '/' : ''}map.md`, import.meta.url));
	const before = maps.map((path) => readFileSync(path, 'utf8'));
	const result = run('build-map', ['--check']);
	assert.equal(result.status, 0, result.stderr);
	assert.match(result.stdout, /maps match/);
	assert.deepEqual(maps.map((path) => readFileSync(path, 'utf8')), before);
	const lint = run('lint-prose');
	assert.equal(lint.status, 0, lint.stderr);
});

test('check-only generation rejects stale English and translated maps without writing any files', (t) => {
	const { root, write } = fixture(t);
	write('start/a.md', page('A'));
	write('es/start/a.md', page('A en español'));
	buildMaps(root, ['es']);
	assert.doesNotThrow(() => buildMaps(root, ['es'], { check: true }));
	const maps = ['map.md', 'es/map.md'];
	const before = maps.map((path) => readFileSync(join(root, path), 'utf8'));
	write('start/a.md', page('Changed English title'));
	assert.throws(() => buildMaps(root, ['es'], { check: true }), /Stale documentation map/);
	assert.deepEqual(maps.map((path) => readFileSync(join(root, path), 'utf8')), before);
	write('start/a.md', page('A'));
	write('es/start/a.md', page('Título cambiado'));
	assert.throws(() => buildMaps(root, ['es'], { check: true }), /es.*map.md/);
	assert.deepEqual(maps.map((path) => readFileSync(join(root, path), 'utf8')), before);
	write('start/a.md', page('Another changed English title'));
	const result = run('build-map', ['--check', root]);
	assert.notEqual(result.status, 0);
	assert.match(result.stderr, /Stale documentation map/);
	assert.deepEqual(maps.map((path) => readFileSync(join(root, path), 'utf8')), before);
});

test('validation checks committed maps before any command can regenerate them', () => {
	const { scripts } = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
	for (const name of ['check:all', 'test']) {
		const steps = scripts[name].split(' && ');
		assert.ok(steps.indexOf('npm run check:maps') >= 0);
		assert.ok(steps.indexOf('npm run check:maps') < steps.indexOf('npm run build'));
	}
});
