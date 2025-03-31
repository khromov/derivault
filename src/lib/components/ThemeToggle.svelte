<script lang="ts">
	import { theme, type Theme } from '$lib/stores';
	import { Button } from '$lib/components/ui/button';
	import Sun from 'lucide-svelte/icons/sun';
	import Moon from 'lucide-svelte/icons/moon';
	import Monitor from 'lucide-svelte/icons/monitor'; // Icon for system preference
	import { flyAndScale } from '$lib/utils';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	let currentEffectiveTheme: 'light' | 'dark' = 'light';
	let mounted = false;

	// Function to determine the effective theme
	function getEffectiveTheme(pref: Theme): 'light' | 'dark' {
		if (!browser) return 'light'; // Default SSR theme

		if (pref === 'system') {
			return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
		}
		return pref;
	}

	// Update the displayed icon based on the effective theme
	$: if (browser) {
		currentEffectiveTheme = getEffectiveTheme($theme);
	}

	function cycleTheme() {
		const current = $theme;
		let next: Theme;
		if (current === 'light') {
			next = 'dark';
		} else if (current === 'dark') {
			next = 'system';
		} else {
			next = 'light';
		}
		$theme = next;
	}

	onMount(() => {
		mounted = true;
		// Initial calculation on mount
		currentEffectiveTheme = getEffectiveTheme($theme);

		// Listen for system preference changes if theme is 'system'
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const systemChangeListener = () => {
			if ($theme === 'system') {
				currentEffectiveTheme = mediaQuery.matches ? 'dark' : 'light';
			}
		};
		mediaQuery.addEventListener('change', systemChangeListener);

		return () => {
			mediaQuery.removeEventListener('change', systemChangeListener);
		};
	});
</script>

{#if mounted}
	<Button on:click={cycleTheme} variant="outline" size="icon" aria-label="Toggle theme">
		{#key $theme}
			<div in:flyAndScale={{ duration: 200, y: -5 }}>
				{#if $theme === 'light'}
					<Sun class="h-[1.2rem] w-[1.2rem]" />
				{:else if $theme === 'dark'}
					<Moon class="h-[1.2rem] w-[1.2rem]" />
				{:else}
					<Monitor class="h-[1.2rem] w-[1.2rem]" />
				{/if}
			</div>
		{/key}
		<span class="sr-only">Toggle theme (Currently: {$theme})</span>
	</Button>
{/if}
