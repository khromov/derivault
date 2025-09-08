<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children, data }: Props = $props();
</script>

{data.string}
{@render children?.()}
