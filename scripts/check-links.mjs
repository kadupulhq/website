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
import { readdirSync, readFileSync, statSync, lstatSync, existsSync, realpathSync } from 'node:fs';
import { join, resolve, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Taken from argv, not the environment: an ambient variable must not be able to
// redirect what a release gate inspects.
const DIST = process.argv[2] || fileURLToPath(new URL('../dist/', import.meta.url));

/**
 * Every regular file under the build, following no symlinks.
 *
 * lstat, not stat: a symlinked directory inside dist would otherwise contribute
 * out-of-build pages to the route set, so links that 404 in production would
 * read as valid. Skipping links also makes a cycle impossible, which previously
 * crashed with exit 1, the same status as "broken links found".
 */
function walk(dir, acc = { files: [], skipped: [] }) {
	for (const name of readdirSync(dir)) {
		const p = join(dir, name);
		const st = lstatSync(p);
		if (st.isSymbolicLink()) {
			// Recorded, not silently dropped. Following it would let out-of-build
			// pages satisfy links; ignoring it would hide every link inside the
			// tree. Coverage the checker cannot claim must not read as a pass, so
			// the caller turns a content-bearing symlink into a fatal.
			acc.skipped.push(p);
			continue;
		}
		if (st.isDirectory()) walk(p, acc);
		else if (st.isFile()) acc.files.push(p);
	}
	return acc;
}

/** Split an href into its path, fragment and query. Returns null for non-routes.
 *  `from` supplies the current page so a same-page "#x" resolves against it. */
export function classify(href, from = '') {
	if (href.startsWith('#')) {
		let f = href.slice(1);
		try { f = decodeURIComponent(f); } catch { /* keep raw */ }
		f = f.normalize('NFC');
		return { path: '/' + from, fragment: f, samePage: true, dotted: false };
	}
	if (href.startsWith('//')) return null; // protocol-relative, external
	if (!href.startsWith('/')) return null;
	const hash = href.indexOf('#');
	const query = href.indexOf('?');
	let cut = href.length;
	if (hash !== -1) cut = Math.min(cut, hash);
	if (query !== -1) cut = Math.min(cut, query);
	let path = href.slice(0, cut);
	// Decode, but do not normalise. A static host resolves a request against the
	// stored filename bytes, so folding both sides would make a real mismatch
	// compare equal. Normalisation is retried explicitly on a literal miss.
	try { path = decodeURIComponent(path); } catch { /* keep raw */ }
	let fragment = hash === -1 ? '' : href.slice(hash + 1);
	// ids in the HTML are literal; hrefs may be percent-encoded.
	try { fragment = decodeURIComponent(fragment); } catch { /* keep raw */ }
	fragment = fragment.normalize('NFC');
	// Whether a dotted path is an asset or a route is decided by the build, not
	// by an extension list that goes stale the first time someone adds a feed.
	const dotted = /\.[^/]+$/.test(path);
	if (!dotted && !path.endsWith('/')) path += '/';
	return { path, fragment, dotted };
}

export function check(dist) {
	if (!existsSync(dist)) {
		return { fatal: `no build at ${dist}; run the build first` };
	}
	// Normalise once. Deriving keys by slicing the caller's raw string corrupts
	// every route when the path carries ./ or ../ or lacks a trailing slash.
	let root;
	try {
		root = realpathSync(resolve(dist));
		if (!statSync(root).isDirectory()) {
			return { fatal: `${dist} is not a directory` };
		}
	} catch {
		return { fatal: `cannot read ${dist}` };
	}
	const key0 = (p) => relative(root, p).split(sep).join('/');
	let files, skipped;
	try {
		({ files, skipped } = walk(root));
	} catch (e) {
		// An I/O error must not surface as exit 1, which is "broken links found".
		return { fatal: `cannot read the build: ${e.message}` };
	}
	for (const link of skipped) {
		let target, st;
		try {
			target = realpathSync(link);
			st = statSync(target);
		} catch {
			continue; // dangling: carries nothing, so no coverage is lost
		}
		// A link pointing back inside the build reaches content the walk already
		// covered, including a self-referential cycle. Only a target outside the
		// root is coverage this run cannot account for.
		if (target === root || target.startsWith(root + sep)) continue;
		if (st.isDirectory() || target.endsWith('.html')) {
			return { fatal: `symlink leaves the build and carries pages that cannot be checked: ${key0(link)}` };
		}
	}
	const assets = new Set(files.map(key0));
	const assetsNFC = new Map(files.map((p) => [key0(p).normalize('NFC'), key0(p)]));
	const pages = files.filter((p) => p.endsWith('.html'));
	if (pages.length === 0) {
		return { fatal: `no HTML under ${dist}; the build produced nothing` };
	}

	const routes = new Set(pages.map((p) => key0(p).replace(/(^|\/)index\.html$/, '$1')));
	const routesNFC = new Map(
		[...routes].map((r) => [r.normalize('NFC'), r]),
	);
	const ids = new Map();
	for (const p of pages) {
		const key = key0(p).replace(/(^|\/)index\.html$/, '$1');
		const html = readFileSync(p, 'utf8');
		ids.set(key, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1].normalize('NFC'))));
	}

	const broken = [];
	const inbound = new Map();
	let checked = 0;
	let fragmentsChecked = 0;

	for (const p of pages) {
		const from = key0(p).replace(/(^|\/)index\.html$/, '$1');
		const html = readFileSync(p, 'utf8');
		for (const m of html.matchAll(/href="([^"]*)"/g)) {
			const c = classify(m[1], from);
			if (!c) continue;
			// Normalise the same way routes are built, so an explicit
			// /sub/index.html link resolves to the same key as /sub/.
			let key = c.path.replace(/^\//, '').replace(/(^|\/)index\.html$/, '$1');
			// A dotted path is an asset only when it is a regular file inside the
			// build. existsSync alone is true for directories, which silently
			// swallowed links to dotted directories like the version tree, and it
			// also followed ../ above the build root.
			if (c.dotted && !routes.has(key) && !routes.has(key + '/')) {
				if (assets.has(key)) continue;
				// A normalisation-only asset match is reported, not skipped.
				if (assetsNFC.has(key.normalize('NFC'))) {
					checked++;
					broken.push(`${from || '/'}  ->  ${m[1]}  (unicode normalisation mismatch)`);
					continue;
				}
			}
			// A dotted path that is not a file may still be a route directory.
			if (c.dotted && !routes.has(key) && routes.has(key + '/')) key += '/';
			checked++;
			if (!routes.has(key)) {
				const viaNFC = routesNFC.get(key.normalize('NFC'));
				if (viaNFC !== undefined) {
					broken.push(
						`${from || '/'}  ->  ${m[1]}  (unicode normalisation mismatch with ${viaNFC})`,
					);
				} else {
					broken.push(`${from || '/'}  ->  ${m[1]}  (no such route)`);
				}
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
// Both sides must be realpath-resolved. Node resolves the main entry through
// realpath, so on macOS a /var path (a symlink to /private/var) makes a naive
// compare false and silently skips this whole block. Proven, not assumed.
const entry = process.argv[1] ? pathToFileURL(realpathSync(process.argv[1])).href : '';
if (import.meta.url === entry) {
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
