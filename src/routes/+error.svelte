<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Home, ArrowLeft, RefreshCw } from 'lucide-svelte';

	// Get error details from the page store
	$: status = $page.status;
	$: message = $page.error?.message || 'Something went wrong';

	// Function to get appropriate error message based on status
	function getErrorMessage(status: number): string {
		switch (status) {
			case 404:
				return 'Page not found';
			case 403:
				return 'Access forbidden';
			case 500:
				return 'Internal server error';
			case 401:
				return 'Unauthorized access';
			default:
				return 'Something went wrong';
		}
	}

	// Function to get appropriate description based on status
	function getErrorDescription(status: number): string {
		switch (status) {
			case 404:
				return 'The page you are looking for doesn\'t exist or has been moved.';
			case 403:
				return 'You don\'t have permission to access this resource.';
			case 500:
				return 'We\'re experiencing technical difficulties. Please try again later.';
			case 401:
				return 'Please log in to access this page.';
			default:
				return 'An unexpected error occurred. Please try again.';
		}
	}

	function goHome() {
		goto('/');
	}

	function goBack() {
		window.history.back();
	}

	function refreshPage() {
		window.location.reload();
	}
</script>

<svelte:head>
	<title>Error {status} - Laundry Management System</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full text-center">
		<!-- Error Icon -->
		<div class="mx-auto h-24 w-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
			<div class="text-4xl font-bold text-red-600">
				{status}
			</div>
		</div>

		<!-- Error Title -->
		<h1 class="text-3xl font-bold text-gray-900 mb-4">
			{getErrorMessage(status)}
		</h1>

		<!-- Error Description -->
		<p class="text-gray-600 mb-8">
			{getErrorDescription(status)}
		</p>

		<!-- Action Buttons -->
		<div class="space-y-4">
			<!-- Go Home Button -->
			<button
				on:click={goHome}
				class="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
			>
				<Home class="w-4 h-4 mr-2" />
				Go to Home
			</button>

			<!-- Go Back Button -->
			<button
				on:click={goBack}
				class="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
			>
				<ArrowLeft class="w-4 h-4 mr-2" />
				Go Back
			</button>

			<!-- Refresh Button -->
			<button
				on:click={refreshPage}
				class="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
			>
				<RefreshCw class="w-4 h-4 mr-2" />
				Refresh Page
			</button>
		</div>

		<!-- Additional Help -->
		{#if status === 404}
					<div class="mt-8 p-4 bg-blue-50 rounded-lg">
			<p class="text-sm text-blue-800">
					If you believe this is an error, please contact support.
				</p>
			</div>
		{/if}

		<!-- Debug Info (only in development) -->
		{#if import.meta.env.DEV && message}
			<div class="mt-8 p-4 bg-gray-100 rounded-lg text-left">
				<p class="text-xs text-gray-600 font-mono">
					<strong>Debug:</strong> {message}
				</p>
			</div>
		{/if}
	</div>
</div>
