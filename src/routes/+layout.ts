import { locales } from 'virtual:wuchale/locales';
import { browser } from '$app/environment';
import { loadLocale } from 'wuchale/load-utils';
import { get } from 'svelte/store';
import { language } from '$lib/stores';
// so that the loaders are registered
import '../locales/loader.svelte.js';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url }) => {
	const locale = get(language) || 'en';
	if (!locales.includes(locale)) {
		return;
	}
	if (browser) {
		await loadLocale(locale);
	}
};
