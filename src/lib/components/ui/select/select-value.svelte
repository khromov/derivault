<script lang="ts">
	import { Select as SelectPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	interface Props {
		class?: string;
		placeholder?: string;
		[key: string]: any;
	}

	let {
		class: className = undefined,
		placeholder = undefined,
		...rest
	}: Props = $props();
</script>

<SelectPrimitive.Value
	class={cn('text-sm', className)}
	{placeholder}
	{...rest}
/>