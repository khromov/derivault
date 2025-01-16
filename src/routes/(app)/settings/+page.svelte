<script lang="ts">
	import { masterPassword, sites, computationIntensity } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import AlertTriangle from 'lucide-svelte/icons/triangle-alert';
	import Download from 'lucide-svelte/icons/download';
	import Upload from 'lucide-svelte/icons/upload';
	import Bug from 'lucide-svelte/icons/bug';
	import { base } from '$app/paths';

	function panicButton() {
		$sites = [];
		$masterPassword = null;
		$computationIntensity = 3;
		localStorage.clear();
		goto(`${base}/`);
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100">
	<Card class="m-4 w-full max-w-[600px]">
		<CardHeader>
			<CardTitle>DeriVault - Settings</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="grid w-full items-center gap-4">
				<Button on:click={() => goto(`${base}/settings/export`)} variant="outline">
					<Download size={16} class="mr-2" />
					Export Vault
				</Button>
				<Button on:click={() => goto(`${base}/settings/import`)} variant="outline">
					<Upload size={16} class="mr-2" />
					Import Vault
				</Button>
				<Button on:click={panicButton} variant="destructive">
					<AlertTriangle size={16} class="mr-2" />
					Panic Button (Clear All Data)
				</Button>
				<Button on:click={() => goto(`${base}/settings/benchmark`)} variant="outline">
					<Upload size={16} class="mr-2" />
					Benchmark cryptographic functions
				</Button>
				<Button on:click={() => goto(`${base}/settings/debug`)} variant="outline">
					<Bug size={16} class="mr-2" />
					Debug Tools
				</Button>
				<Button on:click={() => goto(`${base}/vault`)} variant="outline">Back to Vault</Button>
			</div>
		</CardContent>
	</Card>
</div>
