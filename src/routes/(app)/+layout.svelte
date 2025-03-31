<script lang="ts">
	import '../../app.css';
	import { Toaster } from 'svelte-french-toast';
	import { theme, type Theme } from '$lib/stores';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	// This reactive statement runs whenever the theme store changes *after* mount
	$: if (browser && $theme) {
		updateDOMTheme($theme);
	}

	function updateDOMTheme(preference: Theme) {
		const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		const effectiveTheme = preference === 'system' ? (isSystemDark ? 'dark' : 'light') : preference;

		if (effectiveTheme === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}

	onMount(() => {
		// Apply theme immediately on mount based on store/system preference
		// This ensures reactivity if the script in app.html didn't run or state changes
		updateDOMTheme($theme);

		// Listen for system preference changes only if theme is 'system'
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

		const systemChangeListener = (e: MediaQueryListEvent) => {
			if ($theme === 'system') {
				if (e.matches) {
					document.documentElement.classList.add('dark');
				} else {
					document.documentElement.classList.remove('dark');
				}
			}
		};

		mediaQuery.addEventListener('change', systemChangeListener);

		// Cleanup listener on component destroy
		return () => {
			mediaQuery.removeEventListener('change', systemChangeListener);
		};
	});
</script>

<Toaster />
<slot></slot>
