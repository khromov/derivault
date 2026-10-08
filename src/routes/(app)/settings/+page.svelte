<script lang="ts">
	import { masterPassword, sites, computationIntensity, lastAuthType, language } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import AlertTriangle from 'lucide-svelte/icons/triangle-alert';
	import Download from 'lucide-svelte/icons/download';
	import Upload from 'lucide-svelte/icons/upload';
	import Bug from 'lucide-svelte/icons/bug';
	import { loadLocale } from 'wuchale/load-utils';

	function panicButton() {
		$sites = [];
		$computationIntensity = 3;
		$masterPassword = null;
		$lastAuthType = 'password';
		localStorage.clear();
		goto(`#/`);
	}

	$effect(() => {
		loadLocale($language);
	});
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100">
	<Card class="m-4 w-full max-w-[600px]">
		<CardHeader>
			<CardTitle>DeriVault - Settings</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="grid w-full items-center gap-4">
				<div class="space-y-2">
					<label for="language" class="text-sm font-medium">Language</label>
					<select
						id="language"
						bind:value={$language}
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="en">English</option>
						<option value="sv">Svenska</option>
					</select>
				</div>
				<Button on:click={() => goto(`#/settings/export`)} variant="outline">
					<Download size={16} class="mr-2" />
					Export Vault
				</Button>
				<Button on:click={() => goto(`#/settings/import`)} variant="outline">
					<Upload size={16} class="mr-2" />
					Import Vault
				</Button>
				<Button on:click={panicButton} variant="destructive">
					<AlertTriangle size={16} class="mr-2" />
					Panic Button (Clear All Data)
				</Button>
				<Button on:click={() => goto(`#/settings/benchmark`)} variant="outline">
					<Upload size={16} class="mr-2" />
					Benchmark cryptographic functions
				</Button>
				<Button on:click={() => goto(`#/settings/debug`)} variant="outline">
					<Bug size={16} class="mr-2" />
					Debug Tools
				</Button>
				<Button on:click={() => goto(`#/vault`)} variant="outline">Back to Vault</Button>
			</div>
		</CardContent>
	</Card>
</div>
