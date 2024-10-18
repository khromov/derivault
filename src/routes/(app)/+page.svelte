<script lang="ts">
	import { masterPassword, computationIntensity } from '$lib/stores';
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
	import { RefreshCw } from 'lucide-svelte';
	import { createAvatar } from '@dicebear/core';
	import { identicon } from '@dicebear/collection';

	let passphrase = '';
	let mnemonic = '';
	let authType: 'password' | 'bip39' = 'password';
	let avatarSvg = '';

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

	const handleEnter = async () => {
		try {
			let derivedKey: Uint8Array;

			if (authType === 'password') {
				if (!passphrase) {
					toast.error('Please enter a passphrase');
					return;
				}
				derivedKey = await deriveKeyFromPassword(passphrase);
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

			console.log('$masterPassword', $masterPassword);
			goto('/vault');
		} catch (error) {
			toast.error('Error deriving key: ' + (error as Error).message);
		}
	};

	async function deriveKeyFromPassword(password: string): Promise<Uint8Array> {
		const encoder = new TextEncoder();
		const data = encoder.encode(password);
		const salt = encoder.encode('ConstantSaltForDeterministicResults');

		const keyMaterial = await window.crypto.subtle.importKey('raw', data, 'PBKDF2', false, [
			'deriveBits'
		]);

		const derivedBits = await window.crypto.subtle.deriveBits(
			{
				name: 'PBKDF2',
				salt,
				iterations: 100000 * $computationIntensity,
				hash: 'SHA-256'
			},
			keyMaterial,
			256
		);

		return new Uint8Array(derivedBits);
	}

	async function createMnemonic() {
		try {
			mnemonic = await generateMnemonic(wordlist, 256); // 24 words
			toast.success('New mnemonic generated');
		} catch (error) {
			toast.error('Error generating mnemonic: ' + (error as Error).message);
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100">
	<Card class="m-4 w-full max-w-[600px]">
		<CardHeader>
			<CardTitle>Offline Password Manager</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="grid w-full items-center gap-4">
				<RadioGroup bind:value={authType}>
					<div class="flex items-center space-x-2">
						<RadioGroupItem value="password" id="password" />
						<Label for="password">Passphrase</Label>
					</div>
					<div class="flex items-center space-x-2">
						<RadioGroupItem value="bip39" id="bip39" />
						<Label for="bip39">BIP39 Mnemonic</Label>
					</div>
				</RadioGroup>

				{#if authType === 'password'}
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
								<img src={avatarSvg} alt="Identicon" class="ml-2 h-8 w-8 rounded-full" />
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
								class="w-full rounded-md border border-input bg-transparent px-3 py-2 pr-10 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
							/>
							<Button
								class="absolute bottom-2 right-2"
								size="sm"
								variant="ghost"
								on:click={createMnemonic}
								title="Create new mnemonic"
							>
								<RefreshCw size={16} />
							</Button>
						</div>
					</div>
				{/if}

				<Button on:click={handleEnter} disabled={authType === 'password' ? !passphrase : !mnemonic}>
					Enter
				</Button>
			</div>
		</CardContent>
	</Card>
</div>
