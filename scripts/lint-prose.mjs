#!/usr/bin/env node
/**
 * Prose checks the build cannot make. Fails on the tells that make documentation
 * read as generated, and on frontmatter a page needs to be findable.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';
import { isMain } from './cli.mjs';
import { translatedLocales } from '../src/i18n/locales.mjs';

const DEFAULT_ROOT = fileURLToPath(new URL('../src/content/docs/', import.meta.url));

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

export function lintProse(ROOT) {
	const issues = [];
	for (const file of walk(ROOT)) {
		const rel = relative(ROOT, file);
		const isEnglish = !translatedLocales.includes(rel.split(/[\\/]/)[0]);
		const text = readFileSync(file, 'utf8');
		const report = (line, msg) => { issues.push(`${rel}:${line}  ${msg}`); };

		if (!text.startsWith('---\n')) report(1, 'missing frontmatter');
		const fmEnd = text.indexOf('\n---\n', 4);
		if (text.startsWith('---\n') && fmEnd === -1) {
			report(1, 'unterminated frontmatter');
			continue;
		}
		const fm = text.slice(4, fmEnd);
		if (!/^title:/m.test(fm)) report(1, 'frontmatter has no title');
		if (!/^description:/m.test(fm)) report(1, 'frontmatter has no description');

		// Heading checks. Starlight renders the frontmatter title as the page h1,
		// so an h1 in the body makes a second one. Code fences are skipped because
		// a shell comment starts with the same character as a heading.
		const bodyStart = fmEnd + 5;
		const bodyOffset = text.slice(0, bodyStart).split('\n').length - 1;
		const body = text.slice(bodyStart);
		let fence = null;
		let seenH2 = false;
		body.split('\n').forEach((line, bi) => {
			const lineNo = bodyOffset + bi + 1;
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
			if (level === 1) report(lineNo, 'h1 in body; the frontmatter title is the h1');
			if (level === 2) seenH2 = true;
			if (level === 3 && !seenH2) report(lineNo, 'h3 before any h2');
		});

		text.split('\n').forEach((line, i) => {
			const n = i + 1;
			if (!isEnglish) return; // English editorial rules do not apply to translations.
			if (line.includes('—')) report(n, 'em dash');
			// Skip fenced code and link targets when matching prose.
			const prose = line.replace(/`[^`]*`/g, '').replace(/\]\([^)]*\)/g, ']');
			for (const word of BANNED) {
				if (new RegExp(`\\b${word}\\b`, 'i').test(prose)) report(n, `banned: "${word}"`);
			}
		});
	}

	return issues;
}

if (isMain(import.meta.url)) {
	const issues = lintProse(process.argv[2] || DEFAULT_ROOT);
	for (const issue of issues) console.error(issue);
	if (issues.length) {
		console.error(`\n${issues.length} prose issue(s).`);
		process.exitCode = 1;
	} else console.log('prose checks passed');
}
