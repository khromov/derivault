<script lang="ts">
	import { Select as SelectPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';
	import { flyAndScale } from '$lib/utils.js';

	interface Props {
		class?: string;
		children?: import('svelte').Snippet;
		[key: string]: any;
	}

	let {
		class: className = undefined,
		children,
		...rest
	}: Props = $props();
</script>

<SelectPrimitive.Content
	transition={flyAndScale}
	class={cn(
		'relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
		className
	)}
	{...rest}
>
	{@render children?.()}
</SelectPrimitive.Content>