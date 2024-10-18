<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { Trash2 } from 'lucide-svelte';

	export let duration = 4000; // 4 seconds in milliseconds

	let pressed = false;
	let progress = 0;
	let timeoutId: number | null = null;
	let startTime: number;

	const dispatch = createEventDispatcher();

	function handleMouseDown() {
		pressed = true;
		startTime = Date.now();
		requestAnimationFrame(updateProgress);
	}

	function handleMouseUp() {
		if (pressed) {
			pressed = false;
			progress = 0;
			if (timeoutId) {
				clearTimeout(timeoutId);
				timeoutId = null;
			}
		}
	}

	function updateProgress() {
		if (pressed) {
			const elapsed = Date.now() - startTime;
			progress = Math.min(elapsed / duration, 1);

			if (progress < 1) {
				requestAnimationFrame(updateProgress);
			} else {
				dispatch('delete');
				pressed = false;
			}
		}
	}

	onMount(() => {
		return () => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
	});
</script>

<button
	class="relative overflow-hidden rounded bg-red-500 p-2 text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
	on:mousedown={handleMouseDown}
	on:mouseup={handleMouseUp}
	on:mouseleave={handleMouseUp}
	on:touchstart|preventDefault={handleMouseDown}
	on:touchend|preventDefault={handleMouseUp}
>
	<Trash2 size={16} />
	{#if pressed}
		<div
			class="absolute bottom-0 left-0 right-0 bg-red-700 transition-all duration-100 ease-linear"
			style="height: {progress * 100}%;"
		/>
	{/if}
</button>

<style>
	button {
		touch-action: none;
	}
</style>
