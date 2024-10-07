export const ssr = false;
export const prerender = false;

import type { LayoutLoad } from './$types';
import { get } from 'svelte/store';
import { masterPassword } from '$lib/stores';
import { deriveMasterKey } from '$lib/crypto';
import { redirect, error } from '@sveltejs/kit';
import { browser } from '$app/environment';

export const load: LayoutLoad = async ({ route }) => {
	if (
		!browser ||
		typeof window.crypto === 'undefined' ||
		typeof window.crypto.subtle === 'undefined'
	) {
		error(500, 'Required cryptographic functions are not available in this browser.');
	}

	const currentMasterPassword = get(masterPassword);

	if (route.id === '/(app)' && currentMasterPassword) {
		redirect(302, '/vault');
	} else if (route.id !== '/(app)' && !currentMasterPassword) {
		redirect(302, '/');
	}

	let derivedKey = null;
	if (currentMasterPassword) {
		derivedKey = await deriveMasterKey(currentMasterPassword);
	}

	return {
		derivedKey
	};
};
