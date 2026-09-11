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
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('../dist/', import.meta.url));

function walk(dir) {
	return readdirSync(dir).flatMap((n) => {
		const p = join(dir, n);
		return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
	});
}

/** Split an href into its path, fragment and query. Returns null for non-routes. */
export function classify(href) {
	if (!href.startsWith('/')) return null;
	const hash = href.indexOf('#');
	const query = href.indexOf('?');
	let cut = href.length;
	if (hash !== -1) cut = Math.min(cut, hash);
	if (query !== -1) cut = Math.min(cut, query);
	let path = href.slice(0, cut);
	const fragment = hash === -1 ? '' : href.slice(hash + 1);
	if (/\.[a-z0-9]{2,5}$/i.test(path) && !path.endsWith('.html')) return null;
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
			const c = classify(m[1]);
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

if (import.meta.url === `file://${process.argv[1]}`) {
	const r = check(DIST);
	if (r.fatal) {
		console.error(`FATAL  ${r.fatal}`);
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
