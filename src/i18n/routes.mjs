import { translatedLocales } from './locales.mjs';

function localPath(path) {
	const parts = path.replace(/^\//, '').replace(/\/$/, '').split('/');
	if (translatedLocales.includes(parts[0])) parts.shift();
	return parts.join('/');
}

export function isErrorRoute(path) {
	return ['404', '404.html'].includes(localPath(path));
}

export function isUtilityRoute(path) {
	return isErrorRoute(path) || localPath(path) === '1.2.31';
}
