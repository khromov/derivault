<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import { cn } from '$lib/utils';

	export let steps: string | any[] = [];
	export let currentStep: number = 0;
	export let onNext: () => void = () => {};
	export let onPrevious: () => void = () => {};
	export let onComplete: () => void = () => {};

	$: isLastStep = currentStep === steps.length - 1;
	$: isFirstStep = currentStep === 0;
</script>

<Card class="w-full max-w-[600px]">
	<CardContent class="p-6">
		<div class="mb-8">
			<div class="mb-6 flex justify-center">
				{#each steps as _, index}
					<div
						class={cn(
							'mx-1 h-2 w-16 rounded-full transition-colors',
							index === currentStep ? 'bg-primary' : 'bg-secondary'
						)}
					></div>
				{/each}
			</div>

			<div class="text-center">
				<div class="mb-3 flex justify-center">
					<svelte:component this={steps[currentStep].icon} class="h-10 w-10" />
				</div>
				<h2 class="mb-2 text-2xl font-semibold">{steps[currentStep].title}</h2>
				<p class="text-muted-foreground">{steps[currentStep].description}</p>
			</div>
		</div>

		<div class="flex justify-between">
			<Button variant="outline" on:click={onPrevious} disabled={isFirstStep}>
				<ChevronLeft class="mr-2 h-4 w-4" />
				Previous
			</Button>

			<Button on:click={isLastStep ? onComplete : onNext}>
				{#if isLastStep}
					Get Started
				{:else}
					Next
					<ChevronRight class="ml-2 h-4 w-4" />
				{/if}
			</Button>
		</div>
	</CardContent>
</Card>
