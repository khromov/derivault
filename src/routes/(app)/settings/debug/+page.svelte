<script lang="ts">
	import { sites } from '$lib/stores';
	import { goto } from '$app/navigation';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import AlertTriangle from 'lucide-svelte/icons/triangle-alert';
	import toast from 'svelte-french-toast';

	const domains = [
		'example.com',
		'test.org',
		'debug.net',
		'sample.io',
		'mock.dev',
		'trial.app',
		'demo.site',
		'staging.web',
		'beta.cloud',
		'temp.co'
	];

	const usernames = [
		'user',
		'admin',
		'test',
		'demo',
		'sample',
		'trial',
		'debug',
		'temp',
		'mock',
		'beta'
	];

	function generateTestEntries() {
		const newEntries = Array.from({ length: 100 }, (_, i) => {
			const domain = domains[Math.floor(Math.random() * domains.length)];
			const username = usernames[Math.floor(Math.random() * usernames.length)];
			const rotationRounds = Math.floor(Math.random() * 5) + 1;

			return {
				email: `test_${username}${i}@${domain}`,
				domain: `test_${domain}`,
				rotationRounds,
				comment: `Test entry ${i + 1} of 100`
			};
		});

		$sites = [...$sites, ...newEntries];
		toast.success('Generated 100 test entries');
	}

	function cleanupTestEntries() {
		const initialCount = $sites.length;
		$sites = $sites.filter(
			(site) => !site.email.startsWith('test_') && !site.domain.startsWith('test_')
		);
		const removedCount = initialCount - $sites.length;
		toast.success(`Removed ${removedCount} test entries`);
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100">
	<Card class="m-4 w-full max-w-[600px]">
		<CardHeader>
			<CardTitle>Debug Tools</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="grid w-full items-center gap-4">
				<div class="rounded-md bg-yellow-50 p-4">
					<div class="flex items-center">
						<AlertTriangle class="mr-2 h-5 w-5 text-yellow-600" />
						<p class="text-sm text-yellow-700">
							These tools are for testing purposes only. Use with caution.
						</p>
					</div>
				</div>

				<Button on:click={generateTestEntries}>Generate 100 Test Entries</Button>
				<Button on:click={cleanupTestEntries} variant="destructive">Clean Up Test Entries</Button>
				<Button on:click={() => goto(`#/settings`)} variant="outline">Back to Settings</Button>
			</div>
		</CardContent>
	</Card>
</div>
