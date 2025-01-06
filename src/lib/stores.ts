import { persisted } from 'svelte-persisted-store';
import { writable } from 'svelte/store';

export const masterPassword = writable<string | null>(null);
export const computationIntensity = persisted<number>('computationIntensity', 5);

export interface Site {
	email: string;
	domain: string;
	rotationRounds: number;
	comment: string;
}

export const sites = persisted<Site[]>('passwordManagerSites', []);

export const lastAuthType = persisted<'password' | 'bip39'>('lastAuthType', 'password');

export const cachedMasterKey = writable<Uint8Array<ArrayBufferLike> | null>(null);
