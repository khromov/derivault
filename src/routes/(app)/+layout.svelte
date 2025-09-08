<script lang="ts">
	import '../../app.css';
	import { Toaster } from 'svelte-sonner';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<Toaster position="top-center" />
{@render children?.()}
