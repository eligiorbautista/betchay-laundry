<script lang="ts">
	export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
	export let color: 'primary' | 'secondary' | 'accent' | 'neutral' | 'info' | 'success' | 'warning' | 'error' = 'primary';
	export let message: string = '';
	export let center: boolean = false;

	$: spinnerClasses = `
		${size === 'xs' ? 'text-xs' : ''}
		${size === 'sm' ? 'text-sm' : ''}
		${size === 'md' ? 'text-base' : ''}
		${size === 'lg' ? 'text-lg' : ''}
		${size === 'xl' ? 'text-xl' : ''}
		${color === 'primary' ? 'text-gray-800' : ''}
		${color === 'secondary' ? 'text-gray-600' : ''}
		${color === 'accent' ? 'text-amber-500' : ''}
		${color === 'neutral' ? 'text-gray-700' : ''}
		${color === 'info' ? 'text-sky-500' : ''}
		${color === 'success' ? 'text-emerald-500' : ''}
		${color === 'warning' ? 'text-amber-500' : ''}
		${color === 'error' ? 'text-red-500' : ''}
	`.trim().replace(/\s+/g, ' ');

	$: containerClasses = `
		flex items-center gap-3
		${center ? 'justify-center' : ''}
		${center ? 'min-h-32' : ''}
	`;
</script>

<div class={containerClasses}>
	<svg
		class={`animate-spin ${spinnerClasses}`}
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		width="1em"
		height="1em"
	>
		<circle
			class="opacity-25"
			cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
		<path
			class="opacity-75"
			fill="currentColor"
			d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
	</svg>
	{#if message}
		<span class="text-sm text-gray-600">{message}</span>
	{:else if $$slots.default}
		<slot />
	{/if}
</div>
