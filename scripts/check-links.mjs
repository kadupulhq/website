#!/usr/bin/env node
/**
 * Internal link and orphan checks over the built site.
 *
 * Runs against dist/ rather than the markdown, so it sees what a reader sees.
 *
 * The contract that matters is that this cannot report success without having
 * checked anything. An earlier version excluded `#` from the href character
 * class, which made the pattern fail to match the whole attribute instead of
 * truncating, so every anchor link was skipped while the summary still printed
 * a count. A gate that fails open is worse than no gate.
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const DIST = process.env.CHECK_LINKS_DIST
	? (process.env.CHECK_LINKS_DIST.endsWith('/') ? process.env.CHECK_LINKS_DIST : process.env.CHECK_LINKS_DIST + '/')
	: fileURLToPath(new URL('../dist/', import.meta.url));

function walk(dir) {
	return readdirSync(dir).flatMap((n) => {
		const p = join(dir, n);
		return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
	});
}

/** Extensions that are files rather than routes. Anything else falls through to
 *  the route lookup, so a path like /1.2.31 is not mistaken for an asset. */
const ASSET_EXT = new Set([
	'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'avif', 'ico', 'css', 'js', 'mjs',
	'json', 'xml', 'txt', 'woff', 'woff2', 'ttf', 'otf', 'eot', 'pdf', 'zip', 'gz',
	'map', 'webmanifest',
]);

/** Split an href into its path, fragment and query. Returns null for non-routes.
 *  `from` supplies the current page so a same-page "#x" resolves against it. */
export function classify(href, from = '') {
	if (href.startsWith('#')) {
		return { path: '/' + from, fragment: href.slice(1), samePage: true };
	}
	if (!href.startsWith('/')) return null;
	const hash = href.indexOf('#');
	const query = href.indexOf('?');
	let cut = href.length;
	if (hash !== -1) cut = Math.min(cut, hash);
	if (query !== -1) cut = Math.min(cut, query);
	let path = href.slice(0, cut);
	const fragment = hash === -1 ? '' : href.slice(hash + 1);
	const suffix = path.split('/').pop().split('.');
	if (suffix.length > 1 && ASSET_EXT.has(suffix.pop().toLowerCase())) return null;
	if (!path.endsWith('/') && !path.endsWith('.html')) path += '/';
	return { path, fragment };
}

export function check(dist) {
	if (!existsSync(dist)) {
		return { fatal: `no build at ${dist}; run the build first` };
	}
	const pages = walk(dist);
	if (pages.length === 0) {
		return { fatal: `no HTML under ${dist}; the build produced nothing` };
	}

	const routes = new Set(pages.map((p) => p.slice(dist.length).replace(/index\.html$/, '')));
	const ids = new Map();
	for (const p of pages) {
		const key = p.slice(dist.length).replace(/index\.html$/, '');
		const html = readFileSync(p, 'utf8');
		ids.set(key, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
	}

	const broken = [];
	const inbound = new Map();
	let checked = 0;
	let fragmentsChecked = 0;

	for (const p of pages) {
		const from = p.slice(dist.length).replace(/index\.html$/, '');
		const html = readFileSync(p, 'utf8');
		for (const m of html.matchAll(/href="([^"]*)"/g)) {
			const c = classify(m[1], from);
			if (!c) continue;
			checked++;
			const key = c.path.replace(/^\//, '');
			if (!routes.has(key)) {
				broken.push(`${from || '/'}  ->  ${m[1]}  (no such route)`);
				continue;
			}
			if (key !== from) inbound.set(key, (inbound.get(key) || 0) + 1);
			if (c.fragment) {
				fragmentsChecked++;
				if (!ids.get(key)?.has(c.fragment)) {
					broken.push(`${from || '/'}  ->  ${m[1]}  (no such anchor on target)`);
				}
			}
		}
	}

	const orphans = [...routes].filter(
		(r) => r && r !== '404.html' && !r.startsWith('1.2.31/') && !inbound.has(r),
	);
	return { pages: pages.length, checked, fragmentsChecked, broken, orphans };
}

// pathToFileURL, not string concatenation: import.meta.url is percent-encoded
// and resolved through symlinks, so a naive compare can silently skip this
// block and exit 0 having checked nothing.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
	const r = check(DIST);
	if (r.fatal) {
		console.error(`FATAL  ${r.fatal}`);
		process.exit(2);
	}
	if (r.checked === 0) {
		console.error('FATAL  no internal links were checked; the pattern or the build is wrong');
		process.exit(2);
	}
	for (const b of r.broken) console.error(`BROKEN  ${b}`);
	console.log(
		`\n${r.pages} pages, ${r.checked} internal links checked ` +
			`(${r.fragmentsChecked} with anchors), ${r.broken.length} broken`,
	);
	if (r.orphans.length) {
		console.log(`\n${r.orphans.length} page(s) with no inbound link:`);
		for (const o of r.orphans.sort()) console.log(`   /${o}`);
	}
	process.exit(r.broken.length ? 1 : 0);
}
