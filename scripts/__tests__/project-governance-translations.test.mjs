import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { parse } from 'parse5';
import { locales, translatedLocales, getMessages } from '../../src/i18n/locales.mjs';

const root = new URL('../../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const sections = (text) => text.split(/^## .+\n/gm).slice(1);
const fences = (text) => [...text.matchAll(/^```[^\n]*\n[\s\S]*?^```/gm)].map((m) => m[0]);
const identifiers = (text) => [...new Set([...text.replace(/^```[^\n]*\n[\s\S]*?^```/gm, '').matchAll(/`([^`\n]+)`/g)].map((m) => m[1]))].sort();

const testPages = [
	{ slug: 'license', expectedSections: 4, expectedFences: 0 },
	{ slug: 'contributing', expectedSections: 5, expectedFences: 0 },
	{ slug: 'faq', expectedSections: 4, expectedFences: 0 },
];

for (const { slug, expectedSections, expectedFences } of testPages) {
	const sourcePath = `project/${slug}.md`;
	const source = read(`src/content/docs/${sourcePath}`);

	test(`English ${slug} has ${expectedSections} sections and ${expectedFences} code fences`, () => {
		assert.equal(sections(source).length, expectedSections);
		assert.equal(fences(source).length, expectedFences);
	});

	for (const locale of translatedLocales) {
		test(`${locale}/${slug}: translation preserves sections, commands, identifiers, references and provenance`, () => {
			const page = `${locale}/${sourcePath}`;
			const translation = read(`src/content/docs/${page}`);
			const manifest = JSON.parse(read('src/i18n/translations.json'));

			assert.equal(sections(translation).length, expectedSections);
			assert.deepEqual(fences(translation), fences(source));

			for (const [i, original] of sections(source).entries()) {
				assert.deepEqual(
					identifiers(sections(translation)[i]),
					identifiers(original),
					`Section ${i + 1} identifiers differ from English in ${locale}/${slug}`
				);
				assert.notEqual(
					sections(translation)[i].trim(),
					original.trim(),
					`Section ${i + 1} appears untranslated in ${locale}/${slug}`
				);
			}

			const links = (text) => [...text.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1].replace(`/${locale}/`, '/')).sort();
			assert.deepEqual(links(translation), links(source), `Links differ from English in ${locale}/${slug}`);

			const { source: trackedSource, sourceSha256, kind } = manifest.pages[page] || {};
			assert.deepEqual(
				{ source: trackedSource, sourceSha256, kind },
				{
					source: sourcePath,
					sourceSha256: createHash('sha256').update(source).digest('hex'),
					kind: 'translation',
				},
				`Manifest entry invalid for ${page}`
			);
		});

		test(`${locale}/${slug}: rendered page uses its language and direction with all sections`, () => {
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
			assert.equal(headings.length, expectedSections);
			assert.ok(!html.includes(getMessages(locale).fallback), `English fallback notice rendered in ${locale}/${slug}`);
		});
	}
}
