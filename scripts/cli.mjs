import { realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/** Compare canonical URLs so CLI tools also work through symlinks and spaces. */
export function isMain(moduleUrl, entry = process.argv[1]) {
	return Boolean(entry) && pathToFileURL(realpathSync(entry)).href === moduleUrl;
}
