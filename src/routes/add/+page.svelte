<script lang="ts">
	import { onMount } from 'svelte';
	import { masterPassword, sites, computationIntensity } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Slider } from '$lib/components/ui/slider';

	let newSite = { email: '', domain: '', rotationRounds: 1 };
	let editingIndex: number | null = null;
	let generatedPassword = '';

	onMount(() => {
		if (!$masterPassword) {
			goto('/');
		}
		const urlParams = new URLSearchParams(window.location.search);
		const editParam = urlParams.get('edit');
		if (editParam !== null) {
			editingIndex = parseInt(editParam, 10);
			newSite = { ...$sites[editingIndex] };
		}
		updateGeneratedPassword();
	});

	async function updateGeneratedPassword() {
		if ($masterPassword && newSite.email && newSite.domain) {
			generatedPassword = await generatePassword(newSite);
		} else {
			generatedPassword = '';
		}
	}

	$: {
		if ($masterPassword && newSite.email && newSite.domain) {
			updateGeneratedPassword();
		}
	}

	async function generatePassword(site: typeof newSite) {
		// Implement the password generation logic here
		// This is a placeholder and should be replaced with your actual implementation
		return 'generated-password';
	}

	function addOrUpdateSite() {
		if (newSite.email && newSite.domain) {
			if (editingIndex !== null) {
				$sites[editingIndex] = newSite;
				$sites = $sites;
			} else {
				$sites = [...$sites, newSite];
			}
			goto('/vault');
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100">
	<Card class="m-4 w-full max-w-[600px]">
		<CardHeader>
			<CardTitle>Offline Password Manager - {editingIndex !== null ? 'Edit' : 'Add'} Site</CardTitle
			>
		</CardHeader>
		<CardContent>
			<div class="grid w-full items-center gap-4">
				<div class="flex flex-col space-y-1.5">
					<Label for="email">Email/Username</Label>
					<Input id="email" placeholder="Enter email or username" bind:value={newSite.email} />
				</div>
				<div class="flex flex-col space-y-1.5">
					<Label for="domain">Domain</Label>
					<Input id="domain" placeholder="Enter website domain" bind:value={newSite.domain} />
				</div>
				<div class="flex flex-col space-y-1.5">
					<Label for="rotationRounds">Password Rotation: {newSite.rotationRounds}</Label>
					<Slider
						id="rotationRounds"
						min={1}
						max={10}
						step={1}
						value={[newSite.rotationRounds]}
						onValueChange={(e) => (newSite.rotationRounds = e[0])}
					/>
				</div>
				{#if newSite.email && newSite.domain}
					<div class="flex flex-col space-y-1.5">
						<Label>Generated Password</Label>
						<div class="rounded bg-gray-100 p-2 font-mono text-sm">
							{generatedPassword || 'Generating...'}
						</div>
					</div>
				{/if}
				<Button on:click={addOrUpdateSite}>
					{editingIndex !== null ? 'Update Site' : 'Add Site'}
				</Button>
				<Button on:click={() => goto('/vault')} variant="outline">Cancel</Button>
			</div>
		</CardContent>
	</Card>
</div>
