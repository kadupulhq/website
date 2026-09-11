#!/usr/bin/env node
/**
 * Internal link and metadata checks over the built site.
 *
 * Runs against dist/ rather than the markdown, so it sees what a reader sees:
 * a link that resolves in source but not after routing is still broken.
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;

function walk(dir) {
	return readdirSync(dir).flatMap((n) => {
		const p = join(dir, n);
		return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
	});
}

const pages = walk(DIST);
const routes = new Set(pages.map((p) => p.slice(DIST.length).replace(/index\.html$/, '')));

let broken = 0, checked = 0;
const inbound = new Map();

for (const page of pages) {
	const from = page.slice(DIST.length).replace(/index\.html$/, '');
	const html = readFileSync(page, 'utf8');
	for (const m of html.matchAll(/href="(\/[^"#?]*)"/g)) {
		let target = m[1];
		if (!target.endsWith('/')) {
			if (/\.[a-z0-9]{2,5}$/i.test(target)) continue; // asset, not a route
			target += '/';
		}
		checked++;
		const key = target.replace(/^\//, '');
		if (!routes.has(key)) {
			console.error(`BROKEN  ${from || '/'}  ->  ${m[1]}`);
			broken++;
		} else if (key !== from) {
			inbound.set(key, (inbound.get(key) || 0) + 1);
		}
	}
}

const orphans = [...routes].filter(
	(r) => r && !inbound.has(r) && !r.startsWith('1.2.31/') && r !== '404.html/',
);

console.log(`\n${pages.length} pages, ${checked} internal links checked, ${broken} broken`);
if (orphans.length) {
	console.log(`\n${orphans.length} page(s) with no inbound link from anywhere:`);
	for (const o of orphans.sort()) console.log(`   /${o}`);
}
process.exit(broken ? 1 : 0);
