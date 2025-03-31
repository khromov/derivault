<script lang="ts">
	import { onMount } from 'svelte';
	import { theme, effectiveTheme } from '$lib/stores/theme';
	import { browser } from '$app/environment';

	// Update the class on the document element
	function updateTheme(value: string) {
		if (!browser) return;
		document.documentElement.classList.toggle('dark', value === 'dark');
	}

	onMount(() => {
		// Initial application of theme
		updateTheme($effectiveTheme);

		// Remove the 'theme-init' script that prevents flash
		const themeScript = document.getElementById('theme-init');
		if (themeScript) {
			themeScript.remove();
		}
	});

	// React to theme changes
	$: updateTheme($effectiveTheme);
</script>

<slot></slot>
