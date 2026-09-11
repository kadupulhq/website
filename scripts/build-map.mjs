#!/usr/bin/env node
/**
 * Generates the documentation map from the pages themselves.
 *
 * A hand-written index of 60 pages is wrong within a week. This reads each
 * page's own title and description, so the map cannot describe a page that
 * does not exist or miss one that does.
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DOCS = new URL('../src/content/docs/', import.meta.url).pathname;

const SECTIONS = [
	['start', 'Start here', 'Read in order, once. Takes you from nothing to a graph you can read.'],
	['guides', 'How-to guides', 'Task pages for someone who already has it running and has a specific goal.'],
	['concepts', 'Concepts', 'Why the system works the way it does. Read for understanding, not to perform a task.'],
	['reference', 'Reference', 'Looked up, not read through. Precise and scannable.'],
	['project', 'Project', 'What this project is, where it stands, and the terms it is offered under.'],
];

function frontmatter(file) {
	const text = readFileSync(file, 'utf8');
	if (!text.startsWith('---\n')) return null;
	const block = text.slice(4, text.indexOf('\n---\n', 4));
	const grab = (key) => {
		const m = block.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
		return m ? m[1].trim().replace(/^['"]|['"]$/g, '') : '';
	};
	const order = block.match(/^\s+order:\s*(\d+)/m);
	return { title: grab('title'), description: grab('description'), order: order ? +order[1] : 999 };
}

let out = `---
title: Documentation map
description: Every page on this site, grouped by what it is for, so you can see the whole from anywhere in it.
sidebar:
  order: 0
---

Sixty-odd pages, grouped by what you are trying to do. The four groups are not
interchangeable: a reference page makes a poor tutorial, and a tutorial that lists
every option is impossible to follow.

`;

for (const [dir, heading, blurb] of SECTIONS) {
	let entries;
	try {
		entries = readdirSync(join(DOCS, dir)).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
	} catch {
		continue;
	}
	const pages = entries
		.map((f) => ({ slug: f.replace(/\.mdx?$/, ''), ...frontmatter(join(DOCS, dir, f)) }))
		.filter((p) => p.title)
		.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

	out += `## ${heading}\n\n${blurb}\n\n`;
	for (const p of pages) {
		out += `- [${p.title}](/${dir}/${p.slug}/)${p.description ? ` — ${p.description}` : ''}\n`;
	}
	out += '\n';
}

// The long dash above is deliberate in generated output only; convert to a period
// so the prose linter's em dash rule holds for this file too.
out = out.replace(/\) — /g, '). ');

writeFileSync(join(DOCS, 'map.md'), out);
console.log('documentation map generated');
