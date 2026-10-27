import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { parse } from 'parse5';
import { locales, translatedLocales, getMessages } from '../../src/i18n/locales.mjs';

const root = new URL('../../', import.meta.url);
const sourcePath = 'reference/requirements.md';
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const source = read(`src/content/docs/${sourcePath}`);
const sections = (text) => text.split(/^## .+\n/gm).slice(1);
const identifiers = (text) => [...new Set([...text.matchAll(/`([^`]+)`/g)].map((m) => m[1]))].sort();
const manifest = JSON.parse(read('src/i18n/translations.json'));

test('English requirements retain ten sections', () => {
	assert.equal(sections(source).length, 10);
});

for (const locale of translatedLocales) {
	test(`${locale}: full requirements preserve each section's technical identifiers and source tracking`, () => {
		const page = `${locale}/${sourcePath}`;
		const translation = read(`src/content/docs/${page}`);
		const translatedSections = sections(translation);
		assert.equal(translatedSections.length, 10);
		for (const [i, original] of sections(source).entries()) {
			assert.deepEqual(identifiers(translatedSections[i]), identifiers(original), `Section ${i + 1}`);
			assert.notEqual(translatedSections[i].trim(), original.trim(), `Untranslated section ${i + 1}`);
		}
		for (const value of ['8.4', '8.5', '2026', '2027', '2028', '2029']) {
			assert.ok(translatedSections[9].includes(value), `Missing PHP support version/year: ${value}`);
		}
		const links = (text) => [...text.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1].replace(`/${locale}/`, '/')).sort();
		assert.deepEqual(links(translation), links(source), 'References differ from English');
		const { source: trackedSource, sourceSha256, kind } = manifest.pages[page];
		assert.deepEqual({ source: trackedSource, sourceSha256, kind }, {
			source: sourcePath,
			sourceSha256: createHash('sha256').update(source).digest('hex'),
			kind: 'translation',
		});
	});

	test(`${locale}: built requirements use the locale, contain ten sections and avoid English fallback`, () => {
		const html = read(`dist/${locale}/reference/requirements/index.html`);
		const nodes = [];
		const contentHeadings = [];
		function visit(node, inContent = false) {
			if (node.tagName) nodes.push(node);
			inContent ||= node.attrs?.some((a) => a.name === 'class' && a.value.split(/\s+/).includes('sl-markdown-content'));
			if (inContent && node.tagName === 'h2') contentHeadings.push(node);
			for (const child of node.childNodes || []) visit(child, inContent);
		}
		visit(parse(html));
		const attr = (node, name) => node.attrs?.find((a) => a.name === name)?.value;
		const document = nodes.find((node) => node.tagName === 'html');
		assert.equal(attr(document, 'lang'), locales[locale].lang);
		assert.equal(attr(document, 'dir'), locales[locale].dir || 'ltr');
		assert.equal(contentHeadings.length, 10);
		assert.ok(!html.includes(getMessages(locale).fallback), 'English fallback notice on a translated page');
	});
}
