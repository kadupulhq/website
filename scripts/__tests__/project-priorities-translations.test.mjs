import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { parse } from 'parse5';
import { locales, translatedLocales, getMessages } from '../../src/i18n/locales.mjs';

const root = new URL('../../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const manifest = JSON.parse(read('src/i18n/translations.json'));
const sections = (text) => text.split(/^## .+\n/gm).slice(1);
const identifiers = (text) => [...new Set([...text.matchAll(/`([^`\n]+)`/g)].map((m) => m[1]))].sort();

for (const [slug, count] of [['why-this-fork', 2], ['compatibility-with-cacti', 3]]) {
	const sourcePath = `project/${slug}.md`;
	const source = read(`src/content/docs/${sourcePath}`);
	test(`${slug}: English retains the selected section count`, () => {
		assert.equal(sections(source).length, count);
	});
	for (const locale of translatedLocales) {
		test(`${locale}/${slug}: full translation retains identifiers, references and source tracking`, () => {
			const page = `${locale}/${sourcePath}`;
			const translation = read(`src/content/docs/${page}`);
			const translatedSections = sections(translation);
			assert.equal(translatedSections.length, count);
			for (const [i, original] of sections(source).entries()) {
				assert.deepEqual(identifiers(translatedSections[i]), identifiers(original));
				assert.notEqual(translatedSections[i].trim(), original.trim());
			}
			if (slug === 'why-this-fork') {
				for (const value of ['8.4+', '7.4']) assert.ok(translatedSections[0].includes(value));
			}
			assert.ok(translation.includes('The Cacti Group'));
			const links = (text) => [...text.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1].replace(`/${locale}/`, '/')).sort();
			assert.deepEqual(links(translation), links(source));
			const { source: trackedSource, sourceSha256, kind } = manifest.pages[page];
			assert.deepEqual({ source: trackedSource, sourceSha256, kind }, {
				source: sourcePath,
				sourceSha256: createHash('sha256').update(source).digest('hex'),
				kind: 'translation',
			});
		});
		test(`${locale}/${slug}: rendered policy is unversioned and uses its own language and direction`, () => {
			const html = read(`dist/${locale}/project/${slug}/index.html`);
			const nodes = [];
			const headings = [];
			function visit(node, inContent = false) {
				if (node.tagName) nodes.push(node);
				inContent ||= node.attrs?.some((a) => a.name === 'class' && a.value.split(/\s+/).includes('sl-markdown-content'));
				if (inContent && node.tagName === 'h2') headings.push(node);
				for (const child of node.childNodes || []) visit(child, inContent);
			}
			visit(parse(html));
			const attr = (node, name) => node.attrs?.find((a) => a.name === name)?.value;
			const document = nodes.find((node) => node.tagName === 'html');
			assert.equal(attr(document, 'lang'), locales[locale].lang);
			assert.equal(attr(document, 'dir'), locales[locale].dir || 'ltr');
			assert.equal(headings.length, count);
			assert.ok(!html.includes(getMessages(locale).fallback));
			assert.ok(!html.includes('<starlight-version-select>'));
		});
	}
}
