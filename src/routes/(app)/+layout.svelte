<script>
	import '../../app.css';
	import { Toaster } from 'svelte-french-toast';
	import ThemeProvider from '$lib/components/ThemeProvider.svelte';
</script>

<ThemeProvider>
	<Toaster />
	<slot></slot>
</ThemeProvider>
