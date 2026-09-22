import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, lstatSync, realpathSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { translatedLocales } from '../src/i18n/locales.mjs';
import { isMain } from './cli.mjs';

export const hash = (value) => createHash('sha256').update(value).digest('hex');
const json = (value) => JSON.stringify(value, null, 2) + '\n';
const tokens = (value) => (value.match(/\{\{[^{}]+\}\}|\[(?:COUNT|SEARCH_TERM|DIFFERENT_TERM)\]/g) || []).sort();
// Non-Latin scripts can attach particles directly to a Latin product name.
const nameCount = (value, name) => (value.match(new RegExp(String.raw`(?<![\p{Script=Latin}\p{Number}\p{Mark}_])${name}(?![\p{Script=Latin}\p{Number}\p{Mark}_])`, 'gu')) || []).length;
const record = (value, label) => assert.ok(value && typeof value === 'object' && !Array.isArray(value), `Expected ${label} object`);
function validateReviewUrl(value) {
	const message = 'Reviewed units require an absolute HTTPS Weblate history URL without credentials';
	assert.ok(typeof value === 'string' && URL.canParse(value) && !/\s/u.test(value), message);
	const url = new URL(value);
	assert.ok(url.origin === 'https://translate.kadupul.net' && url.pathname === '/changes/' && !url.username && !url.password, message);
}

/** Site labels are plain text; framework HTML translations use a different component. */
export function validateCatalog(source, target) {
	for (const catalog of [source, target]) {
		assert.ok(catalog && typeof catalog === 'object' && !Array.isArray(catalog), 'Expected a flat JSON catalog');
		for (const [key, value] of Object.entries(catalog)) {
			assert.ok(Object.hasOwn(source, key), `Unknown translation key: ${key}`);
			assert.equal(typeof value, 'string', `Expected string: ${key}`);
			assert.ok(!/[<>]/u.test(value), `Markup is not allowed in site labels: ${key}`);
			assert.ok(value === '' || value.trim().length > 0, `Whitespace-only translation: ${key}`);
		}
	}
	for (const [key, value] of Object.entries(source)) {
		assert.ok(value.trim(), `Empty English source: ${key}`);
		if (target[key]) {
			assert.deepEqual(tokens(target[key]), tokens(value), `Changed placeholders: ${key}`);
			for (const name of ['Kadupul', 'Cacti']) {
				assert.equal(nameCount(target[key], name), nameCount(value, name), `Changed protected name ${name}: ${key}`);
			}
		}
	}
}

/** Approval is bound to both texts; a source change cannot retain approval. */
export function unitState(source, target, review) {
	if (review !== undefined) {
		record(review, 'a review record');
		assert.ok(['draft', 'reviewed'].includes(review.state), 'Invalid review state');
		for (const field of ['sourceSha256', 'targetSha256']) assert.ok(typeof review[field] === 'string' && /^[a-f0-9]{64}$/.test(review[field]), `Invalid ${field}`);
		if (review.state === 'reviewed') {
			assert.ok(typeof review.reviewer === 'string' && review.reviewer.trim(), 'Reviewed units require a reviewer');
			assert.ok(typeof review.reviewedAt === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(review.reviewedAt) && Number.isFinite(Date.parse(review.reviewedAt)) && new Date(review.reviewedAt).toISOString().replace('.000Z', 'Z') === review.reviewedAt, 'Reviewed units require a UTC review date');
			validateReviewUrl(review.reviewUrl);
		}
	}
	if (!target) return 'missing';
	if (review === undefined) return 'draft';
	if (review.sourceSha256 !== hash(source)) return 'needs-update';
	if (review.targetSha256 !== hash(target)) return 'draft';
	return review.state;
}

/** Resolve symlinks before enforcing a directory boundary, including new outputs. */
function containedPath(root, path, allowNewFile = false) {
	let resolved;
	try {
		resolved = realpathSync(path);
	} catch (error) {
		if (!allowNewFile || error.code !== 'ENOENT') throw error;
		assert.ok(!lstatSync(path, { throwIfNoEntry: false })?.isSymbolicLink(), 'Translation output must not be a dangling symlink');
		resolved = join(realpathSync(dirname(path)), basename(path));
	}
	const baseDir = root.endsWith(sep) ? root.slice(0, -1) : root;
	if (resolved !== baseDir && !resolved.startsWith(baseDir + sep)) {
		throw new Error('Translation path is outside the allowed directory');
	}
	return resolved;
}

export function buildSiteTranslations(root, { check = false } = {}) {
	root = realpathSync(root);
	const pathFor = (path, allowNewFile = false) => containedPath(root, join(root, path), allowNewFile);
	const catalogFiles = readdirSync(pathFor('translations/site')).filter((name) => /\.json$/i.test(name)).sort((a, b) => a.localeCompare(b));
	assert.deepEqual(catalogFiles, ['en', ...translatedLocales].map((locale) => `${locale}.json`).sort((a, b) => a.localeCompare(b)), 'Catalog filenames must match the supported lowercase locale keys');
	const read = (path) => JSON.parse(readFileSync(pathFor(path), 'utf8'));
	const source = read('translations/site/en.json');
	validateCatalog(source, source);
	const reviews = read('translations/site-reviews.json');
	record(reviews, 'a review manifest');
	assert.equal(reviews.schemaVersion, 1, 'Unsupported review manifest version');
	record(reviews.units, 'review units');
	for (const [locale, units] of Object.entries(reviews.units)) {
		assert.ok(translatedLocales.includes(locale), `Unknown review locale: ${locale}`);
		record(units, `review units for ${locale}`);
		for (const key of Object.keys(units)) assert.ok(Object.hasOwn(source, key), `Unknown review key: ${key}`);
	}
	const messages = { en: source };
	const report = { scope: 'Site labels only; excludes interface strings, documentation summaries and full manual coverage.', locales: {} };
	for (const locale of translatedLocales) {
		const target = read(`translations/site/${locale}.json`);
		validateCatalog(source, target);
		messages[locale] = {};
		const counts = { missing: 0, draft: 0, 'needs-update': 0, reviewed: 0 };
		const units = {};
		for (const [key, value] of Object.entries(source)) {
			const state = unitState(value, target[key], reviews.units[locale]?.[key]);
			counts[state]++;
			units[key] = state;
			messages[locale][key] = target[key] || value;
		}
		report.locales[locale] = { counts, units };
	}
	// Validate both destinations before writing either generated file.
	const outputs = Object.entries({ 'src/i18n/messages.json': messages, 'public/site-translation-status.json': report })
		.map(([path, value]) => {
			const destination = pathFor(path, !check);
			const entry = lstatSync(destination, { throwIfNoEntry: false });
			assert.ok(!entry || entry.isFile(), 'Translation output must be a regular file');
			return { path, value, destination };
		});
	for (const { path, value, destination } of outputs) {
		if (check) assert.equal(readFileSync(destination, 'utf8'), json(value), `Stale generated translations: ${path}; run npm run translations:build`);
		else writeFileSync(destination, json(value));
	}
	return report;
}

if (isMain(import.meta.url)) {
	const { values, positionals } = parseArgs({ allowPositionals: true, options: { check: { type: 'boolean', default: false } } });
	assert.ok(positionals.length <= 1, 'Expected at most one translation root');
	const root = positionals.length
		? containedPath(realpathSync(process.cwd()), positionals[0])
		: fileURLToPath(new URL('../', import.meta.url));
	buildSiteTranslations(root, { check: values.check });
	console.log(values.check ? 'Site translation catalogs match generated files' : 'Site translation files generated');
}
