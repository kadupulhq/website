import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, renameSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { buildSiteTranslations, hash, unitState, validateCatalog } from '../site-translations.mjs';
import { translatedLocales } from '../../src/i18n/locales.mjs';

const source = 'Kadupul documentation';
const target = 'Documentation Kadupul';
const review = { sourceSha256: hash(source), targetSha256: hash(target), state: 'reviewed', reviewer: 'fluent-reviewer', reviewedAt: '2026-09-14T12:00:00Z', reviewUrl: 'https://translate.kadupul.net/changes/' };
const run = (args, cwd) => spawnSync(process.execPath, [fileURLToPath(new URL('../site-translations.mjs', import.meta.url)), ...args], { encoding: 'utf8', cwd });

test('catalog validation accepts missing translations but protects keys, markup, placeholders and product names', () => {
	validateCatalog({ label: source }, { label: target });
	validateCatalog({ label: source }, {});
	validateCatalog({ label: source }, { label: '' });
	validateCatalog({ label: '{{title}} [COUNT] [SEARCH_TERM]' }, { label: '[COUNT] {{title}} [SEARCH_TERM]' });
	for (const value of [null, [], 'text']) assert.throws(() => validateCatalog({ label: source }, value), /flat JSON/);
	assert.throws(() => validateCatalog({ label: source }, { extra: 'text' }), /Unknown translation key/);
	assert.throws(() => validateCatalog({ label: source }, { label: 1 }), /Expected string/);
	assert.throws(() => validateCatalog({ label: source }, { label: '<script>' }), /Markup/);
	assert.throws(() => validateCatalog({ label: source }, { label: '  ' }), /Whitespace-only/);
	assert.throws(() => validateCatalog({ label: '' }, {}), /Empty English source/);
	assert.throws(() => validateCatalog({ label: '{{title}}' }, { label: '{{name}}' }), /Changed placeholders/);
	assert.throws(() => validateCatalog({ label: '{{title}} {{title}}' }, { label: '{{title}}' }), /Changed placeholders/);
	assert.throws(() => validateCatalog({ label: source }, { label: 'documentation' }), /protected name Kadupul/);
	assert.throws(() => validateCatalog({ label: 'Cacti documentation' }, { label: 'documentation' }), /protected name Cacti/);
	for (const name of ['KadupulX', 'Kadupulé', '_Kadupul', 'Kadupul2', 'Kadupul Kadupul']) assert.throws(() => validateCatalog({ label: source }, { label: name }), /protected name Kadupul/);
	assert.throws(() => validateCatalog({ label: 'Cacti' }, { label: 'Cactis' }), /protected name Cacti/);
	for (const name of ['Kadupul', 'Cacti']) {
		for (const altered of [`${name}\u0301`, `\u0301${name}`]) assert.throws(() => validateCatalog({ label: name }, { label: altered }), /protected name/);
	}
	validateCatalog({ label: 'Kadupul' }, { label: 'Kadupul은' });
	validateCatalog({ label: 'Kadupul' }, { label: 'Kadupulは' });
});

test('review states cannot survive changes to their source or target', () => {
	assert.equal(unitState(source, target, review), 'reviewed');
	assert.equal(unitState(source, target, { ...review, state: 'draft' }), 'draft');
	assert.equal(unitState(source, '', review), 'missing');
	assert.equal(unitState(source, undefined), 'missing');
	assert.equal(unitState(source, target), 'draft');
	for (const malformed of [null, false, true, 0, 1, '', 'draft', []]) assert.throws(() => unitState(source, target, malformed), /review record object/);
	assert.equal(unitState('Changed English', target, review), 'needs-update');
	assert.equal(unitState(source, 'Changed target', review), 'draft');
	assert.throws(() => unitState(source, target, { ...review, state: 'approved' }), /Invalid review state/);
	for (const field of ['sourceSha256', 'targetSha256']) {
		for (const value of [undefined, null, 123, 'bad']) assert.throws(() => unitState(source, target, { ...review, [field]: value }), new RegExp(`Invalid ${field}`));
	}
	for (const reviewer of [undefined, '']) assert.throws(() => unitState(source, target, { ...review, reviewer }), /reviewer/);
	for (const reviewedAt of [undefined, '', '2026-02-30T12:00:00Z', '2026-13-01T12:00:00Z']) assert.throws(() => unitState(source, target, { ...review, reviewedAt }), /review date/);
	for (const reviewUrl of [undefined, '', 'https://?', 'https://example.com/changes/', 'https://translate.kadupul.net/not-history', 'https://translate.kadupul.net:444/changes/', 'http://translate.kadupul.net/changes/', 'https://weblate.example/a b', 'https://user@translate.kadupul.net/changes/', 'https://:password@translate.kadupul.net/changes/']) assert.throws(() => unitState(source, target, { ...review, reviewUrl }), /history URL/);
});

function fixture(t) {
	const root = mkdtempSync(join(tmpdir(), 'site-translations-'));
	t.after(() => rmSync(root, { recursive: true, force: true }));
	for (const dir of ['translations/site', 'src/i18n', 'public']) mkdirSync(join(root, dir), { recursive: true });
	const write = (path, value) => writeFileSync(join(root, path), JSON.stringify(value));
	write('translations/site/en.json', { label: source, other: 'Other' });
	for (const locale of translatedLocales) write(`translations/site/${locale}.json`, { label: target });
	write('translations/site-reviews.json', { schemaVersion: 1, units: { es: { label: review } } });
	return { root, write };
}

test('generation reports English fallback separately and source changes affect only their own units', (t) => {
	const { root, write } = fixture(t);
	const report = buildSiteTranslations(root);
	assert.equal(report.locales.es.units.label, 'reviewed');
	assert.equal(report.locales.es.units.other, 'missing');
	assert.equal(report.locales.fr.units.label, 'draft');
	const output = join(root, 'src/i18n/messages.json');
	assert.equal(JSON.parse(readFileSync(output)).es.other, 'Other');
	assert.doesNotThrow(() => buildSiteTranslations(root, { check: true }));
	const before = readFileSync(output, 'utf8');
	write('translations/site/en.json', { label: 'Kadupul docs', other: 'Other' });
	assert.throws(() => buildSiteTranslations(root, { check: true }), /Stale generated/);
	assert.equal(readFileSync(output, 'utf8'), before);
	const updated = buildSiteTranslations(root);
	assert.equal(updated.locales.es.units.label, 'needs-update');
	assert.equal(updated.locales.es.units.other, 'missing');
	assert.equal(updated.locales.fr.units.label, 'draft');
	write('public/site-translation-status.json', {});
	assert.throws(() => buildSiteTranslations(root, { check: true }), /site-translation-status/);
});

test('review manifest rejects unknown schema, locale and key', (t) => {
	const { root, write } = fixture(t);
	for (const [manifest, error] of [
		[null, /review manifest/],
		[{ schemaVersion: 1, units: [] }, /review units/],
		[{ schemaVersion: 1, units: { es: false } }, /review units for es/],
		[{ schemaVersion: 1, units: { es: { label: null } } }, /review record/],
		[{ schemaVersion: 2, units: {} }, /Unsupported/],
		[{ schemaVersion: 1, units: { unknown: {} } }, /Unknown review locale/],
		[{ schemaVersion: 1, units: { es: { unknown: review } } }, /Unknown review key/],
	]) {
		write('translations/site-reviews.json', manifest);
		assert.throws(() => buildSiteTranslations(root), error);
	}
});

test('catalog discovery rejects mistyped and unsupported JSON filenames, including missing catalogs', (t) => {
	const { root, write } = fixture(t);
	write('translations/site/README.md', 'Ignored by the Weblate JSON file mask');
	assert.doesNotThrow(() => buildSiteTranslations(root));
	// Rename explicitly: writing a second case variant aliases the existing file on macOS.
	renameSync(join(root, 'translations/site/fr-ca.json'), join(root, 'translations/site/fr-CA.json'));
	assert.throws(() => buildSiteTranslations(root), /Catalog filenames/);
	renameSync(join(root, 'translations/site/fr-CA.json'), join(root, 'translations/site/fr-ca.json'));
	for (const name of ['unknown.json', 'reviews.json', 'unknown.JSON', 'reviews.Json']) {
		write(`translations/site/${name}`, {});
		assert.throws(() => buildSiteTranslations(root), /Catalog filenames/);
		rmSync(join(root, 'translations/site', name));
	}
	rmSync(join(root, 'translations/site/fr-ca.json'));
	assert.throws(() => buildSiteTranslations(root), /Catalog filenames/);
});

test('CLI generates and checks catalogs, returns failures and checks the actual repository by default', (t) => {
	const { root, write } = fixture(t);
	const result = run([root], root);
	assert.equal(result.status, 0, result.stderr);
	assert.match(result.stdout, /files generated/);
	assert.equal(run(['--check', root], root).status, 0);
	write('translations/site/es.json', { unknown: 'text' });
	assert.notEqual(run(['--check', root], root).status, 0);
	const repository = run(['--check']);
	assert.equal(repository.status, 0, repository.stderr);
	assert.match(repository.stdout, /catalogs match/);
});


test('CLI confines explicit roots to canonical cwd, rejecting traversal, sibling prefixes and symlink escapes', (t) => {
	const { root } = fixture(t);
	const { root: outside } = fixture(t);
	for (const candidate of [outside, '../' + outside.split('/').at(-1)]) {
		const result = run([candidate], root);
		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /outside the allowed directory/);
	}
	const sibling = root + '-sibling';
	mkdirSync(sibling);
	t.after(() => rmSync(sibling, { recursive: true, force: true }));
	assert.match(run([sibling], root).stderr, /outside the allowed directory/);
	symlinkSync(outside, join(root, 'escape'));
	assert.match(run(['escape'], root).stderr, /outside the allowed directory/);
	assert.match(run(['.', '.'], root).stderr, /at most one/);
	assert.equal(run(['.'], root).status, 0);
	// A symlink naming cwd itself is allowed after canonicalization.
	symlinkSync(root, join(root, 'self'));
	assert.equal(run(['self'], root).status, 0);
	assert.equal(run([root], '/').status, 0);
});

test('catalog directory, catalog files and review manifest cannot escape through symlinks', (t) => {
	for (const path of ['translations/site', 'translations/site/en.json', 'translations/site-reviews.json']) {
		const { root } = fixture(t);
		const { root: outside } = fixture(t);
		rmSync(join(root, path), { recursive: true });
		symlinkSync(join(outside, path), join(root, path));
		assert.throws(() => buildSiteTranslations(root), /outside the allowed directory/);
	}
});

test('generated outputs and their parents cannot escape, and neither output is written on rejection', (t) => {
	for (const path of ['src/i18n/messages.json', 'public/site-translation-status.json', 'src/i18n', 'public']) {
		const { root, write } = fixture(t);
		const { root: outside } = fixture(t);
		buildSiteTranslations(root);
		buildSiteTranslations(outside);
		const first = readFileSync(join(root, 'src/i18n/messages.json'), 'utf8');
		const sentinel = readFileSync(join(outside, 'public/site-translation-status.json'), 'utf8');
		write('translations/site/en.json', { label: source, other: 'Changed fallback' });
		rmSync(join(root, path), { recursive: true });
		symlinkSync(join(outside, path), join(root, path));
		for (const check of [false, true]) assert.throws(() => buildSiteTranslations(root, { check }), /outside the allowed directory/);
		assert.equal(readFileSync(join(root, 'src/i18n/messages.json'), 'utf8'), first);
		assert.equal(readFileSync(join(outside, 'public/site-translation-status.json'), 'utf8'), sentinel);
	}
});

test('missing and invalid paths fail without writing through dangling output symlinks', (t) => {
	const { root } = fixture(t);
	const { root: outside } = fixture(t);
	const target = join(outside, 'not-created.json');
	symlinkSync(target, join(root, 'src/i18n/messages.json'));
	assert.throws(() => buildSiteTranslations(root), /dangling symlink/);
	assert.throws(() => readFileSync(target), /ENOENT/);
	rmSync(join(root, 'src/i18n/messages.json'));
	assert.throws(() => buildSiteTranslations(root, { check: true }), /ENOENT/);
	rmSync(join(root, 'src/i18n'), { recursive: true });
	writeFileSync(join(root, 'src/i18n'), 'not a directory');
	assert.throws(() => buildSiteTranslations(root), /ENOTDIR/);
});


test('non-regular output destinations are rejected before either artifact changes', (t) => {
	for (const path of ['src/i18n/messages.json', 'public/site-translation-status.json']) {
		const { root, write } = fixture(t);
		buildSiteTranslations(root);
		const other = path.startsWith('public/') ? 'src/i18n/messages.json' : 'public/site-translation-status.json';
		const before = readFileSync(join(root, other), 'utf8');
		write('translations/site/en.json', { label: source, other: 'Changed fallback' });
		rmSync(join(root, path));
		mkdirSync(join(root, path));
		for (const check of [false, true]) assert.throws(() => buildSiteTranslations(root, { check }), /regular file/);
		assert.equal(readFileSync(join(root, other), 'utf8'), before);
	}
});
