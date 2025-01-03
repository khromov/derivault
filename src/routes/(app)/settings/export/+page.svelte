<script lang="ts">
	import { sites } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Download, Copy } from 'lucide-svelte';
	import toast from 'svelte-french-toast';
	import { mnemonicToSeed } from 'web-bip39';
	import { base } from '$app/paths';

	export let data;

	const { mnemonic } = data;

	async function exportSites() {
		try {
			const sitesData = JSON.stringify($sites);
			const seed = await mnemonicToSeed(mnemonic);

			// Convert the seed to a CryptoKey
			const key = await window.crypto.subtle.importKey(
				'raw',
				seed.slice(0, 32), // Use the first 256 bits of the seed
				{ name: 'AES-GCM' },
				false,
				['encrypt']
			);

			// Generate a random IV
			const iv = window.crypto.getRandomValues(new Uint8Array(12));

			// Encrypt the data
			const encryptedData = await window.crypto.subtle.encrypt(
				{
					name: 'AES-GCM',
					iv: iv
				},
				key,
				new TextEncoder().encode(sitesData)
			);

			// Combine IV and encrypted data
			const exportData = new Uint8Array(iv.length + encryptedData.byteLength);
			exportData.set(iv);
			exportData.set(new Uint8Array(encryptedData), iv.length);

			const blob = new Blob([exportData], { type: 'application/octet-stream' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;

			// Use ISO 8601 format for the timestamp
			const now = new Date();
			const isoString = now.toISOString().replace(/[:\.]/g, '-').replace('T', '_').slice(0, -5);

			a.download = `derivault-sites-${isoString}.encrypted`;

			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			toast.success('Sites exported successfully');
		} catch (error) {
			toast.error('Error exporting sites: ' + (error as Error).message);
		}
	}

	function copyMnemonic() {
		navigator.clipboard
			.writeText(mnemonic)
			.then(() => {
				toast.success('Mnemonic copied to clipboard');
			})
			.catch((err) => {
				toast.error('Failed to copy mnemonic: ' + err);
			});
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100">
	<Card class="m-4 w-full max-w-[600px]">
		<CardHeader>
			<CardTitle>Export Vault</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="grid w-full items-center gap-4">
				<p class="text-sm text-gray-600">
					Here is your encryption key. Please save it securely, as you'll need it to import your
					vault:
				</p>
				<div class="relative">
					<pre
						class="overflow-x-auto whitespace-pre-wrap break-words rounded bg-gray-100 p-4">{mnemonic}</pre>
					<Button
						class="absolute right-2 top-2"
						size="sm"
						variant="outline"
						on:click={copyMnemonic}
					>
						<Copy size={16} />
					</Button>
				</div>
				<Button on:click={exportSites}>
					<Download size={16} class="mr-2" />
					Export Encrypted Vault
				</Button>
				<Button on:click={() => goto(`${base}/settings`)} variant="outline">Back</Button>
			</div>
		</CardContent>
	</Card>
</div>
