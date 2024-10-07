import { browser } from '$app/environment';
import { generateMnemonic } from 'web-bip39';
import wordlist from 'web-bip39/wordlists/english';
import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	if (browser) {
		const mnemonic = await generateMnemonic(wordlist, 256); // 24 words
		return {
			mnemonic
		};
	}
	return {
		mnemonic: ''
	};
};
