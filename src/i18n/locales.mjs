import messages from './messages.json' with { type: 'json' };

/** @type {Record<string, { label: string, lang: string, dir?: 'rtl' | 'ltr' }>} */
export const locales = {
	root: { label: 'English', lang: 'en' },
	'zh-cn': { label: '简体中文', lang: 'zh-CN' },
	hi: { label: 'हिन्दी', lang: 'hi' },
	es: { label: 'Español', lang: 'es' },
	ar: { label: 'العربية', lang: 'ar', dir: 'rtl' },
	fr: { label: 'Français', lang: 'fr' },
	de: { label: 'Deutsch', lang: 'de' },
	ja: { label: '日本語', lang: 'ja' },
	'es-419': { label: 'Español (Latinoamérica)', lang: 'es-419' },
	'fr-ca': { label: 'Français (Canada)', lang: 'fr-CA' },
	sw: { label: 'Kiswahili', lang: 'sw' },
	ha: { label: 'Hausa', lang: 'ha' },
	'pt-pt': { label: 'Português (Portugal)', lang: 'pt-PT' },
	'pt-br': { label: 'Português (Brasil)', lang: 'pt-BR' },
	yo: { label: 'Yorùbá', lang: 'yo' },
	it: { label: 'Italiano', lang: 'it' },
	ko: { label: '한국어', lang: 'ko' },
	id: { label: 'Bahasa Indonesia', lang: 'id' },
	nl: { label: 'Nederlands', lang: 'nl' },
	pl: { label: 'Polski', lang: 'pl' },
	bn: { label: 'বাংলা', lang: 'bn' },
	si: { label: 'සිංහල', lang: 'si' },
};

export const translatedLocales = Object.keys(locales).filter((locale) => locale !== 'root');

export { messages };

export function validateMessages(catalog = messages) {
	for (const locale of Object.keys(locales)) {
		const key = locale === 'root' ? 'en' : locale;
		const dictionary = catalog[key];
		if (!dictionary) throw new Error(`Missing message dictionary: ${key}`);
		for (const field of Object.keys(messages.en)) {
			if (typeof dictionary[field] !== 'string' || !dictionary[field].trim()) {
				throw new Error(`Missing message: ${key}.${field}`);
			}
		}
	}
}

export function getMessages(locale) {
	const key = locale?.toLowerCase() || 'root';
	const dictionary = messages[key === 'root' ? 'en' : key];
	if (!dictionary) throw new Error(`Missing message dictionary: ${key}`);
	return dictionary;
}

export function navigation(key) {
	return {
		label: messages.en[key],
		translations: Object.fromEntries(translatedLocales.map((locale) => [locales[locale].lang, getMessages(locale)[key]])),
	};
}
