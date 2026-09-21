import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checkLocales } from '../check-locales.mjs';
import { locales, translatedLocales, getMessages, messages } from '../../src/i18n/locales.mjs';

function fixture(t) {
	const root = mkdtempSync(join(tmpdir(), 'locale-check-'));
	t.after(() => rmSync(root, { recursive: true, force: true }));
	const write = (path, data) => {
		mkdirSync(join(root, path, '..'), { recursive: true });
		writeFileSync(join(root, path), data);
	};
	for (const [locale, config] of Object.entries(locales)) {
		write(`src/content/i18n/${config.lang}.json`, JSON.stringify(locale === 'es-419' ? { 'languageSelect.accessibleLabel': 'Idioma', 'search.label': 'Buscar' } : {}));
		const prefix = locale === 'root' ? '' : `${locale}/`;
		const t = getMessages(locale);
		const options = Object.entries(locales).map(([key, value]) => `<option value="/${key === 'root' ? '' : key + '/'}">${value.label}</option>`).join('');
		const html = `<html lang="${config.lang}" dir="${config.dir || 'ltr'}"><body><span>Idioma</span><span>Buscar</span><select>${options}</select><p>${t.independent}</p><main lang="en" dir="ltr"><span>${t.fallback}</span><h2>${t.reference}</h2></main></body></html>`;
		write(`dist/${prefix}404/index.html`, html.replace('<body>', '<head><meta charset="utf-8"><meta name="robots" content="noindex, follow"></head><body>'));
		for (const path of ['index.html', 'project/security/index.html', 'start/install/index.html', '1.2.31/start/install/index.html']) write(`dist/${prefix}${path}`, html);
	}
	write('src/i18n/messages.json', JSON.stringify(messages));
	write('src/content/docs/project/security.md', 'English source');
	write('src/content/docs/es/project/security.md', 'Resumen');
	write('src/i18n/translations.json', JSON.stringify({ pages: { 'es/project/security.md': { source: 'project/security.md', sourceSha256: createHash('sha256').update('English source').digest('hex') } } }));
	return { root, write };
}

function addOrdinaryTranslation(root, write) {
	write('src/content/docs/start/overview.md', 'English source');
	write('src/content/docs/es/start/overview.md', 'Resumen');
	const manifest = JSON.parse(readFileSync(join(root, 'src/i18n/translations.json'), 'utf8'));
	manifest.pages['es/start/overview.md'] = { source: 'start/overview.md', sourceSha256: createHash('sha256').update('English source').digest('hex') };
	write('src/i18n/translations.json', JSON.stringify(manifest));
}

test('locale validator rejects policy drift and warns on ordinary source drift unless strict', (t) => {
	const { root, write } = fixture(t);
	assert.equal(checkLocales(root).locales, translatedLocales.length + 1);
	assert.deepEqual(checkLocales(root).stale, []);
	write('src/content/docs/project/security.md', 'Urgent English correction');
	assert.throws(() => checkLocales(root), /English policy source changed/);
	write('src/content/docs/project/security.md', 'English source');
	addOrdinaryTranslation(root, write);
	write('src/content/docs/start/overview.md', 'Updated tutorial');
	assert.deepEqual(checkLocales(root).stale, ['es/start/overview.md']);
	assert.throws(() => checkLocales(root, { strictDrift: true }), /English source changed/);
});

test('missing language-switch destinations fail validation', (t) => {
	const { root, write } = fixture(t);
	const path = 'dist/es/index.html';
	write(path, readFileSync(join(root, path), 'utf8').replace('value="/fr/"', 'value="/missing/"'));
	assert.throws(() => checkLocales(root), /Missing switch destination/);
});

test('Arabic layout and English fallback direction are independently enforced', (t) => {
	const { root, write } = fixture(t);
	const path = 'dist/ar/start/install/index.html';
	const html = readFileSync(join(root, path), 'utf8');
	write(path, html.replace('dir="rtl"', 'dir="ltr"'));
	assert.throws(() => checkLocales(root), /ar\/start\/install/);
	write(path, html.replace('<main lang="en" dir="ltr">', '<main lang="en" dir="rtl">'));
	assert.throws(() => checkLocales(root), /Fallback direction/);
});

test('numeric regional locales cannot silently fall back to English UI labels', (t) => {
	const { root, write } = fixture(t);
	write('src/content/i18n/es-419.json', JSON.stringify({ 'languageSelect.accessibleLabel': 'Seleccionar idioma' }));
	assert.throws(() => checkLocales(root), /Missing localized languageSelect.accessibleLabel: es-419/);
});

test('locale checks fail clearly before rendering when a configured dictionary is absent', (t) => {
	const { root, write } = fixture(t);
	const catalog = structuredClone(messages);
	delete catalog['fr-ca'];
	write('src/i18n/messages.json', JSON.stringify(catalog));
	assert.throws(() => checkLocales(root), /Missing message dictionary: fr-ca/);
});

test('localized labels, empty options and explicit HTML switch destinations are checked', (t) => {
	const { root, write } = fixture(t);
	const path = 'dist/es-419/index.html';
	write('src/content/i18n/es-419.json', JSON.stringify({ 'languageSelect.accessibleLabel': 'Idioma', 'search.label': 'Buscar' }));
	write('dist/manual.html', '<p>Manual</p>');
	for (const page of ['project/security/index.html', 'start/install/index.html', '1.2.31/start/install/index.html']) {
		const target = `dist/es-419/${page}`;
		write(target, readFileSync(join(root, target), 'utf8').replace('<body>', '<body><span>Buscar</span>'));
	}
	write(path, readFileSync(join(root, path), 'utf8').replace('<body>', '<body><!-- translator comment --><span>Buscar</span><select><option></option><option value="current">main</option><option value="/manual.html">Manual</option></select>'));
	assert.doesNotThrow(() => checkLocales(root));
	write(path, readFileSync(join(root, path), 'utf8').replace('/manual.html', '/missing.html'));
	assert.throws(() => checkLocales(root), /Missing switch destination/);
});

test('missing content, incorrect fallback and versioned policy pages cannot pass', (t) => {
	const { root, write } = fixture(t);
	for (const [path, before, after, error] of [
		['dist/fr/index.html', messages.fr.independent, '', /Missing localized footer/],
		['dist/fr/index.html', 'English', 'Not English', /Missing language picker/],
		['dist/fr/start/install/index.html', messages.fr.fallback, 'not the notice', /Missing English fallback notice/],
		['dist/fr/start/install/index.html', 'lang="en"', 'lang="fr"', /Fallback language/],
		['dist/fr/start/install/index.html', messages.fr.reference, 'not the sidebar', /Missing sidebar translation/],
		['dist/fr/project/security/index.html', '</body>', '<starlight-version-select></starlight-version-select></body>', /Project policy must stay unversioned/],
	]) {
		const original = readFileSync(join(root, path), 'utf8');
		write(path, original.replace(before, after));
		assert.throws(() => checkLocales(root), error);
		write(path, original);
	}
	rmSync(join(root, 'src/content/docs/es/project/security.md'));
	assert.throws(() => checkLocales(root), /Missing translation/);
});

test('locale CLI reports source drift and strict mode rejects stale translations', (t) => {
	const { root, write } = fixture(t);
	const script = fileURLToPath(new URL('../check-locales.mjs', import.meta.url));
	const run = (...args) => spawnSync(process.execPath, [script, '--root', root, ...args], { encoding: 'utf8' });
	assert.equal(run('--strict-drift').status, 0);
	write('src/content/docs/project/security.md', 'Changed English source');
	const policy = run();
	assert.notEqual(policy.status, 0);
	assert.match(policy.stderr, /English policy source changed/);
	write('src/content/docs/project/security.md', 'English source');
	addOrdinaryTranslation(root, write);
	write('src/content/docs/start/overview.md', 'Changed tutorial');
	const warning = run();
	assert.equal(warning.status, 0, warning.stderr);
	assert.match(warning.stderr, /STALE translation: es\/start\/overview.md/);
	assert.match(warning.stdout, /translation sources checked/);
	assert.notEqual(run('--strict-drift').status, 0);
});

test('default locale CLI checks the repository build', () => {
	const run = spawnSync(process.execPath, [fileURLToPath(new URL('../check-locales.mjs', import.meta.url))], { encoding: 'utf8' });
	assert.equal(run.status, 0, run.stderr);
});


test('numeric regional labels are required and every explicitly supplied label must be nonempty text', (t) => {
	const { root, write } = fixture(t);
	const required = { 'languageSelect.accessibleLabel': 'Idioma', 'search.label': 'Buscar' };
	for (const key of Object.keys(required)) {
		const missing = { ...required };
		delete missing[key];
		write('src/content/i18n/es-419.json', JSON.stringify(missing));
		assert.throws(() => checkLocales(root), /Missing or empty interface label/);
	}
	write('src/content/i18n/es-419.json', JSON.stringify(required));
	for (const value of ['', '   ', null, 42]) {
		write('src/content/i18n/fr.json', JSON.stringify({ 'search.label': value }));
		assert.throws(() => checkLocales(root), /Missing or empty interface label search.label: fr/);
	}
	write('src/content/i18n/fr.json', JSON.stringify({ 'search.label': 'Buscar' }));
	assert.doesNotThrow(() => checkLocales(root));
	write('src/content/i18n/fr.json', '{}');
	assert.doesNotThrow(() => checkLocales(root));
});

test('rendered localized error pages must contain an exact robots noindex directive', (t) => {
	const { root, write } = fixture(t);
	const path = 'dist/fr/404/index.html';
	for (const meta of ['', '<meta name="robots">', '<meta name="robots" content="index, follow">', '<meta name="robots" content="not-noindex">', '<meta name="googlebot" content="noindex">']) {
		write(path, `<html><head>${meta}</head><body>Error</body></html>`);
		assert.throws(() => checkLocales(root), /Error page must include robots noindex: fr/);
	}
	write(path, '<html><head><meta name="ROBOTS" content="NOINDEX, FOLLOW"></head><body>Error</body></html>');
	assert.doesNotThrow(() => checkLocales(root));
});

test('locale switches must include the configured project Pages base', (t) => {
	const { root, write } = fixture(t);
	assert.throws(() => checkLocales(root, { base: '/website/' }), /Switch escapes site base/);
	for (const locale of Object.keys(locales)) {
		const prefix = locale === 'root' ? '' : `${locale}/`;
		for (const page of ['index.html', 'project/security/index.html', 'start/install/index.html', '1.2.31/start/install/index.html']) {
			const path = `dist/${prefix}${page}`;
			write(path, readFileSync(join(root, path), 'utf8').replaceAll('value="/', 'value="/website/'));
		}
	}
	assert.equal(checkLocales(root, { base: '/website/' }).locales, 22);
});
