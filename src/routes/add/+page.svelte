<script lang="ts">
	import { sites } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Slider } from '$lib/components/ui/slider';
	import { generatePassword } from '$lib/crypto';
	import { Copy, ChevronDown, ChevronUp } from 'lucide-svelte';
	import toast from 'svelte-french-toast';
	import { slide } from 'svelte/transition';

	export let data;

	let newSite = data.site
		? { ...data.site, comment: data.site.comment || '' }
		: { email: '', domain: '', rotationRounds: 1, comment: '' };
	let editingIndex = data.editIndex;
	let generatedPassword = data.generatedPassword;
	let showAdvanced = false;

	$: {
		if (newSite.email && newSite.domain) {
			generatePassword(data.derivedKey, newSite).then((password) => {
				generatedPassword = password;
			});
		} else {
			generatedPassword = '';
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

	function copyToClipboard() {
		if (generatedPassword) {
			navigator.clipboard.writeText(generatedPassword);
			toast.success('Password copied to clipboard!');
		}
	}

	function toggleAdvanced() {
		showAdvanced = !showAdvanced;
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
					<Label>Generated Password</Label>
					<div class="flex items-center">
						<div
							class="flex h-[2.5rem] flex-grow items-center rounded bg-gray-100 p-2 font-mono text-sm"
						>
							{#if newSite.email && newSite.domain}
								{generatedPassword || 'Generating...'}
							{:else}
								<span class="text-gray-400">Please fill in the Email / Username and Domain</span>
							{/if}
						</div>
						<Button on:click={copyToClipboard} size="sm" class="ml-2" disabled={!generatedPassword}>
							<Copy size={16} />
						</Button>
					</div>
				</div>
				<div>
					<Button on:click={toggleAdvanced} variant="outline" class="w-full justify-between">
						Advanced
						{#if showAdvanced}
							<ChevronUp size={16} />
						{:else}
							<ChevronDown size={16} />
						{/if}
					</Button>
					{#if showAdvanced}
						<div transition:slide={{ duration: 300 }} class="mt-4 space-y-4">
							<div class="flex flex-col space-y-1.5">
								<Label for="rotationRounds">Password Rotation: {newSite.rotationRounds}</Label>
								<div class="px-3 py-4">
									<Slider
										id="rotationRounds"
										min={1}
										max={10}
										step={1}
										value={[newSite.rotationRounds]}
										onValueChange={(e) => {
											newSite.rotationRounds = e[0];
										}}
									/>
								</div>
							</div>
							<div class="flex flex-col space-y-1.5">
								<Label for="comment">Comment</Label>
								<textarea
									id="comment"
									bind:value={newSite.comment}
									rows="3"
									class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
									placeholder="Add an optional comment (note: this is not encrypted)"
								/>
							</div>
						</div>
					{/if}
				</div>
				<Button on:click={addOrUpdateSite} disabled={!newSite.email || !newSite.domain}>
					{data.editMode ? 'Update Site' : 'Add Site'}
				</Button>
				<Button on:click={() => goto('/vault')} variant="outline">Cancel</Button>
			</div>
		</CardContent>
	</Card>
</div>
