export const ssr = false;
export const prerender = false;

import type { LayoutLoad } from './$types';
import { get } from 'svelte/store';
import { masterPassword } from '$lib/stores';
import { deriveMasterKey } from '$lib/crypto';
import { redirect } from '@sveltejs/kit';

export const load: LayoutLoad = async ({ route }) => {
  const currentMasterPassword = get(masterPassword);

  if (route.id === '/' && currentMasterPassword) {
    throw redirect(302, '/vault');
  } else if (route.id !== '/' && !currentMasterPassword) {
    throw redirect(302, '/');
  }

  let derivedKey = null;
  if (currentMasterPassword) {
    derivedKey = await deriveMasterKey(currentMasterPassword);
  }

  return {
    derivedKey
  };
};