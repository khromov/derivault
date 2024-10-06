<script lang="ts">
	import { masterPassword, sites, computationIntensity } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { AlertTriangle } from 'lucide-svelte';

	function panicButton() {
		$sites = [];
		$masterPassword = null;
		$computationIntensity = 3;

		localStorage.removeItem('passwordManagerSites');
		localStorage.removeItem('computationIntensity');

		goto('/');
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100">
	<Card class="m-4 w-full max-w-[600px]">
		<CardHeader>
			<CardTitle>Offline Password Manager - Settings</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="grid w-full items-center gap-4">
				<Button on:click={panicButton} variant="destructive">
					<AlertTriangle size={16} class="mr-2" />
					Panic Button (Clear All Data)
				</Button>
				<Button on:click={() => goto('/vault')} variant="outline">Back to Vault</Button>
			</div>
		</CardContent>
	</Card>
</div>
