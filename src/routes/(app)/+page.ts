import type { PageLoad } from './$types';
import { get } from 'svelte/store';
import { lastAuthType } from '$lib/stores';

export const load: PageLoad = async () => {
	const authType = get(lastAuthType);

	return {
		authType
	};
};
