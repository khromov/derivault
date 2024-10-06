import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { get } from 'svelte/store';
import { masterPassword } from '$lib/stores';

export const load: PageLoad = () => {
  const currentMasterPassword = get(masterPassword);

  if (currentMasterPassword) {
    throw redirect(302, '/vault');
  }

  return {};
};