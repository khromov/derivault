import { get } from 'svelte/store';
import { computationIntensity } from './stores';
import { mnemonicToSeed } from 'web-bip39';

const ITERATIONS_PER_INTENSITY = 250000; // 250.000 iterations per intensity

export async function deriveMasterKey(
	passphrase: string,
	intensityOverride?: number
): Promise<Uint8Array> {
	const encoder = new TextEncoder();
	const passphraseBuffer = encoder.encode(passphrase);
	const salt = encoder.encode('ConstantSaltForDeterministicResults');

	const keyMaterial = await window.crypto.subtle.importKey(
		'raw',
		passphraseBuffer,
		{ name: 'PBKDF2' },
		false,
		['deriveBits']
	);

	const intensity = intensityOverride ?? get(computationIntensity);
	const derivedBits = await window.crypto.subtle.deriveBits(
		{
			name: 'PBKDF2',
			salt: salt,
			iterations: ITERATIONS_PER_INTENSITY * intensity,
			hash: 'SHA-512'
		},
		keyMaterial,
		256
	);

	return new Uint8Array(derivedBits);
}

export async function deriveBip39MasterKey(
	mnemonic: string,
	intensityOverride?: number
): Promise<Uint8Array> {
	// First get the BIP39 seed
	const bip39Seed = await mnemonicToSeed(mnemonic.trim());

	// Import the seed for additional key stretching
	const keyMaterial = await window.crypto.subtle.importKey(
		'raw',
		bip39Seed,
		{ name: 'PBKDF2' },
		false,
		['deriveBits']
	);

	// Add our own stretching with configurable intensity
	const intensity = intensityOverride ?? get(computationIntensity);
	const extraStretchedKey = await window.crypto.subtle.deriveBits(
		{
			name: 'PBKDF2',
			salt: new TextEncoder().encode('DeriVault-BIP39-Extra-Stretching'),
			iterations: ITERATIONS_PER_INTENSITY * intensity,
			hash: 'SHA-512'
		},
		keyMaterial,
		256
	);

	return new Uint8Array(extraStretchedKey);
}

export async function generatePassword(
	masterKey: Uint8Array,
	site: { email: string; domain: string; rotationRounds: number }
): Promise<string> {
	const encoder = new TextEncoder();
	const siteData = encoder.encode(`${site.email}:${site.domain}:${site.rotationRounds}`);

	// First, derive a site-specific key using PBKDF2 with the master key as the base
	const siteKeyMaterial = await window.crypto.subtle.importKey(
		'raw',
		masterKey,
		{ name: 'PBKDF2' },
		false,
		['deriveBits']
	);

	const intensity = get(computationIntensity);
	const siteKey = await window.crypto.subtle.deriveBits(
		{
			name: 'PBKDF2',
			salt: siteData, // Use site-specific data as salt
			iterations: ITERATIONS_PER_INTENSITY * intensity, // Make it as slow as the master key derivation
			hash: 'SHA-512'
		},
		siteKeyMaterial,
		512 // Use larger output for more entropy
	);

	// Convert the derived key into a password
	const hashArray = Array.from(new Uint8Array(siteKey));
	const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

	const allChars =
		'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

	let password = '';
	for (let i = 0; i < 16; i++) {
		const charIndex = parseInt(hashHex.substr(i * 2, 2), 16) % allChars.length;
		password += allChars[charIndex];
	}

	return password;
}
