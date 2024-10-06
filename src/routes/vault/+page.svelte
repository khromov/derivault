<script lang="ts">
	import { onMount } from 'svelte';
	import { masterPassword, sites } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Trash2, Plus, Settings, Copy, Edit, LogOut } from 'lucide-svelte';

	let hoveredSite: number | null = null;
	let passwords: Record<string, string> = {};

	onMount(() => {
		if (!$masterPassword) {
			goto('/');
		}
		updatePasswords();
	});

	async function updatePasswords() {
		if ($masterPassword) {
			const newPasswords: Record<string, string> = {};
			for (const site of $sites) {
				newPasswords[site.email] = await generatePassword(site);
			}
			passwords = newPasswords;
		}
	}

	async function generatePassword(site: { email: string; domain: string; rotationRounds: number }) {
		// Implement the password generation logic here
		// This is a placeholder and should be replaced with your actual implementation
		return 'generated-password';
	}

	function removeSite(index: number) {
		$sites = $sites.filter((_, i) => i !== index);
		updatePasswords();
	}

	function editSite(index: number) {
		goto(`/add?edit=${index}`);
	}

	function copyToClipboard(password: string) {
		navigator.clipboard.writeText(password);
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100">
	<Card class="m-4 w-full max-w-[600px]">
		<CardHeader>
			<CardTitle>Offline Password Manager</CardTitle>
		</CardHeader>
		<CardContent class="p-6">
			{#if $sites.length === 0}
				<div class="py-8 text-center text-gray-500">
					No sites yet, add one via the bottom right button
				</div>
			{:else}
				<div class="grid w-full items-center gap-4">
					<div class="space-y-4">
						{#each $sites as site, index}
							<Card class="p-4">
								<div class="flex items-center justify-between">
									<div>
										<div class="font-semibold">{site.domain}</div>
										<div class="text-sm text-gray-500">{site.email}</div>
										<div class="text-xs text-gray-400">Rotation: {site.rotationRounds}</div>
									</div>
									<div class="flex items-center space-x-2">
										{#if hoveredSite === index}
											<div class="rounded bg-gray-100 p-1 font-mono text-sm">
												{passwords[site.email] || 'Generating...'}
											</div>
										{/if}
										<Button
											on:click={() => copyToClipboard(passwords[site.email])}
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
			$masterPassword = null;
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
