<script lang="ts">
	import { masterPassword, computationIntensity, lastAuthType } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Slider } from '$lib/components/ui/slider';
	import { RadioGroup, RadioGroupItem } from '$lib/components/ui/radio-group';
	import { validateMnemonic, mnemonicToSeed, generateMnemonic } from 'web-bip39';
	import wordlist from 'web-bip39/wordlists/english';
	import toast from 'svelte-french-toast';
	import RefreshCw from 'lucide-svelte/icons/refresh-cw';
	import Copy from 'lucide-svelte/icons/copy';
	import { createAvatar } from '@dicebear/core';
	import { identicon } from '@dicebear/collection';
	import { deriveMasterKey } from '$lib/crypto';
	import { base } from '$app/paths';

	export let data;

	let passphrase = '';
	let mnemonic = '';
	let currentAuthType: 'password' | 'bip39' = data.authType;
	let avatarSvg = '';
	let isMnemonicValid = false;

	$: {
		if (passphrase) {
			const avatar = createAvatar(identicon, {
				seed: passphrase,
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
		try {
			let derivedKey: Uint8Array;

			if (currentAuthType === 'password') {
				if (!passphrase) {
					toast.error('Please enter a passphrase');
					return;
				}
				derivedKey = await deriveMasterKey(passphrase);
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
				derivedKey = await mnemonicToSeed(mnemonic.trim());
			}

			$masterPassword = Array.from(derivedKey)
				.map((b) => b.toString(16).padStart(2, '0'))
				.join('');

			// console.log('$masterPassword', $masterPassword);
			goto(`${base}/vault`);
		} catch (error) {
			toast.error('Error deriving key: ' + (error as Error).message);
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
							/>
							{#if avatarSvg}
								<img src={avatarSvg} alt="Identicon" class="ml-2 h-8 w-8" />
							{/if}
						</div>
					</div>
					<div class="flex flex-col space-y-1.5">
						<Label for="computationIntensity">
							Computation Intensity: {$computationIntensity}{$computationIntensity === 5
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
							></textarea>
							<div class="absolute bottom-2 right-2 flex space-x-1">
								{#if isMnemonicValid}
									<Button size="sm" variant="ghost" on:click={copyMnemonic} title="Copy mnemonic">
										<Copy size={16} />
									</Button>
								{/if}
								<Button
									size="sm"
									variant="ghost"
									on:click={createMnemonic}
									title="Create new mnemonic"
								>
									<RefreshCw size={16} />
								</Button>
							</div>
						</div>
					</div>
				{/if}

				<div class="flex flex-col space-y-2">
					<Button
						on:click={handleEnter}
						disabled={currentAuthType === 'password' ? !passphrase : !mnemonic}
					>
						Enter vault
					</Button>
					<Button
						on:click={() => {
							goto(`${base}/onboarding`);
						}}
						variant="outline"
						class="mt-4"
					>
						How do you use DeriVault?
					</Button>
				</div>
			</div>
		</CardContent>
	</Card>
</div>
