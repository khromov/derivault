<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Slider } from '$lib/components/ui/slider';
	import { masterPassword, computationIntensity } from '$lib/stores';
	import { goto } from '$app/navigation';

	let passphrase = '';

	const handleEnter = async () => {
		if (passphrase) {
			$masterPassword = passphrase;
			goto('/vault');
		}
	};
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100">
	<Card class="m-4 w-full max-w-[600px]">
		<CardHeader>
			<CardTitle>Offline Password Manager</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="grid w-full items-center gap-4">
				<div class="flex flex-col space-y-1.5">
					<Label for="passphrase">Passphrase</Label>
					<Input
						id="passphrase"
						type="password"
						placeholder="Enter your passphrase"
						bind:value={passphrase}
					/>
				</div>
				<div class="flex flex-col space-y-1.5">
					<Label for="computationIntensity">Computation Intensity: {$computationIntensity}</Label>
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
				<Button on:click={handleEnter} disabled={!passphrase}>Enter</Button>
			</div>
		</CardContent>
	</Card>
</div>
