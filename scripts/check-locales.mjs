#!/usr/bin/env node
import assert from 'node:assert/strict';
import { readFileSync, existsSync, realpathSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { parse } from 'parse5';
import { locales, translatedLocales, getMessages } from '../src/i18n/locales.mjs';

export function checkLocales(root = fileURLToPath(new URL('../', import.meta.url)), { strictDrift = false } = {}) {
	const dist = join(root, 'dist');
	function elements(html) {
		const nodes = [];
		function visit(node) {
			if (node.tagName) nodes.push(node);
			for (const child of node.childNodes || []) visit(child);
		}
		visit(parse(html));
		return nodes;
	}
	const attr = (node, name) => node.attrs?.find((a) => a.name === name)?.value;
	const text = (node) => node.value || (node.childNodes || []).map(text).join('');
	function read(page) { return readFileSync(join(dist, page), 'utf8'); }
	function assertPage(locale, path) {
		const html = read(path);
		const nodes = elements(html);
		const doc = nodes.find((n) => n.tagName === 'html');
		assert.equal(attr(doc, 'lang'), locales[locale].lang, path);
		assert.equal(attr(doc, 'dir'), locales[locale].dir || 'ltr', path);
		assert.ok(html.includes(getMessages(locale).independent), `Missing localized footer: ${path}`);
		// Language and version switches use option values, not hrefs. Check their
		// destination routes as well as the anchors checked by check-links.mjs.
		for (const option of nodes.filter((n) => n.tagName === 'option')) {
			const value = attr(option, 'value');
			if (!value?.startsWith('/')) continue;
			const route = value.split(/[?#]/)[0].replace(/^\//, '');
			assert.ok(existsSync(join(dist, route, 'index.html')) || (route.endsWith('.html') && existsSync(join(dist, route))), `Missing switch destination ${value} on ${path}`);
		}
		const picker = nodes.find((n) => n.tagName === 'select' && n.childNodes.some((o) => o.tagName === 'option' && text(o) === 'English'));
		assert.ok(picker, `Missing language picker: ${path}`);
		assert.equal(picker.childNodes.filter((n) => n.tagName === 'option').length, Object.keys(locales).length);
		return nodes;
	}

	assertPage('root', 'index.html');
	for (const locale of translatedLocales) {
		assertPage(locale, `${locale}/index.html`);
		assertPage(locale, `${locale}/project/security/index.html`);
		for (const version of ['', '1.2.31/']) {
			const path = `${locale}/${version}start/install/index.html`;
			const nodes = assertPage(locale, path);
			assert.ok(nodes.some((n) => n.tagName === 'span' && text(n) === getMessages(locale).fallback), `Missing English fallback notice: ${path}`);
			const main = nodes.find((n) => n.tagName === 'main');
			assert.equal(attr(main, 'lang'), 'en', `Fallback language: ${path}`);
			assert.equal(attr(main, 'dir'), 'ltr', `Fallback direction: ${path}`);
			assert.ok(read(path).includes(getMessages(locale).reference), `Missing sidebar translation: ${path}`);
		}
		assert.ok(!read(`${locale}/project/security/index.html`).includes('<starlight-version-select>'), `Project policy must stay unversioned: ${locale}`);
	}

	const manifest = JSON.parse(readFileSync(join(root, 'src/i18n/translations.json'), 'utf8'));
	const stale = [];
	for (const [page, entry] of Object.entries(manifest.pages)) {
		assert.ok(existsSync(join(root, 'src/content/docs', page)), `Missing translation: ${page}`);
		const source = readFileSync(join(root, 'src/content/docs', entry.source));
		if (createHash('sha256').update(source).digest('hex') !== entry.sourceSha256) stale.push(page);
	}
	if (strictDrift) assert.deepEqual(stale, [], 'English source changed; review translations');
	return { locales: Object.keys(locales).length, sources: Object.keys(manifest.pages).length, stale };
}

if (process.argv[1] && pathToFileURL(realpathSync(process.argv[1])).href === import.meta.url) {
	const result = checkLocales(undefined, { strictDrift: process.argv.includes('--strict-drift') });
	for (const page of result.stale) console.warn(`STALE translation: ${page}; review against English before updating its source hash`);
	console.log(`${result.locales} locales: routing, direction, navigation, fallback and ${result.sources} translation sources checked`);
}
