// GitHub Pages serves this repository below /website/.
export const site = 'https://kadupulhq.github.io';
export const base = '/website/';

/** Prefix root-relative Markdown links and images without changing external URLs.
 * @type {import('satteri').HastPluginDefinition}
 */
export const baseLinks = {
	name: 'pages-base-links',
	element: {
		filter: [],
		visit(node, ctx) {
			for (const name of ['href', 'src']) {
				const value = node.properties[name];
				if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.startsWith(base)) {
					ctx.setProperty(node, name, base + value.slice(1));
				}
			}
		},
	},
};
