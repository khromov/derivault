// @ts-check
import { adapter as svelte } from '@wuchale/svelte';
import { defineConfig } from 'wuchale';

export default defineConfig({ otherLocales: ['sv'], adapters: { main: svelte() } });
