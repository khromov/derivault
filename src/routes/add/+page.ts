import type { PageLoad } from './$types';
import { get } from 'svelte/store';
import { sites } from '$lib/stores';
import { error } from '@sveltejs/kit';

export const load: PageLoad = ({ url }) => {
	const editParam = url.searchParams.get('edit');

	if (editParam !== null) {
		const editIndex = parseInt(editParam, 10);
		const allSites = get(sites);

		if (isNaN(editIndex) || editIndex < 0 || editIndex >= allSites.length) {
			throw error(404, 'Site not found');
		}

		const siteToEdit = allSites[editIndex];

		return {
			editMode: true,
			editIndex,
			site: siteToEdit
		};
	}

	return {
		editMode: false,
		editIndex: null,
		site: null
	};
};
