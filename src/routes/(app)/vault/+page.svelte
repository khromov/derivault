<script lang="ts">
	import { masterPassword, sites } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Plus, Settings, Copy, Edit, LogOut, Search } from 'lucide-svelte';
	import DeletionButton from '$lib/components/DeletionButton.svelte';
	import toast from 'svelte-french-toast';
	import { base } from '$app/paths';

	export let data;

	let hoveredSite: number | null = null;
	let searchTerm = '';

	$: sitePasswords = data.sites;

	function removeSite(index: number) {
		$sites = $sites.filter((_, i) => i !== index);
		sitePasswords = sitePasswords.filter((_, i) => i !== index);
		toast.success('Site removed successfully');
	}

	function editSite(index: number) {
		goto(`${base}/add?edit=${index}`);
	}

	function copyToClipboard(password: string) {
		navigator.clipboard.writeText(password);
		toast.success('Password copied to clipboard!');
	}

	function searchSites(
		sites: Array<{ domain: string; email: string; comment?: string }>,
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
		? searchSites(sitePasswords, searchTerm)
		: sitePasswords.map((site, index) => ({ ...site, score: 0, index }));
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100 p-4">
	<Card class="w-full max-w-[500px]">
		<CardHeader>
			<CardTitle>Offline Password Manager</CardTitle>
		</CardHeader>
		<CardContent class="p-4">
			<div class="mb-4">
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
										<Button on:click={() => editSite(site.index)} size="sm" variant="outline">
											<Edit size={16} />
										</Button>
										<Button
											on:click={() => copyToClipboard(site.password)}
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
			$masterPassword = '';
			goto(`${base}/`);
		}}
		size="icon"
		variant="outline"
	>
		<LogOut size={24} />
	</Button>
	<Button on:click={() => goto(`${base}/settings`)} size="icon" variant="outline">
		<Settings size={24} />
	</Button>
	<Button on:click={() => goto(`${base}/add`)} size="icon">
		<Plus size={24} />
	</Button>
</div>
