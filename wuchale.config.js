// @ts-check
import { adapter as svelte } from '@wuchale/svelte';
import { defineConfig } from 'wuchale';
import { adapter as js } from 'wuchale/adapter-vanilla';

export default defineConfig({
	otherLocales: ['sv'],
	adapters: {
		main: svelte(),

		js: js({ files: ['src/**/+{page,layout}.{js,ts}', 'src/**/+{page,layout}.server.{js,ts}'] })
	}
});
