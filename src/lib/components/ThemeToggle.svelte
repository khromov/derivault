<script lang="ts">
	import { theme, effectiveTheme } from '$lib/stores/theme';
	import { Button } from '$lib/components/ui/button';
	import Sun from 'lucide-svelte/icons/sun';
	import Moon from 'lucide-svelte/icons/moon';
	import Monitor from 'lucide-svelte/icons/monitor';

	// Function to cycle through themes
	function cycleTheme() {
		if ($theme === 'light') $theme = 'dark';
		else if ($theme === 'dark') $theme = 'system';
		else $theme = 'light';
	}

	// Function to set a specific theme
	function setTheme(newTheme: 'light' | 'dark' | 'system') {
		$theme = newTheme;
	}

	export let variant: 'icon' | 'default' = 'icon';
</script>

{#if variant === 'icon'}
	<Button variant="ghost" size="icon" on:click={cycleTheme} title="Toggle theme">
		{#if $theme === 'light'}
			<Sun class="h-[1.2rem] w-[1.2rem]" />
		{:else if $theme === 'dark'}
			<Moon class="h-[1.2rem] w-[1.2rem]" />
		{:else}
			<Monitor class="h-[1.2rem] w-[1.2rem]" />
		{/if}
	</Button>
{:else}
	<div class="flex items-center space-x-2">
		<Button
			variant={$theme === 'light' ? 'default' : 'outline'}
			size="sm"
			on:click={() => setTheme('light')}
			class="px-3"
		>
			<Sun class="mr-1.5 h-[1rem] w-[1rem]" />
			Light
		</Button>
		<Button
			variant={$theme === 'dark' ? 'default' : 'outline'}
			size="sm"
			on:click={() => setTheme('dark')}
			class="px-3"
		>
			<Moon class="mr-1.5 h-[1rem] w-[1rem]" />
			Dark
		</Button>
		<Button
			variant={$theme === 'system' ? 'default' : 'outline'}
			size="sm"
			on:click={() => setTheme('system')}
			class="px-3"
		>
			<Monitor class="mr-1.5 h-[1rem] w-[1rem]" />
			System
		</Button>
	</div>
{/if}
