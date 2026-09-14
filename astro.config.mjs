// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightVersions from 'starlight-versions';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
	site: 'https://kadupul.net',
	integrations: [
		starlight({
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
					exclude: ['project/**', '404.md'],
				}),
			],
			editLink: { baseUrl: 'https://github.com/kadupulhq/website/edit/main/' },
			lastUpdated: true,
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/kadupulhq' },
			],
			sidebar: [
				{ label: 'Documentation map', slug: 'map' },
				{
					label: 'Start here',
					items: [
						{ label: 'What Kadupul is', slug: 'start/what-kadupul-is' },
						{ label: 'Install', slug: 'start/install' },
						{ label: 'Add your first device', slug: 'start/first-device' },
						{ label: 'Read your first graph', slug: 'start/first-graph' },
					],
				},
				{
					label: 'How-to guides',
					items: [{ autogenerate: { directory: 'guides' } }],
				},
				{
					label: 'Concepts',
					items: [{ autogenerate: { directory: 'concepts' } }],
				},
				{
					label: 'Reference',
					items: [{ autogenerate: { directory: 'reference' } }],
				},
				{
					label: 'Project',
					items: [{ autogenerate: { directory: 'project' } }],
				},
			],
		}),
		sitemap(),
	],
});
