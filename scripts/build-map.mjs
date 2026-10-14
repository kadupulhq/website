#!/usr/bin/env node
/**
 * Generates the documentation map from the pages themselves.
 *
 * A hand-written index drifts as pages change. This reads each
 * page's own title and description, so the map cannot describe a page that
 * does not exist or miss one that does.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { isMain } from './cli.mjs';
import { getMessages, translatedLocales } from '../src/i18n/locales.mjs';

const DEFAULT_DOCS = fileURLToPath(new URL('../src/content/docs/', import.meta.url));

const SECTIONS = [
	['start', 'Start here', 'Read in order, once. Takes you from nothing to a graph you can read.'],
	['guides', 'How-to guides', 'Task pages for someone who already has it running and has a specific goal.'],
	['concepts', 'Concepts', 'Why the system works the way it does. Read for understanding, not to perform a task.'],
	['reference', 'Reference', 'Looked up, not read through. Precise and scannable.'],
	['project', 'Project', 'What this project is, where it stands, and the terms it is offered under.'],
];

export function frontmatter(file) {
	const text = readFileSync(file, 'utf8');
	if (!text.startsWith('---\n') || !text.includes('\n---\n', 4)) return null;
	const block = text.slice(4, text.indexOf('\n---\n', 4));
	const grab = (key) => {
		const line = block.split('\n').find((value) => value.startsWith(key + ':'));
		return (line?.slice(key.length + 1).trim() || '').replace(/^['"]|['"]$/g, '');
	};
	const order = /^[ \t]+order:[ \t]*(\d+)/m.exec(block);
	return { title: grab('title'), description: grab('description'), order: order ? +order[1] : 999 };
}

function readSection(DOCS, dir) {
	try {
		return readdirSync(join(DOCS, dir)).filter((file) => file.endsWith('.md') || file.endsWith('.mdx'));
	} catch (error) {
		if (error.code === 'ENOENT') return null;
		throw error;
	}
}

function readTranslation(DOCS, locale, dir, file) {
	try { return frontmatter(join(DOCS, locale, dir, file)); }
	catch (error) { if (error.code !== 'ENOENT') throw error; return null; }
}

function englishSection(DOCS, { dir, heading, blurb, files }) {
	const pages = files.flatMap((file) => {
		const metadata = frontmatter(join(DOCS, dir, file));
		return metadata?.title ? [{ slug: file.replace(/\.mdx?$/, ''), ...metadata }] : [];
	}).sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
	let out = `## ${heading}\n\n${blurb}\n\n`;
	for (const page of pages) {
		const description = page.description ? '. ' + page.description : '';
		out += `- [${page.title}](/${dir}/${page.slug}/)${description}\n`;
	}
	return out + '\n';
}

function translatedMap(DOCS, locale, sections) {
	const t = getMessages(locale);
	let out = `---\ntitle: ${JSON.stringify(t.map)}\ndescription: ${JSON.stringify(t.mapDescription)}\nsidebar:\n  order: 0\n---\n\n${t.fallback}\n\n`;
	for (const [dir] of SECTIONS) {
		out += `## ${t[dir]}\n\n`;
		const files = sections.find((section) => section.dir === dir)?.files || [];
		for (const file of files.toSorted()) {
			const original = frontmatter(join(DOCS, dir, file));
			if (!original?.title) continue;
			const local = readTranslation(DOCS, locale, dir, file);
			const title = local?.title || original.title + ' (English)';
			out += `- [${title}](/${locale}/${dir}/${file.replace(/\.mdx?$/, '')}/)\n`;
		}
		out += '\n';
	}
	return out;
}

function renderMaps(DOCS, localeNames) {
	const sections = SECTIONS.flatMap(([dir, heading, blurb]) => {
		const files = readSection(DOCS, dir);
		return files ? [{ dir, heading, blurb, files }] : [];
	});
	const english = `---
title: Documentation map
description: Every page on this site, grouped by what it is for, so you can see the whole from anywhere in it.
sidebar:
  order: 0
---

Pages are grouped by what you are trying to do: learn the basics, complete a
task, understand a concept, look up a reference, or read project policies.

` + sections.map((section) => englishSection(DOCS, section)).join('');
	return [
		[join(DOCS, 'map.md'), english],
		...localeNames.map((locale) => [join(DOCS, locale, 'map.md'), translatedMap(DOCS, locale, sections)]),
	];
}

export function buildMaps(DOCS, localeNames = translatedLocales) {
	for (const [path, content] of renderMaps(DOCS, localeNames)) writeFileSync(path, content);
}

export function checkMaps(DOCS, localeNames = translatedLocales) {
	for (const [path, content] of renderMaps(DOCS, localeNames)) {
		if (readFileSync(path, 'utf8') !== content) throw new Error(`Stale documentation map: ${path}; run npm run build:map`);
	}
}

if (isMain(import.meta.url)) {
	const { values, positionals } = parseArgs({ allowPositionals: true, options: { check: { type: 'boolean', default: false } } });
	const root = positionals[0] || DEFAULT_DOCS;
	if (values.check) checkMaps(root); else buildMaps(root);
	console.log(values.check ? 'documentation maps match' : 'documentation maps generated');
}
