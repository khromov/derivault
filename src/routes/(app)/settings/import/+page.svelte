<script lang="ts">
	import { sites } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Upload } from 'lucide-svelte';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import toast from 'svelte-french-toast';
	import { validateMnemonic, mnemonicToSeed } from 'web-bip39';
	import wordlist from 'web-bip39/wordlists/english';

	let mnemonic = '';

	async function importSites() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.encrypted';
		input.onchange = async (event) => {
			const file = (event.target as HTMLInputElement).files?.[0];
			if (file) {
				try {
					const isValid = await validateMnemonic(mnemonic, wordlist);
					if (!isValid) {
						throw new Error('Invalid mnemonic phrase');
					}

					const arrayBuffer = await file.arrayBuffer();
					const encrypted = new Uint8Array(arrayBuffer);

					// Extract IV and encrypted data
					const iv = encrypted.slice(0, 12);
					const encryptedData = encrypted.slice(12);

					const seed = await mnemonicToSeed(mnemonic);

					// Convert the seed to a CryptoKey
					const key = await window.crypto.subtle.importKey(
						'raw',
						seed.slice(0, 32), // Use the first 256 bits of the seed
						{ name: 'AES-GCM' },
						false,
						['decrypt']
					);

					// Decrypt the data
					const decryptedBuffer = await window.crypto.subtle.decrypt(
						{
							name: 'AES-GCM',
							iv: iv
						},
						key,
						encryptedData
					);

					const decrypted = new TextDecoder().decode(decryptedBuffer);
					const importedSites = JSON.parse(decrypted);

					if (Array.isArray(importedSites)) {
						$sites = [...$sites, ...importedSites];
						toast.success('Sites imported successfully');
						goto('/settings');
					} else {
						throw new Error('Invalid file format');
					}
				} catch (error) {
					toast.error('Error importing sites: ' + (error as Error).message);
				}
			}
		};
		input.click();
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100">
	<Card class="m-4 w-full max-w-[600px]">
		<CardHeader>
			<CardTitle>Import Vault</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="grid w-full items-center gap-4">
				<div class="flex flex-col space-y-1.5">
					<Label for="mnemonic">Encryption Key</Label>
					<Input
						id="mnemonic"
						bind:value={mnemonic}
						placeholder="Enter your 24-word encryption key"
					/>
				</div>
				<Button on:click={importSites}>
					<Upload size={16} class="mr-2" />
					Import Encrypted Vault
				</Button>
				<Button on:click={() => goto('/settings')} variant="outline">Back</Button>
			</div>
		</CardContent>
	</Card>
</div>
