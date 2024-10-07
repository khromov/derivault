<script lang="ts">
	import { masterPassword, sites, computationIntensity } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { AlertTriangle, Download, Upload } from 'lucide-svelte';
	import toast from 'svelte-french-toast';

	function panicButton() {
		$sites = [];
		$masterPassword = null;
		$computationIntensity = 3;

		localStorage.clear();

		goto('/');
	}

	function exportSites() {
		const data = JSON.stringify($sites, null, 2);
		const blob = new Blob([data], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;

		// Create a date string in the format YYYY-MM-DD
		const date = new Date().toISOString().split('T')[0];
		a.download = `plausible-pass-sites-${date}.json`;

		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		toast.success('Sites exported successfully');
	}

	function importSites() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'application/json';
		input.onchange = (event) => {
			const file = (event.target as HTMLInputElement).files?.[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = (e) => {
					try {
						const importedSites = JSON.parse(e.target?.result as string);
						if (Array.isArray(importedSites)) {
							$sites = [...$sites, ...importedSites];
							toast.success('Sites imported successfully');
						} else {
							throw new Error('Invalid file format');
						}
					} catch (error) {
						toast.error('Error importing sites: ' + (error as Error).message);
					}
				};
				reader.readAsText(file);
			}
		};
		input.click();
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100">
	<Card class="m-4 w-full max-w-[600px]">
		<CardHeader>
			<CardTitle>Offline Password Manager - Settings</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="grid w-full items-center gap-4">
				<Button on:click={exportSites} variant="outline">
					<Download size={16} class="mr-2" />
					Export Sites
				</Button>
				<Button on:click={importSites} variant="outline">
					<Upload size={16} class="mr-2" />
					Import Sites
				</Button>
				<Button on:click={panicButton} variant="destructive">
					<AlertTriangle size={16} class="mr-2" />
					Panic Button (Clear All Data)
				</Button>
				<Button on:click={() => goto('/vault')} variant="outline">Back to Vault</Button>
			</div>
		</CardContent>
	</Card>
</div>
