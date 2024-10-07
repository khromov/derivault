import { persisted } from 'svelte-persisted-store';
import { writable } from 'svelte/store';

export const masterPassword = writable<string | null>(null);
export const computationIntensity = persisted<number>('computationIntensity', 3);

interface Site {
	email: string;
	domain: string;
	rotationRounds: number;
	comment: string;
}

export const sites = persisted<Site[]>('passwordManagerSites', []);
