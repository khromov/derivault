<script lang="ts">
	import { RadioGroup as RadioGroupPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	type $$Props = RadioGroupPrimitive.Props;

	interface Props {
		class?: $$Props['class'];
		value?: $$Props['value'];
		children?: import('svelte').Snippet;
		[key: string]: any;
	}

	let {
		class: className = undefined,
		value = $bindable(undefined),
		children,
		...rest
	}: Props = $props();
</script>

<RadioGroupPrimitive.Root bind:value class={cn('grid gap-2', className)} {...rest}>
	{@render children?.()}
</RadioGroupPrimitive.Root>
