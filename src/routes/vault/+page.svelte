<script lang="ts">
	import { onMount } from 'svelte';
	import { masterPassword, computationIntensity, sites } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Slider } from '$lib/components/ui/slider';
	import { Trash2, Plus, Settings, AlertTriangle, Copy, Edit, LogOut } from 'lucide-svelte';

	let newSite = { email: '', domain: '', rotationRounds: 1 };
	let editingSite: number | null = null;
	let hoveredSite: number | null = null;
	let passwords: Record<string, string> = {};
	let screen: 'main' | 'addSite' | 'settings' = 'main';

	onMount(() => {
		if (!$masterPassword) {
			goto('/');
		}
		updatePasswords();
	});

	$: {
		if ($masterPassword && newSite.email && newSite.domain) {
			generatePassword(newSite).then((password) => {
				passwords[newSite.email] = password;
				passwords = passwords;
			});
		}
	}

	async function deriveMasterKey(passphrase: string) {
		const encoder = new TextEncoder();
		const passphraseBuffer = encoder.encode(passphrase);
		const salt = encoder.encode('ConstantSaltForDeterministicResults');

		const keyMaterial = await window.crypto.subtle.importKey(
			'raw',
			passphraseBuffer,
			{ name: 'PBKDF2' },
			false,
			['deriveBits']
		);

		const derivedBits = await window.crypto.subtle.deriveBits(
			{
				name: 'PBKDF2',
				salt: salt,
				iterations: 100000 * $computationIntensity,
				hash: 'SHA-256'
			},
			keyMaterial,
			256
		);

		return new Uint8Array(derivedBits);
	}

	async function generatePassword(site: typeof newSite) {
		if ($masterPassword && site.email && site.domain) {
			const masterKey = await deriveMasterKey($masterPassword);
			const encoder = new TextEncoder();
			const siteData = encoder.encode(`${site.email}:${site.domain}:${site.rotationRounds}`);

			const hmacKey = await window.crypto.subtle.importKey(
				'raw',
				masterKey,
				{ name: 'HMAC', hash: 'SHA-256' },
				false,
				['sign']
			);

			const signature = await window.crypto.subtle.sign('HMAC', hmacKey, siteData);

			const hashArray = Array.from(new Uint8Array(signature));
			const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

			const allChars =
				'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

			let password = '';
			for (let i = 0; i < 16; i++) {
				const charIndex = parseInt(hashHex.substr(i * 2, 2), 16) % allChars.length;
				password += allChars[charIndex];
			}

			return password;
		}
		return '';
	}

	async function updatePasswords() {
		if ($masterPassword) {
			const newPasswords: Record<string, string> = {};
			for (const site of $sites) {
				newPasswords[site.email] = await generatePassword(site);
			}
			passwords = newPasswords;
		}
	}

	function addSite() {
		if (newSite.email && newSite.domain) {
			$sites = [...$sites, newSite];
			newSite = { email: '', domain: '', rotationRounds: 1 };
			screen = 'main';
			updatePasswords();
		}
	}

	function removeSite(index: number) {
		$sites = $sites.filter((_, i) => i !== index);
		updatePasswords();
	}

	function editSite(index: number) {
		editingSite = index;
		newSite = { ...$sites[index] };
		screen = 'addSite';
	}

	function updateSite() {
		if (newSite.email && newSite.domain && editingSite !== null) {
			$sites[editingSite] = newSite;
			$sites = $sites;
			newSite = { email: '', domain: '', rotationRounds: 1 };
			editingSite = null;
			screen = 'main';
			updatePasswords();
		}
	}

	function copyToClipboard(password: string) {
		navigator.clipboard.writeText(password);
	}

	function panicButton() {
		$sites = [];
		passwords = {};
		$masterPassword = null;
		$computationIntensity = 3;
		goto('/');
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100">
	<Card class="m-4 w-full max-w-[600px]">
		<CardContent class="p-6">
			{#if screen === 'main'}
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
			{:else if screen === 'addSite'}
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
							on:change={(e) => (newSite.rotationRounds = e.detail[0])}
						/>
					</div>
					{#if newSite.email && newSite.domain}
						<div class="flex flex-col space-y-1.5">
							<Label>Generated Password</Label>
							<div class="rounded bg-gray-100 p-2 font-mono text-sm">
								{passwords[newSite.email] || 'Generating...'}
							</div>
						</div>
					{/if}
					<Button on:click={() => (editingSite !== null ? updateSite() : addSite())}>
						{editingSite !== null ? 'Update Site' : 'Add Site'}
					</Button>
					<Button
						on:click={() => {
							newSite = { email: '', domain: '', rotationRounds: 1 };
							editingSite = null;
							screen = 'main';
						}}
						variant="outline">Cancel</Button
					>
				</div>
			{:else if screen === 'settings'}
				<div class="grid w-full items-center gap-4">
					<Button on:click={panicButton} variant="destructive">
						<AlertTriangle size={16} class="mr-2" />
						Panic Button (Clear All Data)
					</Button>
					<Button on:click={() => (screen = 'main')} variant="outline">Back to Main</Button>
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
	<Button on:click={() => (screen = 'settings')} size="icon" variant="outline">
		<Settings size={24} />
	</Button>
	<Button
		on:click={() => {
			editingSite = null;
			newSite = { email: '', domain: '', rotationRounds: 1 };
			screen = 'addSite';
		}}
		size="icon"
	>
		<Plus size={24} />
	</Button>
</div>
