#!/usr/bin/env node
/**
 * Prose checks the build cannot make. Fails on the tells that make documentation
 * read as generated, and on frontmatter a page needs to be findable.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('../src/content/docs/', import.meta.url).pathname;

const BANNED = [
	'comprehensive', 'robust', 'seamless', 'powerful', 'leverage', 'delve',
	'crucial', 'pivotal', 'vital', 'underscores', 'highlights', 'showcases',
	'exemplifies', 'fosters', 'tapestry', 'testament', 'notably',
	'it should be noted', 'essentially', 'of course', 'furthermore', 'moreover',
	'in conclusion', 'hope this helps',
];

function walk(dir) {
	return readdirSync(dir).flatMap((name) => {
		const p = join(dir, name);
		return statSync(p).isDirectory() ? walk(p) : p.endsWith('.md') || p.endsWith('.mdx') ? [p] : [];
	});
}

let failures = 0;
for (const file of walk(ROOT)) {
	const rel = relative(ROOT, file);
	const text = readFileSync(file, 'utf8');
	const report = (line, msg) => { console.error(`${rel}:${line}  ${msg}`); failures++; };

	if (!text.startsWith('---\n')) report(1, 'missing frontmatter');
	const fm = text.slice(4, text.indexOf('\n---\n', 4));
	if (!/^title:/m.test(fm)) report(1, 'frontmatter has no title');
	if (!/^description:/m.test(fm)) report(1, 'frontmatter has no description');

	// Heading checks. Starlight renders the frontmatter title as the page h1,
	// so an h1 in the body makes a second one. Code fences are skipped because
	// a shell comment starts with the same character as a heading.
	const body = text.slice(text.indexOf('\n---\n', 4) + 5);
	let fence = null;
	let seenH2 = false;
	body.split('\n').forEach((line) => {
		const t = line.trim();
		if (t.startsWith('```') || t.startsWith('~~~')) {
			const tok = t.slice(0, 3);
			fence = fence === tok ? null : fence ?? tok;
			return;
		}
		if (fence) return;
		const h = line.match(/^(#{1,4})\s/);
		if (!h) return;
		const level = h[1].length;
		if (level === 1) report(0, 'h1 in body; the frontmatter title is the h1');
		if (level === 2) seenH2 = true;
		if (level === 3 && !seenH2) report(0, 'h3 before any h2');
	});

	text.split('\n').forEach((line, i) => {
		const n = i + 1;
		if (line.includes('—')) report(n, 'em dash');
		// Skip fenced code and link targets when matching prose.
		const prose = line.replace(/`[^`]*`/g, '').replace(/\]\([^)]*\)/g, ']');
		for (const word of BANNED) {
			if (new RegExp(`\\b${word}\\b`, 'i').test(prose)) report(n, `banned: "${word}"`);
		}
	});
}

if (failures) {
	console.error(`\n${failures} prose issue(s).`);
	process.exit(1);
}
console.log('prose checks passed');
