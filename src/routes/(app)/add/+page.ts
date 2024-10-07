import type { PageLoad } from './$types';
import { get } from 'svelte/store';
import { sites } from '$lib/stores';
import { generatePassword } from '$lib/crypto';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ url, parent }) => {
	const { derivedKey } = await parent();
	const editParam = url.searchParams.get('edit');

	if (editParam !== null) {
		const editIndex = parseInt(editParam, 10);
		const allSites = get(sites);

		if (isNaN(editIndex) || editIndex < 0 || editIndex >= allSites.length) {
			throw error(404, 'Site not found');
		}

		const siteToEdit = allSites[editIndex];
		const generatedPassword = await generatePassword(derivedKey, siteToEdit);

		return {
			editMode: true,
			editIndex,
			site: siteToEdit,
			generatedPassword,
			derivedKey
		};
	}

	return {
		editMode: false,
		editIndex: null,
		site: null,
		generatedPassword: '',
		derivedKey
	};
};
