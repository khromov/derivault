import { get } from 'svelte/store';
import { computationIntensity } from './stores';

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
			iterations: 100000 * intensity,
			hash: 'SHA-512'
		},
		keyMaterial,
		256
	);

	return new Uint8Array(derivedBits);
}

export async function generatePassword(
	masterKey: Uint8Array,
	site: { email: string; domain: string; rotationRounds: number }
): Promise<string> {
	const encoder = new TextEncoder();
	const siteData = encoder.encode(`${site.email}:${site.domain}:${site.rotationRounds}`);

	const hmacKey = await window.crypto.subtle.importKey(
		'raw',
		masterKey,
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);

	const signature = await window.crypto.subtle.sign('HMAC', hmacKey, siteData);

	const hashArray = Array.from(new Uint8Array(signature));
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
