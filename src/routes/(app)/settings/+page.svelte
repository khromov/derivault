<script lang="ts">
	import { masterPassword, sites, computationIntensity, lastAuthType, userLanguage } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import AlertTriangle from 'lucide-svelte/icons/triangle-alert';
	import Download from 'lucide-svelte/icons/download';
	import Upload from 'lucide-svelte/icons/upload';
	import Bug from 'lucide-svelte/icons/bug';

	function panicButton() {
		$sites = [];
		$computationIntensity = 3;
		$masterPassword = null;
		$lastAuthType = 'password';
		$userLanguage = 'en';
		localStorage.clear();
		goto(`#/`);
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100">
	<Card class="m-4 w-full max-w-[600px]">
		<CardHeader>
			<CardTitle>DeriVault - Settings</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="grid w-full items-center gap-4">
				<div class="flex flex-col space-y-2">
					<Label for="language-select">Language</Label>
					<select 
						id="language-select"
						bind:value={$userLanguage}
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="en">English</option>
						<option value="sv">Svenska (Swedish)</option>
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
