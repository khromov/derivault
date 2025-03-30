import type { PageLoad } from './$types';
import { get } from 'svelte/store';
import { sites } from '$lib/stores';
import { generatePassword } from '$lib/crypto';
import { error } from '@sveltejs/kit';
import { getHashParams } from '$lib/utils';

export const load: PageLoad = async ({ url, parent }) => {
	const { derivedKey } = await parent();
	const searchParams = getHashParams(url);
	const editParam = searchParams.get('edit');
	const quickMode = searchParams.get('quick') === 'true';

	if (editParam !== null) {
		const editIndex = parseInt(editParam, 10);
		const allSites = get(sites);

		if (isNaN(editIndex) || editIndex < 0 || editIndex >= allSites.length) {
			error(404, 'Site not found');
		}

		if (!derivedKey) {
			error(400, 'Encryption key not available');
		}

		const siteToEdit = allSites[editIndex];
		const generatedPassword = await generatePassword(derivedKey, siteToEdit);

		return {
			editMode: true,
			editIndex,
			site: siteToEdit,
			generatedPassword,
			derivedKey,
			quickMode
		};
	}

	return {
		editMode: false,
		editIndex: null,
		site: null,
		generatedPassword: '',
		derivedKey,
		quickMode
	};
};
