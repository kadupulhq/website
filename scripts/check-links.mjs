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
import realFs from 'node:fs';
import { parseArgs } from 'node:util';
import { base as siteBase } from '../src/site.mjs';
import { isMain } from './cli.mjs';
import { isUtilityRoute } from '../src/i18n/routes.mjs';
import { join, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'parse5';

// Taken from argv, not the environment: an ambient variable must not be able to
// redirect what a release gate inspects.
const DIST = fileURLToPath(new URL('../dist/', import.meta.url));

/**
 * Every regular file under the build, following no symlinks.
 *
 * lstat, not stat: a symlinked directory inside dist would otherwise contribute
 * out-of-build pages to the route set, so links that 404 in production would
 * read as valid. Skipping links also makes a cycle impossible, which previously
 * crashed with exit 1, the same status as "broken links found".
 */
function walk(dir, fs, acc = { files: [], skipped: [] }) {
	for (const name of fs.readdirSync(dir)) {
		const p = join(dir, name);
		const st = fs.lstatSync(p);
		if (st.isSymbolicLink()) {
			// Recorded, not silently dropped. Following it would let out-of-build
			// pages satisfy links; ignoring it would hide every link inside the
			// tree. Coverage the checker cannot claim must not read as a pass, so
			// the caller turns a content-bearing symlink into a fatal.
			acc.skipped.push(p);
			continue;
		}
		if (st.isDirectory()) walk(p, fs, acc);
		else if (st.isFile()) acc.files.push(p);
	}
	return acc;
}

/** Split an href into its path, fragment and query. Returns null for non-routes.
 *  `from` supplies the current page so a same-page "#x" resolves against it. */
export function classify(href, from = '') {
	href = href.replace(/[\t\n\r]/g, '').trim();
	// Browsers treat backslashes as slashes in HTTP(S) authority prefixes.
	if (/^[\\/]{2}/.test(href)) return null;
	if (href.startsWith('#')) {
		let f = href.slice(1);
		try { f = decodeURIComponent(f); } catch { /* keep raw */ }
		return { path: '/' + from, fragment: f, samePage: true, dotted: false };
	}
	if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return null;
	// Resolve relative and query-only references as a browser does, using the
	// current route as the base. They are internal links too.
	if (!href.startsWith('/')) {
		const url = new URL(href, 'https://linkcheck.invalid/' + from);
		if (url.origin !== 'https://linkcheck.invalid') return null;
		href = url.pathname + url.search + url.hash;
	}
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
	// Whether a dotted path is an asset or a route is decided by the build, not
	// by an extension list that goes stale the first time someone adds a feed.
	const dotted = /\.[^/]+$/.test(path);
	if (!dotted && !path.endsWith('/')) path += '/';
	return { path, fragment, dotted };
}

function inspectBuild(dist, fs) {
	if (!fs.existsSync(dist)) {
		return { fatal: `no build at ${dist}; run the build first` };
	}
	// Normalise once. Deriving keys by slicing the caller's raw string corrupts
	// every route when the path carries ./ or ../ or lacks a trailing slash.
	let root;
	try {
		root = fs.realpathSync(resolve(dist));
		if (!fs.statSync(root).isDirectory()) {
			return { fatal: `${dist} is not a directory` };
		}
	} catch {
		return { fatal: `cannot read ${dist}` };
	}
	const key0 = (p) => relative(root, p).split(sep).join('/');
	let files, skipped;
	try {
		({ files, skipped } = walk(root, fs));
	} catch (e) {
		// An I/O error must not surface as exit 1, which is "broken links found".
		return { fatal: `cannot read the build: ${e.message}` };
	}
	return { root, key0, files, skipped };
}

function collectAliases(root, skipped, key0, fs) {
	const aliases = [];
	for (const link of skipped) {
		let target, st;
		try {
			target = fs.realpathSync(link);
			st = fs.statSync(target);
		} catch {
			continue; // dangling: carries nothing, so no coverage is lost
		}
		// A link pointing back inside the build reaches content the walk already
		// covered, including a self-referential cycle. Record it as an alias so
		// the path it is served under still resolves; skipping it outright turned
		// a valid /latest/ into a false broken link.
		if (target === root || target.startsWith(root + sep)) {
			aliases.push([key0(link), key0(target)]);
			continue;
		}
		if (st.isDirectory() || target.endsWith('.html')) {
			return { fatal: `symlink leaves the build and carries pages that cannot be checked: ${key0(link)}` };
		}
	}
	return { aliases };
}

function buildAssets(files, key0, aliases) {
	const assets = new Set(files.map(key0));
	// Expand each in-build symlink into the keys it serves.
	for (const [from, to] of aliases) {
		for (const k of [...assets]) {
			if (k === to) assets.add(from);
			else if (k.startsWith(to + '/')) assets.add(from + k.slice(to.length));
		}
	}
	return assets;
}

function buildPages(pages, key0, aliases) {
	const servedPages = new Map(pages.map((p) => [key0(p), p]));
	for (const [from, to] of aliases) {
		// Snapshot before adding routes: iterating the live map would follow
		// a self-referential directory alias indefinitely.
		const existingPages = new Map(servedPages);
		for (const [path, file] of existingPages) {
			if (path === to) servedPages.set(from, file);
			else if (to === '') servedPages.set(from + '/' + path, file);
			else if (path.startsWith(to + '/')) servedPages.set(from + path.slice(to.length), file);
		}
	}
	return servedPages;
}

function readPages(servedPages, fs) {
	const ids = new Map();
	const links = new Map();
	for (const [servedPath, p] of servedPages) {
		const key = servedPath.replace(/(^|\/)index\.html$/, '$1');
		const html = fs.readFileSync(p, 'utf8');
		const found = [];
		const hrefs = [];
		// HTML parsing handles entity decoding, single/unquoted attributes and
		// case folding, without treating comments or script text as live links.
		const visit = (node) => {
			for (const attr of node.attrs || []) {
				if (attr.name === 'id') found.push(attr.value);
				if (attr.name === 'href') hrefs.push(attr.value);
			}
			for (const child of node.childNodes || []) visit(child);
		};
		visit(parse(html));
		links.set(key, hrefs);
		ids.set(key, { literal: new Set(found), nfc: new Set(found.map((i) => i.normalize('NFC'))) });
	}
	return { ids, links };
}

function checkAsset(c, key, state, label, result) {
	if (!c.dotted || state.routes.has(key) || state.routes.has(key + '/')) return false;
	if (state.assets.has(key)) return true;
	if (!state.assetsNFC.has(key.normalize('NFC'))) return false;
	result.checked++;
	result.broken.push(`${label}  (unicode normalisation mismatch)`);
	return true;
}

function checkFragment(fragment, target, label, result) {
	if (!fragment) return;
	result.fragmentsChecked++;
	if (target.literal.has(fragment)) return;
	// Compare literal IDs first: normalization must not conceal browser failures.
	const reason = target.nfc.has(fragment.normalize('NFC'))
		? 'unicode normalisation mismatch with the id' : 'no such anchor on target';
	result.broken.push(`${label}  (${reason})`);
}

function checkHref(from, href, state, result) {
	const c = classify(href, from);
	if (!c) return;
	const label = `${from || '/'}  ->  ${href}`;
	let key = c.path.replace(/^\//, '').replace(/(^|\/)index\.html$/, '$1');
	if (checkAsset(c, key, state, label, result)) return;
	// Dotted paths may be directories, as with archived version routes.
	if (c.dotted && !state.routes.has(key) && state.routes.has(key + '/')) key += '/';
	result.checked++;
	if (!state.routes.has(key)) {
		const viaNFC = state.routesNFC.get(key.normalize('NFC'));
		const reason = viaNFC === undefined ? 'no such route' : `unicode normalisation mismatch with ${viaNFC}`;
		result.broken.push(`${label}  (${reason})`);
		return;
	}
	if (key !== from) state.inbound.add(key);
	checkFragment(c.fragment, state.ids.get(key), label, result);
}

export function check(dist, fs = realFs, base = '/') {
	const build = inspectBuild(dist, fs);
	if (build.fatal) return build;
	const { root, key0, files, skipped } = build;
	const aliasResult = collectAliases(root, skipped, key0, fs);
	if (aliasResult.fatal) return aliasResult;
	const { aliases } = aliasResult;
	const pages = files.filter((p) => p.endsWith('.html'));
	if (pages.length === 0) return { fatal: `no HTML under ${dist}; the build produced nothing` };
	// Expand aliases in filesystem space before mounting the build at its URL base.
	const prefix = base.slice(1);
	const assets = new Set([...buildAssets(files, key0, aliases)].map((k) => prefix + k));
	const assetsNFC = new Map(files.map((p) => [(prefix + key0(p)).normalize('NFC'), prefix + key0(p)]));
	const servedPages = new Map([...buildPages(pages, key0, aliases)].map(([k, p]) => [prefix + k, p]));
	const routes = new Set([...servedPages.keys()].map((p) => p.replace(/(^|\/)index\.html$/, '$1')));
	const routesNFC = new Map([...routes].map((r) => [r.normalize('NFC'), r]));
	const { ids, links } = readPages(servedPages, fs);
	const inbound = new Set();
	const state = { routes, routesNFC, assets, assetsNFC, ids, inbound };
	const result = { pages: servedPages.size, checked: 0, fragmentsChecked: 0, broken: [] };
	for (const [from, hrefs] of links) {
		for (const href of hrefs) checkHref(from, href, state, result);
	}
	const orphans = [...routes].filter((r) => r !== prefix && !isUtilityRoute(r.slice(prefix.length)) && !inbound.has(r));
	return { ...result, orphans };
}

if (isMain(import.meta.url)) {
	const { values, positionals } = parseArgs({ allowPositionals: true, options: { base: { type: 'string', default: siteBase } } });
	const r = check(positionals[0] || DIST, realFs, values.base);
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
