<script lang="ts">
	import { Select as SelectPrimitive } from 'bits-ui';
	import type { Props, Events } from './index.js';

	type $$Props = Props;
	type $$Events = Events;

	interface Props_1 {
		children?: import('svelte').Snippet;
		[key: string]: any;
	}

	let {
		children,
		...rest
	}: Props_1 = $props();
</script>

<SelectPrimitive.Root {...rest}>
	{@render children?.()}
</SelectPrimitive.Root>