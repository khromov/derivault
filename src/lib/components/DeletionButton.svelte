<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import Trash2 from 'lucide-svelte/icons/trash-2';
	import { sineInOut } from 'svelte/easing';

	export let duration = 2500; // 2 seconds in milliseconds

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
			const rawProgress = Math.min(elapsed / duration, 1);
			progress = sineInOut(rawProgress);

			if (rawProgress < 1) {
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
	<div class="relative z-10">
		<Trash2 size={16} />
	</div>
	{#if pressed}
		<div
			class="absolute bottom-0 left-0 right-0 bg-red-700 transition-none"
			style="height: {progress * 100}%;"
		></div>
	{/if}
</button>

<style>
	button {
		touch-action: none;
	}
</style>
