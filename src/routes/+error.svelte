<script lang="ts">
	import { page } from '$app/stores';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { AlertTriangle } from 'lucide-svelte';
	export let form;

	$: console.warn('Error: ', $page.error?.message);
	$: isCryptoError = $page.error?.message?.includes('cryptographic functions') ?? false;
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100">
	<Card class="m-4 w-full max-w-[600px] border-2 border-red-500">
		<CardHeader class="bg-red-100 p-4">
			<CardTitle class="flex items-center text-red-700">
				<AlertTriangle class="mr-2" />
				Error
			</CardTitle>
		</CardHeader>
		<CardContent class="p-6">
			<p class="mb-4 font-semibold text-red-600">
				{$page.error?.message ?? 'An unknown error occurred'}
			</p>
			{#if isCryptoError}
				<div class="rounded-md bg-red-50 p-4">
					<p class="mb-2 text-red-800">
						This application requires modern cryptographic capabilities to function securely. Please
						try the following:
					</p>
					<ul class="mt-2 list-disc pl-6 text-red-700">
						<li>Update your browser to the latest version</li>
						<li>Try a different modern browser (Chrome, Firefox, Safari, or Edge)</li>
						<li>
							If you're using a private/incognito window, try using a regular browsing window
							instead
						</li>
						<li>
							Check if you have any browser extensions or security software that might be blocking
							access to cryptographic functions
						</li>
					</ul>
				</div>
			{:else}
				<p class="text-red-600">
					We apologize for the inconvenience. If the problem persists, please contact support.
				</p>
			{/if}
		</CardContent>
	</Card>
</div>
