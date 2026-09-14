import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { checkLocales } from '../check-locales.mjs';
import { locales, translatedLocales, getMessages } from '../../src/i18n/locales.mjs';

function fixture(t) {
	const root = mkdtempSync(join(tmpdir(), 'locale-check-'));
	t.after(() => rmSync(root, { recursive: true, force: true }));
	const write = (path, data) => {
		mkdirSync(join(root, path, '..'), { recursive: true });
		writeFileSync(join(root, path), data);
	};
	for (const [locale, config] of Object.entries(locales)) {
		const prefix = locale === 'root' ? '' : `${locale}/`;
		const t = getMessages(locale);
		const options = Object.entries(locales).map(([key, value]) => `<option value="/${key === 'root' ? '' : key + '/'}">${value.label}</option>`).join('');
		const html = `<html lang="${config.lang}" dir="${config.dir || 'ltr'}"><body><select>${options}</select><p>${t.independent}</p><main lang="en" dir="ltr"><span>${t.fallback}</span><h2>${t.reference}</h2></main></body></html>`;
		for (const path of ['index.html', 'project/security/index.html', 'start/install/index.html', '1.2.31/start/install/index.html']) write(`dist/${prefix}${path}`, html);
	}
	write('src/content/docs/project/security.md', 'English source');
	write('src/content/docs/es/project/security.md', 'Resumen');
	write('src/i18n/translations.json', JSON.stringify({ pages: { 'es/project/security.md': { source: 'project/security.md', sourceSha256: createHash('sha256').update('English source').digest('hex') } } }));
	return { root, write };
}

test('locale validator accepts all locales and warns on source drift unless strict', (t) => {
	const { root, write } = fixture(t);
	assert.equal(checkLocales(root).locales, translatedLocales.length + 1);
	assert.deepEqual(checkLocales(root).stale, []);
	write('src/content/docs/project/security.md', 'Urgent English correction');
	assert.deepEqual(checkLocales(root).stale, ['es/project/security.md']);
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
