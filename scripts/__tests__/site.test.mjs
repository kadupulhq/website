import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { transform } from '@astrojs/compiler-rs';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { locales, getMessages } from '../../src/i18n/locales.mjs';

// These are framework integration boundaries, not replacements for site code.
// The complete Astro build separately exercises the actual integrations.
const sources = new Map([
	['@astrojs/starlight', "export default options => ({ name: 'starlight', options });"],
	['starlight-versions', "export default options => ({ name: 'versions', options });"],
	['@astrojs/sitemap', "export default options => ({ name: 'sitemap', options });"],
	['astro:content', 'export const defineCollection = options => options;'],
	['@astrojs/starlight/loaders', "export const docsLoader = () => 'docs-loader'; export const i18nLoader = () => 'i18n-loader';"],
	['@astrojs/starlight/schema', "export const docsSchema = () => 'docs-schema'; export const i18nSchema = () => 'i18n-schema';"],
	['@astrojs/starlight/components/Footer.astro', `import {createComponent,render,renderSlot} from 'astro/runtime/server/index.js'; export default createComponent((r,p,s) => render\`<footer data-default-footer>\${renderSlot(r,s.default)}</footer>\`);`],
]);
const stubUrls = new Map([...sources].map(([key, source], i) => [new URL(`stub-${i}.mjs`, import.meta.url).href, source]));
const names = new Map([...sources.keys()].map((key, i) => [key, new URL(`stub-${i}.mjs`, import.meta.url).href]));
const footerUrl = new URL('../../src/components/Footer.astro', import.meta.url).href;
const compiledFooter = await transform(readFileSync(new URL(footerUrl), 'utf8'), { filename: fileURLToPath(footerUrl), sourcemap: 'inline', internalURL: 'astro/compiler-runtime', resultScopedSlot: true, resolvePath: (path) => path });
registerHooks({
	resolve(specifier, context, next) {
		if (names.has(specifier)) return { url: names.get(specifier), shortCircuit: true };
		return next(specifier, context);
	},
	load(url, context, next) {
		if (stubUrls.has(url)) return { format: 'module', source: stubUrls.get(url), shortCircuit: true };
		if (url.includes('Footer.astro?astro&type=style')) return { format: 'module', source: '', shortCircuit: true };
		if (url === footerUrl) {
			return { format: 'module', source: compiledFooter.code, shortCircuit: true };
		}
		return next(url, context);
	},
});

test('site configuration preserves locales, version policy and excludes error pages from the sitemap', async () => {
	const { default: config } = await import('../../astro.config.mjs');
	assert.equal(config.site, 'https://kadupul.net');
	const docs = config.integrations.find((i) => i.name === 'starlight').options;
	assert.deepEqual(docs.locales, locales);
	assert.equal(docs.defaultLocale, 'root');
	assert.equal(docs.components.Footer, './src/components/Footer.astro');
	assert.deepEqual(docs.plugins[0].options.exclude, ['project/**', '*/project/**', '404.md', '*/404.md']);
	assert.equal(docs.sidebar[1].items[2].translations['es-419'], 'Agregar el primer dispositivo');
	const { filter } = config.integrations.find((i) => i.name === 'sitemap').options;
	assert.equal(filter('https://kadupul.net/404.html'), false);
	assert.equal(filter('https://kadupul.net/si/404/'), false);
	assert.equal(filter('https://kadupul.net/si/project/security/'), true);
});

test('content collections use both documentation and translation loaders and schemas', async () => {
	const { collections } = await import('../../src/content.config.ts');
	assert.deepEqual(collections, {
		docs: { loader: 'docs-loader', schema: 'docs-schema' },
		i18n: { loader: 'i18n-loader', schema: 'i18n-schema' },
	});
});

test('the actual footer renders localized licenses and delegates its slot to the framework footer', async () => {
	const { default: Footer } = await import(footerUrl);
	for (const [locale, config] of Object.entries(locales)) {
		const container = await AstroContainer.create({ manifest: { i18n: { defaultLocale: 'en', locales: Object.values(locales).map((l) => l.lang), routing: 'manual' } } });
		const html = await container.renderToString(Footer, {
			request: new Request(`https://kadupul.net/${locale === 'root' ? '' : config.lang + '/'}`),
			slots: { default: '<span>Preserved slot</span>' },
		});
		const t = getMessages(locale);
		assert.ok(html.includes(t.docsLicense), locale);
		assert.ok(html.includes(t.codeLicense), locale);
		assert.ok(html.includes(t.independent), locale);
		assert.match(html, /data-default-footer.*Preserved slot/s);
		assert.match(html, /rel="license" href="https:\/\/creativecommons.org\/licenses\/by-sa\/4.0\/"/);
		assert.match(html, /<bdi[^>]*>GPL-3.0-or-later<\/bdi>/);
	}
});
