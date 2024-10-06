<script lang="ts">
	import { onMount } from 'svelte';
	import { masterPassword, sites } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Slider } from '$lib/components/ui/slider';
	import { deriveMasterKey, generatePassword } from '$lib/crypto';

	export let data;

	let newSite = data.site ? { ...data.site } : { email: '', domain: '', rotationRounds: 1 };
	let editingIndex = data.editIndex;
	let generatedPassword = '';
	let derivedMasterKey: Uint8Array | null = null;

	onMount(() => {
		if (!$masterPassword) {
			goto('/');
		} else {
			deriveMasterKey($masterPassword).then((key) => {
				derivedMasterKey = key;
				return updateGeneratedPassword();
			});
		}
	});

	function updateGeneratedPassword() {
		if (derivedMasterKey && newSite.email && newSite.domain) {
			return generatePassword(derivedMasterKey, newSite).then((password) => {
				generatedPassword = password;
			});
		} else {
			generatedPassword = '';
			return Promise.resolve();
		}
	}

	$: {
		if (derivedMasterKey && newSite.email && newSite.domain) {
			updateGeneratedPassword();
		}
	}

	function addOrUpdateSite() {
		if (newSite.email && newSite.domain) {
			if (data.editMode) {
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
			<CardTitle>Offline Password Manager - {data.editMode ? 'Edit' : 'Add'} Site</CardTitle>
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
						onValueChange={(e) => {
							newSite.rotationRounds = e[0];
							updateGeneratedPassword();
						}}
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
					{data.editMode ? 'Update Site' : 'Add Site'}
				</Button>
				<Button on:click={() => goto('/vault')} variant="outline">Cancel</Button>
			</div>
		</CardContent>
	</Card>
</div>
