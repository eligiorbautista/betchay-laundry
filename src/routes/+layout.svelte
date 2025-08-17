<script lang="ts">
	import '../app.css';
	import { APP_NAME } from '$lib/utils/constants';
	import { Toaster } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import { auth } from '$lib/stores/authStore';

	// Initialize authentication when app loads
	onMount(() => {
		auth.initialize();
	});
</script>

<svelte:head>
	<title>{APP_NAME}</title>
</svelte:head>

<slot/>

<!-- toast notifications -->
<Toaster richColors position="top-right" />

<!-- main layout wrapper -->
