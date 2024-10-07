<script lang="ts">
	import { page } from '$app/stores';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';

	$: isCryptoError = $page.error.message.includes('cryptographic functions');
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100">
	<Card class="m-4 w-full max-w-[600px]">
		<CardHeader>
			<CardTitle>Error: {$page.status}</CardTitle>
		</CardHeader>
		<CardContent>
			<p class="mb-4">{$page.error.message}</p>
			{#if isCryptoError}
				<p>
					This application requires modern cryptographic capabilities to function securely. Please
					try the following:
				</p>
				<ul class="mt-2 list-disc pl-6">
					<li>Update your browser to the latest version</li>
					<li>Try a different modern browser (Chrome, Firefox, Safari, or Edge)</li>
					<li>
						If you're using a private/incognito window, try using a regular browsing window instead
					</li>
					<li>
						Check if you have any browser extensions or security software that might be blocking
						access to cryptographic functions
					</li>
				</ul>
			{:else}
				<p>We apologize for the inconvenience. If the problem persists, please contact support.</p>
			{/if}
		</CardContent>
	</Card>
</div>
