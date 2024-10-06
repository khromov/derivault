import type { PageLoad } from './$types';
import { get } from 'svelte/store';
import { masterPassword, sites } from '$lib/stores';
import { deriveMasterKey, generatePassword } from '$lib/crypto';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async () => {
  const currentMasterPassword = get(masterPassword);

  if (!currentMasterPassword) {
    throw redirect(302, '/');
  }

  const derivedKey = await deriveMasterKey(currentMasterPassword);
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