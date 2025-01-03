export const ssr = false;
export const prerender = false;

import type { LayoutLoad } from './$types';
import { get } from 'svelte/store';
import { masterPassword } from '$lib/stores';
import { deriveMasterKey } from '$lib/crypto';
import { redirect, error } from '@sveltejs/kit';
import { browser } from '$app/environment';
import { base } from '$app/paths';

export const load: LayoutLoad = async ({ route }) => {
	if (
		!browser ||
		typeof window.crypto === 'undefined' ||
		typeof window.crypto.subtle === 'undefined'
	) {
		error(
			500,
			'Required cryptographic functions are not available in this browser. Keep in mind that web crypto APIs require a secure origin, so the page has to be served over SSL.'
		);
	}

	const currentMasterPassword = get(masterPassword);

	if (route.id === '/(app)' && currentMasterPassword) {
		redirect(302, `${base}/vault`);
	} else if (route.id !== '/(app)' && !currentMasterPassword) {
		redirect(302, `${base}/`);
	}

	let derivedKey = null;
	if (currentMasterPassword) {
		derivedKey = await deriveMasterKey(currentMasterPassword);
	}

	return {
		derivedKey
	};
};
