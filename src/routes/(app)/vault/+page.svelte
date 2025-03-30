<script lang="ts">
	import { masterPassword, sites } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import Plus from 'lucide-svelte/icons/plus';
	import Settings from 'lucide-svelte/icons/settings';
	import Copy from 'lucide-svelte/icons/copy';
	import Edit from 'lucide-svelte/icons/square-pen';
	import LogOut from 'lucide-svelte/icons/log-out';
	import Search from 'lucide-svelte/icons/search';
	import Eye from 'lucide-svelte/icons/eye';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import DeletionButton from '$lib/components/DeletionButton.svelte';
	import toast from 'svelte-french-toast';
	import { generatePassword } from '$lib/crypto';

	export let data;

	let hoveredSite: number | null = null;
	let searchTerm = '';
	let editingIndex: number | null = null;

	$: siteList = data.sites;

	async function removeSite(index: number) {
		$sites = $sites.filter((_, i) => i !== index);
		siteList = siteList.filter((_, i) => i !== index);
		toast.success('Site removed successfully');
	}

	async function editSite(index: number) {
		if (editingIndex !== null) return; // Prevent multiple clicks
		editingIndex = index;
		try {
			await goto(`#/add?edit=${index}`);
		} finally {
			editingIndex = null;
		}
	}

	async function copyToClipboard(site: (typeof siteList)[number]) {
		try {
			const password = await generatePassword(data.derivedKey, site);
			await navigator.clipboard.writeText(password);
			toast.success('Password copied to clipboard!');
		} catch (error) {
			toast.error('Failed to generate or copy password');
			console.error('Error copying password:', error);
		}
	}

	function searchSites(
		sites: Array<{
			domain: string;
			email: string;
			comment?: string;
			rotationRounds: number;
		}>,
		term: string
	) {
		const lowercaseTerm = term.toLowerCase();
		return sites
			.map((site, index) => {
				let score = 0;
				if (site.domain.toLowerCase().includes(lowercaseTerm)) score += 5;
				if (site.comment && site.comment.toLowerCase().includes(lowercaseTerm)) score += 2;
				if (site.email.toLowerCase().includes(lowercaseTerm)) score += 1;
				return { ...site, score, index };
			})
			.filter((site) => site.score > 0)
			.sort((a, b) => b.score - a.score);
	}

	$: filteredSites = searchTerm
		? searchSites(siteList, searchTerm)
		: siteList.map((site, index) => ({ ...site, score: 0, index }));
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100 p-4">
	<Card class="w-full max-w-[500px]">
		<CardHeader>
			<CardTitle>DeriVault</CardTitle>
		</CardHeader>
		<CardContent class="p-4">
			<div class="mb-4 space-y-2">
				<Button
					variant="outline"
					class="w-full justify-between"
					on:click={() => goto(`#/add?quick=true`)}
				>
					<span>Quick Password Lookup</span>
					<Eye class="h-4 w-4" />
				</Button>
				<div class="relative">
					<Search
						class="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400"
					/>
					<Input type="text" placeholder="Search sites..." bind:value={searchTerm} class="pl-8" />
				</div>
			</div>
			{#if filteredSites.length === 0}
				<div class="py-8 text-center text-gray-500">
					{searchTerm
						? 'No matching sites found'
						: 'No sites yet, add one via the bottom right button'}
				</div>
			{:else}
				<div class="grid w-full items-center gap-4">
					<div class="space-y-4">
						{#each filteredSites as site}
							<Card class="p-3">
								<div class="flex flex-col space-y-2">
									<div>
										<div class="font-semibold">{site.domain}</div>
										<div class="text-sm text-gray-500">{site.email}</div>
										<div class="text-xs text-gray-400">Rotation: {site.rotationRounds}</div>
										{#if site.comment}
											<div class="text-xs text-gray-400">Comment: {site.comment}</div>
										{/if}
									</div>
									<div class="flex items-center justify-end space-x-2">
										<DeletionButton on:delete={() => removeSite(site.index)} />
										<Button
											on:click={() => editSite(site.index)}
											size="sm"
											variant="outline"
											disabled={editingIndex === site.index}
										>
											{#if editingIndex === site.index}
												<Loader2 class="h-4 w-4 animate-spin" />
											{:else}
												<Edit size={16} />
											{/if}
										</Button>
										<Button
											on:click={() => copyToClipboard($sites[site.index])}
											size="sm"
											on:mouseenter={() => (hoveredSite = site.index)}
											on:mouseleave={() => (hoveredSite = null)}
										>
											<Copy size={16} />
										</Button>
									</div>
								</div>
							</Card>
						{/each}
					</div>
				</div>
			{/if}
		</CardContent>
	</Card>
</div>

<div class="fixed bottom-4 right-4 flex space-x-2">
	<Button
		on:click={() => {
			$masterPassword = null;
			goto(`#/`);
		}}
		size="icon"
		variant="outline"
		title="Log out"
	>
		<LogOut size={24} />
	</Button>
	<Button on:click={() => goto(`#/settings`)} size="icon" variant="outline" title="Settings">
		<Settings size={24} />
	</Button>
	<Button on:click={() => goto(`#/add`)} size="icon" title="Add site">
		<Plus size={24} />
	</Button>
</div>
