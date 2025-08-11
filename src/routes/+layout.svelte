<script lang="ts">
	import '../app.css';
	import { APP_NAME } from '$lib/utils/constants';
	import { Toaster } from 'svelte-sonner';
</script>

<svelte:head>
	<title>{APP_NAME}</title>
</svelte:head>

<slot/>

<!-- Global Toaster for notifications -->
<Toaster richColors position="top-right" />

<!-- Global layout for all admin pages (includes Sidebar) -->
