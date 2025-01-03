import type { PageLoad } from './$types';
import { get } from 'svelte/store';
import { sites } from '$lib/stores';
import { generatePassword } from '$lib/crypto';

export const load: PageLoad = async ({ parent }) => {
	const { derivedKey } = await parent();
	const allSites = get(sites);

	const passwords = await Promise.all(
		allSites.map(async (site) => {
			const password = await generatePassword(derivedKey, site);
			return { ...site, password };
		})
	);

	return {
		sites: passwords
	};
};
