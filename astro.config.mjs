// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightVersions from 'starlight-versions';
import sitemap from '@astrojs/sitemap';
import { locales, navigation } from './src/i18n/locales.mjs';

export default defineConfig({
	site: 'https://kadupul.net',
	integrations: [
		starlight({
			defaultLocale: 'root',
			locales,
			title: 'Kadupul',
			description:
				'Network monitoring and graphing. Poll devices over SNMP and scripts, store the results in RRD files, and graph them.',
			logo: { src: './src/assets/logo.png', alt: '' },
			favicon: '/favicon.png',
			customCss: ['./src/styles/brand.css'],
			components: { Footer: './src/components/Footer.astro' },
			plugins: [
				starlightVersions({
					// `main` tracks the development line. Archived versions are
					// snapshots and are not edited after they are cut.
					current: { label: 'main' },
					versions: [{ slug: '1.2.31', label: '1.2.31' }],
					// Project pages describe the project, not a release, so they
					// always serve the latest copy across every version.
					// The site-wide error page is served as /404.html, not a
					// versioned documentation route.
					exclude: ['project/**', '*/project/**', '404.md', '*/404.md'],
				}),
			],
			editLink: { baseUrl: 'https://github.com/kadupulhq/website/edit/main/' },
			lastUpdated: true,
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/kadupulhq' },
			],
			sidebar: [
				{ ...navigation('map'), slug: 'map' },
				{
					...navigation('start'),
					items: [
						{ ...navigation('overview'), slug: 'start/what-kadupul-is' },
						{ ...navigation('install'), slug: 'start/install' },
						{ ...navigation('device'), slug: 'start/first-device' },
						{ ...navigation('graph'), slug: 'start/first-graph' },
					],
				},
				{
					...navigation('guides'),
					items: [{ autogenerate: { directory: 'guides' } }],
				},
				{
					...navigation('concepts'),
					items: [{ autogenerate: { directory: 'concepts' } }],
				},
				{
					...navigation('reference'),
					items: [{ autogenerate: { directory: 'reference' } }],
				},
				{
					...navigation('project'),
					items: [{ autogenerate: { directory: 'project' } }],
				},
			],
		}),
		sitemap(),
	],
});
