import type { PageLoad } from './$types';
import { get } from 'svelte/store';
import { sites } from '$lib/stores';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ parent }) => {
	const { derivedKey } = await parent();
	const allSites = get(sites);

	if (!derivedKey) {
		error(400, 'Encryption key not available');
	}

	return {
		sites: allSites
	};
};
