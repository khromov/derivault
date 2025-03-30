<script lang="ts">
	import { sites } from '$lib/stores';
	import type { Site } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import Upload from 'lucide-svelte/icons/upload';
	import { Label } from '$lib/components/ui/label';
	import toast from 'svelte-french-toast';
	import { validateMnemonic, mnemonicToSeed } from 'web-bip39';
	import wordlist from 'web-bip39/wordlists/english';

	let mnemonic = '';

	function isSiteEqual(site1: Site, site2: Site): boolean {
		return (
			site1.email === site2.email &&
			site1.domain === site2.domain &&
			site1.rotationRounds === site2.rotationRounds &&
			site1.comment === site2.comment
		);
	}

	async function importSites() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.encrypted';
		input.onchange = async (event) => {
			const file = (event.target as HTMLInputElement).files?.[0];
			if (file) {
				try {
					// Normalize the mnemonic by trimming whitespace and ensuring single spaces between words
					const normalizedMnemonic = mnemonic.trim().replace(/\s+/g, ' ');
					const isValid = await validateMnemonic(normalizedMnemonic, wordlist);
					if (!isValid) {
						throw new Error('Invalid mnemonic phrase');
					}

					const arrayBuffer = await file.arrayBuffer();
					const encrypted = new Uint8Array(arrayBuffer);

					// Extract IV and encrypted data
					const iv = encrypted.slice(0, 12);
					const encryptedData = encrypted.slice(12);

					const seed = await mnemonicToSeed(normalizedMnemonic);

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
					const importedSites = JSON.parse(decrypted) as Site[];

					if (Array.isArray(importedSites)) {
						const currentSites = $sites;
						let newSitesCount = 0;

						const updatedSites = [...currentSites];
						importedSites.forEach((importedSite) => {
							if (!currentSites.some((site) => isSiteEqual(site, importedSite))) {
								updatedSites.push(importedSite);
								newSitesCount++;
							}
						});

						$sites = updatedSites;

						if (newSitesCount > 0) {
							toast.success(
								`${newSitesCount} new site${newSitesCount > 1 ? 's' : ''} imported successfully`
							);
						} else {
							toast.error('No new sites to import. All imported sites already exist.');
						}
						goto(`#/settings`);
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
					<textarea
						id="mnemonic"
						bind:value={mnemonic}
						placeholder="Enter your 24-word encryption key"
						rows="3"
						class="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
					></textarea>
				</div>
				<Button on:click={importSites}>
					<Upload size={16} class="mr-2" />
					Import Encrypted Vault
				</Button>
				<Button on:click={() => goto(`#/settings`)} variant="outline">Back</Button>
			</div>
		</CardContent>
	</Card>
</div>
