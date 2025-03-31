<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import ThemeToggle from './ThemeToggle.svelte';
	import { theme } from '$lib/stores/theme';
</script>

<Card class="w-full">
	<CardHeader>
		<CardTitle>Appearance</CardTitle>
	</CardHeader>
	<CardContent>
		<div class="space-y-4">
			<div>
				<h3 class="mb-3 text-sm font-medium">Theme</h3>
				<div class="flex justify-center">
					<ThemeToggle variant="default" />
				</div>
			</div>

			<div>
				<p class="mt-2 text-sm text-muted-foreground">
					{#if $theme === 'light'}
						Using light theme. Switch to dark theme for reduced eye strain in low-light
						environments.
					{:else if $theme === 'dark'}
						Using dark theme. This can help reduce eye strain in low-light environments.
					{:else}
						Following your system preferences. DeriVault will automatically switch between light and
						dark themes.
					{/if}
				</p>
			</div>
		</div>
	</CardContent>
</Card>
