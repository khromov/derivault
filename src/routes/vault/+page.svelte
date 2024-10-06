<script lang="ts">
	import { sites } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Trash2, Plus, Settings, Copy, Edit, LogOut } from 'lucide-svelte';
	import toast from 'svelte-french-toast';

	export let data;

	let hoveredSite: number | null = null;

	$: sitePasswords = data.sites;

	function removeSite(index: number) {
		$sites = $sites.filter((_, i) => i !== index);
		sitePasswords = sitePasswords.filter((_, i) => i !== index);
	}

	function editSite(index: number) {
		goto(`/add?edit=${index}`);
	}

	function copyToClipboard(password: string) {
		navigator.clipboard.writeText(password);
		toast.success('Password copied to clipboard!');
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100">
	<Card class="m-4 w-full max-w-[600px]">
		<CardHeader>
			<CardTitle>Offline Password Manager</CardTitle>
		</CardHeader>
		<CardContent class="p-6">
			{#if sitePasswords.length === 0}
				<div class="py-8 text-center text-gray-500">
					No sites yet, add one via the bottom right button
				</div>
			{:else}
				<div class="grid w-full items-center gap-4">
					<div class="space-y-4">
						{#each sitePasswords as site, index}
							<Card class="p-4">
								<div class="flex items-center justify-between">
									<div>
										<div class="font-semibold">{site.domain}</div>
										<div class="text-sm text-gray-500">{site.email}</div>
										<div class="text-xs text-gray-400">Rotation: {site.rotationRounds}</div>
									</div>
									<div class="flex items-center space-x-2">
										<div
											class="rounded bg-gray-100 p-1 font-mono text-sm transition-opacity duration-200"
											style="opacity: {hoveredSite === index ? '1' : '0'};"
										>
											{site.password}
										</div>
										<Button
											on:click={() => copyToClipboard(site.password)}
											size="sm"
											on:mouseenter={() => (hoveredSite = index)}
											on:mouseleave={() => (hoveredSite = null)}
										>
											<Copy size={16} />
										</Button>
										<Button on:click={() => editSite(index)} size="sm" variant="outline">
											<Edit size={16} />
										</Button>
										<Button on:click={() => removeSite(index)} size="sm" variant="destructive">
											<Trash2 size={16} />
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
			goto('/');
		}}
		size="icon"
		variant="outline"
	>
		<LogOut size={24} />
	</Button>
	<Button on:click={() => goto('/settings')} size="icon" variant="outline">
		<Settings size={24} />
	</Button>
	<Button on:click={() => goto('/add')} size="icon">
		<Plus size={24} />
	</Button>
</div>
