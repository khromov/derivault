import { persisted } from 'svelte-persisted-store';
import { writable } from 'svelte/store';

export const masterPassword = writable<Uint8Array | null>(null);
export const computationIntensity = persisted<number>('computationIntensity', 3);

export type Theme = 'light' | 'dark' | 'system';
export const theme = persisted<Theme>('theme', 'system'); // Default to system preference

export interface Site {
	email: string;
	domain: string;
	rotationRounds: number;
	comment: string;
}

export const sites = persisted<Site[]>('passwordManagerSites', []);

export const lastAuthType = persisted<'password' | 'bip39'>('lastAuthType', 'password');
