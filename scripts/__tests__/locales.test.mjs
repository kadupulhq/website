import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { isMain } from '../cli.mjs';
import { locales, messages, getMessages, navigation, validateMessages } from '../../src/i18n/locales.mjs';
import { isErrorRoute, isUtilityRoute } from '../../src/i18n/routes.mjs';

test('every configured locale has complete, non-empty site messages', () => {
	assert.doesNotThrow(() => validateMessages());
	const missing = structuredClone(messages);
	delete missing.si;
	assert.throws(() => validateMessages(missing), /Missing message dictionary: si/);
	for (const bad of ['', '  ', 42, undefined]) {
		const invalid = structuredClone(messages);
		invalid['es-419'].map = bad;
		assert.throws(() => validateMessages(invalid), /Missing message: es-419.map/);
	}
});

test('locale lookup handles root, canonical regional tags and unknown dictionaries', () => {
	assert.equal(getMessages(), messages.en);
	assert.equal(getMessages('root'), messages.en);
	assert.equal(getMessages('en'), messages.en);
	assert.equal(getMessages('fr-CA'), messages['fr-ca']);
	assert.throws(() => getMessages('unknown'), /Missing message dictionary: unknown/);
	const nav = navigation('device');
	assert.equal(nav.label, messages.en.device);
	assert.equal(nav.translations['es-419'], 'Agregar el primer dispositivo');
	assert.equal(nav.translations['fr-CA'], messages['fr-ca'].device);
	assert.equal(Object.keys(nav.translations).length, Object.keys(locales).length - 1);
});

test('only error routes and version landing pages are utility pages', () => {
	for (const prefix of ['', ...Object.keys(locales).filter((l) => l !== 'root').map((l) => `${l}/`)]) {
		assert.equal(isErrorRoute(`/${prefix}404/`), true);
		assert.equal(isErrorRoute(`${prefix}404.html`), true);
		assert.equal(isUtilityRoute(`/${prefix}1.2.31/`), true);
		assert.equal(isUtilityRoute(`/${prefix}1.2.31/reference/orphan/`), false);
	}
	assert.equal(isErrorRoute('/unknown/404/'), false);
	assert.equal(isUtilityRoute('/'), false);
	assert.equal(isErrorRoute('/es-419/start/install/'), false);
});

test('CLI entry detection compares canonical URLs and handles no entry', () => {
	assert.equal(isMain(import.meta.url, fileURLToPath(import.meta.url)), true);
	assert.equal(isMain('file:///different.mjs', fileURLToPath(import.meta.url)), false);
	assert.equal(isMain(import.meta.url, null), false);
	assert.equal(isMain(pathToFileURL(process.argv[1]).href), true);
});
