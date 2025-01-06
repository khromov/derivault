import { describe, it, expect } from 'vitest';
import { deriveMasterKey, generatePassword } from './crypto';

describe('deriveMasterKey', () => {
	it('produces the same key for the same passphrase', async () => {
		const passphrase = 'test-passphrase';
		const intensityOverride = 1; // Use low intensity for faster tests

		const key1 = await deriveMasterKey(passphrase, intensityOverride);
		const key2 = await deriveMasterKey(passphrase, intensityOverride);

		expect(Array.from(key1)).toEqual(Array.from(key2));
	});

	it('produces different keys for different passphrases', async () => {
		const passphrase1 = 'test-passphrase-1';
		const passphrase2 = 'test-passphrase-2';
		const intensityOverride = 1;

		const key1 = await deriveMasterKey(passphrase1, intensityOverride);
		const key2 = await deriveMasterKey(passphrase2, intensityOverride);

		expect(Array.from(key1)).not.toEqual(Array.from(key2));
	});

	it('produces different keys for different intensities', async () => {
		const passphrase = 'test-passphrase';

		const key1 = await deriveMasterKey(passphrase, 1);
		const key2 = await deriveMasterKey(passphrase, 2);

		expect(Array.from(key1)).not.toEqual(Array.from(key2));
	});
});

describe('generatePassword', () => {
	it('generates the same password for same inputs', async () => {
		const masterKey = new Uint8Array([1, 2, 3, 4, 5]); // Simplified key for testing
		const site = {
			email: 'test@example.com',
			domain: 'example.com',
			rotationRounds: 1
		};

		const password1 = await generatePassword(masterKey, site);
		const password2 = await generatePassword(masterKey, site);

		expect(password1).toEqual(password2);
	});

	it('generates different passwords for different emails', async () => {
		const masterKey = new Uint8Array([1, 2, 3, 4, 5]);
		const site1 = {
			email: 'test1@example.com',
			domain: 'example.com',
			rotationRounds: 1
		};
		const site2 = {
			email: 'test2@example.com',
			domain: 'example.com',
			rotationRounds: 1
		};

		const password1 = await generatePassword(masterKey, site1);
		const password2 = await generatePassword(masterKey, site2);

		expect(password1).not.toEqual(password2);
	});

	it('generates different passwords for different domains', async () => {
		const masterKey = new Uint8Array([1, 2, 3, 4, 5]);
		const site1 = {
			email: 'test@example.com',
			domain: 'example1.com',
			rotationRounds: 1
		};
		const site2 = {
			email: 'test@example.com',
			domain: 'example2.com',
			rotationRounds: 1
		};

		const password1 = await generatePassword(masterKey, site1);
		const password2 = await generatePassword(masterKey, site2);

		expect(password1).not.toEqual(password2);
	});

	it('generates different passwords for different rotation rounds', async () => {
		const masterKey = new Uint8Array([1, 2, 3, 4, 5]);
		const site1 = {
			email: 'test@example.com',
			domain: 'example.com',
			rotationRounds: 1
		};
		const site2 = {
			email: 'test@example.com',
			domain: 'example.com',
			rotationRounds: 2
		};

		const password1 = await generatePassword(masterKey, site1);
		const password2 = await generatePassword(masterKey, site2);

		expect(password1).not.toEqual(password2);
	});

	it('generates passwords with proper length and character types', async () => {
		const masterKey = new Uint8Array([1, 2, 3, 4, 5]);
		const site = {
			email: 'test@example.com',
			domain: 'example.com',
			rotationRounds: 1
		};

		const password = await generatePassword(masterKey, site);

		expect(password).toMatch(/^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{}|;:,.<>?]{16}$/);
		expect(password.length).toBe(16);
	});
});
