import { persisted } from 'svelte-persisted-store';
import { derived } from 'svelte/store';
import { browser } from '$app/environment';

// Define theme types
export type Theme = 'light' | 'dark' | 'system';

// Create a persisted store for the theme
export const theme = persisted<Theme>('derivault-theme', 'system');

// Derived store that resolves the effective theme (light or dark)
export const effectiveTheme = derived(theme, ($theme, set) => {
	if (!browser) {
		set('light');
		return;
	}

	if ($theme === 'system') {
		const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		set(isDark ? 'dark' : 'light');

		// Listen for system theme changes
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const listener = (event: MediaQueryListEvent) => {
			set(event.matches ? 'dark' : 'light');
		};

		mediaQuery.addEventListener('change', listener);
		return () => {
			mediaQuery.removeEventListener('change', listener);
		};
	} else {
		set($theme);
	}
});
