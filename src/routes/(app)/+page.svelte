<script lang="ts">
	import { masterPassword, computationIntensity, lastAuthType } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Slider } from '$lib/components/ui/slider';
	import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group';
	import { validateMnemonic } from 'web-bip39';
	import wordlist from 'web-bip39/wordlists/english';
	import toast from 'svelte-french-toast';
	import RefreshCw from 'lucide-svelte/icons/refresh-cw';
	import Copy from 'lucide-svelte/icons/copy';
	import Loader2 from 'lucide-svelte/icons/loader-2';
	import { createAvatar } from '@dicebear/core';
	import { identicon } from '@dicebear/collection';
	import { deriveMasterKey, deriveBip39MasterKey } from '$lib/crypto';
	import { generateMnemonic } from 'web-bip39';

	export let data;

	let passphrase = '';
	let mnemonic = '';
	let currentAuthType: 'password' | 'bip39' = data.authType;
	let avatarSvg = '';
	let isMnemonicValid = false;
	let isLoading = false;

	$: {
		if (passphrase) {
			const avatar = createAvatar(identicon, {
				seed: `${passphrase}-${$computationIntensity}`, // Include computation intensity in the seed
				size: 32
			});
			avatarSvg = avatar.toDataUri();
		} else {
			avatarSvg = '';
		}
	}

	$: {
		validateMnemonic(mnemonic.trim(), wordlist).then((valid) => {
			isMnemonicValid = valid;
		});
	}

	function handleAuthTypeChange(newType: 'password' | 'bip39') {
		$lastAuthType = newType;
	}

	const handleEnter = async () => {
		if (isLoading) return;

		try {
			isLoading = true;

			if (currentAuthType === 'password') {
				if (!passphrase) {
					toast.error('Please enter a passphrase');
					return;
				}
				const derivedKey = await deriveMasterKey(passphrase);
				$masterPassword = derivedKey;
			} else {
				if (!mnemonic) {
					toast.error('Please enter a BIP39 mnemonic');
					return;
				}
				const isValid = await validateMnemonic(mnemonic.trim(), wordlist);
				if (!isValid) {
					toast.error('Invalid BIP39 mnemonic');
					return;
				}
				const derivedKey = await deriveBip39MasterKey(mnemonic.trim());
				$masterPassword = derivedKey;
			}

			goto(`#/vault`);
		} catch (error) {
			toast.error('Error deriving key: ' + (error as Error).message);
		} finally {
			isLoading = false;
		}
	};

	async function createMnemonic() {
		try {
			mnemonic = await generateMnemonic(wordlist, 256); // 24 words
			toast.success('New mnemonic generated');
		} catch (error) {
			toast.error('Error generating mnemonic: ' + (error as Error).message);
		}
	}

	function copyMnemonic() {
		if (isMnemonicValid) {
			navigator.clipboard
				.writeText(mnemonic.trim())
				.then(() => toast.success('Mnemonic copied to clipboard'))
				.catch(() => toast.error('Failed to copy mnemonic'));
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100">
	<Card class="m-4 w-full max-w-[600px]">
		<CardHeader>
			<CardTitle>DeriVault</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="grid w-full items-center gap-4">
				<RadioGroup
					bind:value={currentAuthType}
					onValueChange={(value: string) => handleAuthTypeChange(value as 'password' | 'bip39')}
				>
					<div class="flex items-center space-x-2">
						<RadioGroupItem value="password" id="password" />
						<Label for="password">Passphrase</Label>
					</div>
					<div class="flex items-center space-x-2">
						<RadioGroupItem value="bip39" id="bip39" />
						<Label for="bip39">BIP39 Mnemonic</Label>
					</div>
				</RadioGroup>

				{#if currentAuthType === 'password'}
					<div class="flex flex-col space-y-1.5">
						<Label for="passphrase">Passphrase</Label>
						<div class="flex items-center">
							<Input
								id="passphrase"
								type="password"
								placeholder="Enter your passphrase"
								bind:value={passphrase}
								class="flex-grow"
								disabled={isLoading}
							/>
							{#if avatarSvg}
								<img src={avatarSvg} alt="Identicon" class="ml-2 h-8 w-8" />
							{/if}
						</div>
					</div>
					<div class="flex flex-col space-y-1.5">
						<Label for="computationIntensity">
							Computation Intensity: {$computationIntensity}{$computationIntensity === 3
								? ' (default)'
								: ''}
						</Label>
						<Slider
							id="computationIntensity"
							min={1}
							max={10}
							step={1}
							value={[$computationIntensity]}
							onValueChange={(e) => {
								$computationIntensity = e[0];
							}}
							disabled={isLoading}
						/>
					</div>
				{:else}
					<div class="flex flex-col space-y-1.5">
						<Label for="mnemonic">BIP39 Mnemonic</Label>
						<div class="relative">
							<textarea
								id="mnemonic"
								placeholder="Enter your 24 word BIP39 mnemonic"
								bind:value={mnemonic}
								rows="3"
								class="w-full rounded-md border border-input bg-transparent px-3 py-2 pr-20 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
								disabled={isLoading}
							></textarea>
							<div class="absolute bottom-2 right-2 flex space-x-1">
								{#if isMnemonicValid}
									<Button
										size="sm"
										variant="ghost"
										on:click={copyMnemonic}
										title="Copy mnemonic"
										disabled={isLoading}
									>
										<Copy size={16} />
									</Button>
								{/if}
								<Button
									size="sm"
									variant="ghost"
									on:click={createMnemonic}
									title="Create new mnemonic"
									disabled={isLoading}
								>
									<RefreshCw size={16} />
								</Button>
							</div>
						</div>
					</div>
					<div class="flex flex-col space-y-1.5">
						<Label for="computationIntensity">
							Extra Computation Intensity: {$computationIntensity}{$computationIntensity === 3
								? ' (default)'
								: ''}
						</Label>
						<Slider
							id="computationIntensity"
							min={1}
							max={10}
							step={1}
							value={[$computationIntensity]}
							onValueChange={(e) => {
								$computationIntensity = e[0];
							}}
							disabled={isLoading}
						/>
					</div>
				{/if}

				<div class="flex flex-col space-y-2">
					<Button
						on:click={handleEnter}
						disabled={currentAuthType === 'password' ? !passphrase : !mnemonic || isLoading}
					>
						{#if isLoading}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							Deriving master key...
						{:else}
							Enter vault
						{/if}
					</Button>
					<Button
						on:click={() => {
							goto(`#/onboarding`);
						}}
						variant="outline"
						class="mt-4"
						disabled={isLoading}
					>
						How do you use DeriVault?
					</Button>
				</div>
			</div>
		</CardContent>
	</Card>
</div>
