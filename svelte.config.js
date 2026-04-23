import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex, escapeSvelte } from 'mdsvex';
import { createHighlighter } from 'shiki';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const theme = 'github-dark-dimmed';
const highlighter = await createHighlighter({
	themes: [theme],
	langs: ['js', 'ts', 'bash', 'shell', 'gdscript', 'c', 'cpp', 'python', 'json', 'yaml', 'toml', 'html', 'css', 'svelte']
});

const mdsvexConfig = {
	extensions: ['.md'],
	layout: {
		doc: resolve(__dirname, 'src/lib/layouts/DocLayout.svelte'),
		blog: resolve(__dirname, 'src/lib/layouts/BlogLayout.svelte'),
		_: resolve(__dirname, 'src/lib/layouts/DocLayout.svelte')
	},
	highlight: {
		highlighter: async (code, lang = 'text') => {
			const langId = ['akk', 'akkado'].includes(lang) ? 'js' : lang;
			const html = escapeSvelte(
				highlighter.codeToHtml(code, {
					lang: highlighter.getLoadedLanguages().includes(langId) ? langId : 'text',
					theme
				})
			);
			return `{@html \`${html}\`}`;
		}
	}
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],
	preprocess: [vitePreprocess(), mdsvex(mdsvexConfig)],
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html',
			precompress: false,
			strict: true
		}),
		prerender: {
			entries: ['*'],
			handleHttpError: 'warn',
			handleMissingId: 'warn'
		}
	}
};

export default config;
