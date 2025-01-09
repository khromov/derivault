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

	describe('snapshot tests', () => {
		// Helper function to create consistent master keys for snapshot tests
		const createMasterKey = (seed: number): Uint8Array => {
			return new Uint8Array(Array.from({ length: 32 }, (_, i) => (seed + i) % 256));
		};

		it('generates expected password for default case', async () => {
			const masterKey = createMasterKey(1);
			const site = {
				email: 'user@example.com',
				domain: 'example.com',
				rotationRounds: 1
			};
			const password = await generatePassword(masterKey, site);
			expect(password).toMatchInlineSnapshot(`"|J@OE)MPLIW**QCk"`);
		});

		it('generates expected password for Gmail account', async () => {
			const masterKey = createMasterKey(2);
			const site = {
				email: 'user@gmail.com',
				domain: 'google.com',
				rotationRounds: 1
			};

			const password = await generatePassword(masterKey, site);
			expect(password).toMatchInlineSnapshot(`"^G%!-,4f[l0Q!?;0"`);
		});

		it('generates expected password with high rotation round', async () => {
			const masterKey = createMasterKey(3);
			const site = {
				email: 'admin@company.com',
				domain: 'company.com',
				rotationRounds: 10
			};

			const password = await generatePassword(masterKey, site);
			expect(password).toMatchInlineSnapshot(`"d+r[4AHm;[7C8X6E"`);
		});

		it('generates expected password with special characters in email', async () => {
			const masterKey = createMasterKey(4);
			const site = {
				email: 'user+tag@example.com',
				domain: 'example.com',
				rotationRounds: 1
			};

			const password = await generatePassword(masterKey, site);
			expect(password).toMatchInlineSnapshot(`"8DV9ox!Z&qe{ARS%"`);
		});

		it('generates expected password with subdomain', async () => {
			const masterKey = createMasterKey(5);
			const site = {
				email: 'user@example.com',
				domain: 'sub.example.com',
				rotationRounds: 1
			};

			const password = await generatePassword(masterKey, site);
			expect(password).toMatchInlineSnapshot(`"W]$Fv|3)U+|1|ojO"`);
		});

		it('generates expected password with very long inputs', async () => {
			const masterKey = createMasterKey(6);
			const site = {
				email: 'very.long.email.address.with.many.parts@really.long.domain.example.com',
				domain: 'extremely.long.subdomain.with.many.parts.example.com',
				rotationRounds: 5
			};

			const password = await generatePassword(masterKey, site);
			expect(password).toMatchInlineSnapshot(`"!znIhwZjqqP>Gg!C"`);
		});
	});
});
