<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { deriveMasterKey } from '$lib/crypto';
	import Play from 'lucide-svelte/icons/play';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';

	interface BenchmarkResult {
		intensity: number;
		opsPerSecond: number;
		isRunning: boolean;
		isDone: boolean;
	}

	const TEST_PASSWORD = 'benchmark-test-password';
	const ITERATIONS = 100;

	let results: BenchmarkResult[] = Array.from({ length: 10 }, (_, i) => ({
		intensity: i + 1,
		opsPerSecond: 0,
		isRunning: false,
		isDone: false
	}));

	let isRunning = false;

	async function runBenchmark() {
		if (isRunning) return;
		isRunning = true;

		// Reset results
		results = results.map((r) => ({ ...r, opsPerSecond: 0, isRunning: false, isDone: false }));

		// Run benchmark for each intensity level
		for (let intensity = 1; intensity <= 10; intensity++) {
			const index = intensity - 1;
			results[index].isRunning = true;
			results = [...results];

			const startTime = performance.now();

			try {
				// Run multiple iterations
				for (let i = 0; i < ITERATIONS; i++) {
					await deriveMasterKey(TEST_PASSWORD, intensity);
				}

				const endTime = performance.now();
				const timeInSeconds = (endTime - startTime) / 1000;
				const opsPerSecond = ITERATIONS / timeInSeconds;

				results[index].opsPerSecond = opsPerSecond;
				results[index].isDone = true;
			} catch (error) {
				console.error(`Error benchmarking intensity ${intensity}:`, error);
			}

			results[index].isRunning = false;
			results = [...results];
		}

		isRunning = false;
	}

	function formatOps(ops: number): string {
		if (ops === 0) return '-';
		if (ops < 1) return ops.toFixed(2);
		if (ops < 10) return ops.toFixed(1);
		return Math.round(ops).toLocaleString();
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100">
	<Card class="m-4 w-full max-w-[600px]">
		<CardHeader>
			<CardTitle>Password Derivation Benchmark</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="mb-4 text-sm text-gray-600">
				This benchmark measures the speed of password derivation at different computation
				intensities. Higher intensity means better security but slower derivation.
			</div>

			<div class="flex flex-col space-y-2">
				<Button on:click={runBenchmark} disabled={isRunning}>
					<Play size={16} class="mr-2" />
					{isRunning ? 'Running...' : 'Run Benchmark'}
				</Button>
				<Button on:click={() => goto(`${base}/vault`)} variant="outline">Back to Vault</Button>
			</div>

			<div class="mb-4 overflow-x-auto">
				<table class="w-full table-auto">
					<thead>
						<tr>
							<th class="px-4 py-2 text-left">Intensity</th>
							<th class="px-4 py-2 text-right">Operations/second</th>
						</tr>
					</thead>
					<tbody>
						{#each results as result}
							<tr class="border-t">
								<td class="px-4 py-2">{result.intensity}</td>
								<td class="px-4 py-2 text-right font-mono">
									{#if result.isRunning}
										<span class="text-blue-600">Running...</span>
									{:else if result.isDone}
										<span class={result.opsPerSecond < 1 ? 'text-red-600' : ''}>
											{formatOps(result.opsPerSecond)}
										</span>
									{:else}
										-
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</CardContent>
	</Card>
</div>
