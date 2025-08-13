<script lang="ts">
	import { onMount } from 'svelte';
	import { 
		Settings, 
		User, 
		Save, 
		Lock,
		Eye,
		EyeOff,
		CheckCircle,
		AlertCircle,
		Shield
	} from 'lucide-svelte';
	import LoadingSpinner from '$lib/components/common/LoadingSpinner.svelte';
	import type { PageData } from './$types';
	import type { UserProfile } from '$lib/types/settings';

	export let data: PageData;

	let activeTab = 'profile';
	let loading = false;
	let successMessage = '';
	let errorMessage = '';

	// Form data
	let userProfile: UserProfile = data.userProfile;

	// Password change form
	let currentPassword = '';
	let newPassword = '';
	let confirmPassword = '';
	let showCurrentPassword = false;
	let showNewPassword = false;
	let showConfirmPassword = false;

	function showMessage(message: string, isSuccess = true) {
		if (isSuccess) {
			successMessage = message;
			setTimeout(() => successMessage = '', 3000);
		} else {
			errorMessage = message;
			setTimeout(() => errorMessage = '', 5000);
		}
	}

	function handlePasswordChange() {
		if (newPassword !== confirmPassword) {
			showMessage('New passwords do not match', false);
			return;
		}

		if (newPassword.length < 8) {
			showMessage('Password must be at least 8 characters long', false);
			return;
		}

		loading = true;
		// Simulate API call
		setTimeout(() => {
			loading = false;
			showMessage('Password changed successfully!');
			currentPassword = '';
			newPassword = '';
			confirmPassword = '';
		}, 1000);
	}



	onMount(() => {
		// Initialize form data
		userProfile = { ...data.userProfile };
	});
</script>

<svelte:head>
	<title>Settings - Laundry Management System</title>
</svelte:head>

<div class="p-4 lg:p-6 w-full bg-gray-50 min-h-screen">
	<!-- Header -->
	<div class="mb-6 md:mb-8">
		<div class="flex items-center gap-3 mb-2">
			<Settings class="w-6 md:w-8 h-6 md:h-8 text-gray-800" />
			<h1 class="text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>
		</div>
		<p class="text-gray-600 text-sm md:text-base">Manage your profile and security settings.</p>
	</div>

	<!-- Success/Error Messages -->
	{#if successMessage}
		<div class="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3">
			<CheckCircle class="w-5 h-5 text-emerald-600" />
			<span class="text-emerald-800">{successMessage}</span>
		</div>
	{/if}

	{#if errorMessage}
		<div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
			<AlertCircle class="w-5 h-5 text-red-600" />
			<span class="text-red-800">{errorMessage}</span>
		</div>
	{/if}

	<!-- Tab Navigation -->
	<div class="mb-8">
		<div class="border-b border-gray-200">
			<!-- Desktop Navigation -->
			<nav class="hidden md:flex -mb-px space-x-8">
				<button
					class="py-3 px-1 border-b-2 font-medium text-sm transition-colors {activeTab === 'profile' ? 'border-gray-800 text-gray-800' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
					on:click={() => activeTab = 'profile'}
				>
					<div class="flex items-center gap-2">
						<User class="w-4 h-4" />
						Profile
					</div>
				</button>
				<button
					class="py-3 px-1 border-b-2 font-medium text-sm transition-colors {activeTab === 'security' ? 'border-gray-800 text-gray-800' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
					on:click={() => activeTab = 'security'}
				>
					<div class="flex items-center gap-2">
						<Shield class="w-4 h-4" />
						Security
					</div>
				</button>


			</nav>

			<!-- Mobile Navigation -->
			<nav class="md:hidden -mb-px grid grid-cols-2 gap-2 p-2">
				<button
					class="py-3 px-3 font-medium text-xs transition-colors border-b-2 {activeTab === 'profile' ? 'text-gray-800 bg-gray-50 border-gray-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-transparent'}"
					on:click={() => activeTab = 'profile'}
				>
					<div class="flex flex-col items-center gap-1">
						<User class="w-4 h-4" />
						Profile
					</div>
				</button>
				<button
					class="py-3 px-3 font-medium text-xs transition-colors border-b-2 {activeTab === 'security' ? 'text-gray-800 bg-gray-50 border-gray-800' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-transparent'}"
					on:click={() => activeTab = 'security'}
				>
					<div class="flex flex-col items-center gap-1">
						<Shield class="w-4 h-4" />
						Security
					</div>
				</button>
			</nav>
		</div>
	</div>

	<!-- Tab Content -->
	<div class="max-w-4xl w-full">
		{#if activeTab === 'profile'}
			<!-- User Profile -->
			<div class="bg-white rounded-lg shadow-sm border border-gray-200">
				<div class="px-4 md:px-6 py-4 border-b border-gray-200">
					<h2 class="text-lg font-semibold text-gray-900">Profile Information</h2>
					<p class="text-sm text-gray-600">Manage your account information and basic profile details.</p>
				</div>
				<div class="p-4 md:p-6 space-y-6 md:space-y-8">
					<!-- Account Information -->
					<div>
						<h3 class="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
						<div class="bg-gray-50 rounded-lg p-4">
							<div>
								<label for="email-display" class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
								<p id="email-display" class="text-sm text-gray-900 font-medium">{userProfile.email}</p>
							</div>
						</div>
						<div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
							<div class="flex flex-col sm:flex-row items-start gap-3">
								<AlertCircle class="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
								<div>
									<h4 class="text-sm font-medium text-amber-900">Email Change Notice</h4>
									<p class="text-sm text-amber-700 mt-1">
										To change your email address, please contact the developer at <a href="mailto:eligiobautista.dev@gmail.com" class="font-medium underline hover:text-amber-800">eligiobautista.dev@gmail.com</a> or visit <a href="https://eligiobautista.dev" target="_blank" class="font-medium underline hover:text-amber-800">eligiobautista.dev</a>.
									</p>
								</div>
							</div>
						</div>
					</div>


				</div>
			</div>

		{:else if activeTab === 'security'}
			<!-- Security Settings -->
			<div class="bg-white rounded-lg shadow-sm border border-gray-200">
				<div class="px-4 md:px-6 py-4 border-b border-gray-200">
					<h2 class="text-lg font-semibold text-gray-900">Security Settings</h2>
					<p class="text-sm text-gray-600">Manage your password and security preferences.</p>
				</div>
				<div class="p-4 md:p-6 space-y-6 md:space-y-8">
					<!-- Change Password Section -->
					<div>
						<h3 class="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
						<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
							<div class="flex flex-col sm:flex-row items-start gap-3">
								<Lock class="w-5 h-5 text-gray-800 mt-0.5 flex-shrink-0" />
								<div>
									<h4 class="text-sm font-medium text-gray-900">Password Security</h4>
									<p class="text-sm text-gray-700 mt-1">
										Keep your account secure by using a strong password with at least 8 characters.
									</p>
								</div>
							</div>
						</div>

						<form on:submit|preventDefault={handlePasswordChange} class="space-y-6">
							<!-- Current Password -->
							<div>
								<label for="current_password" class="block text-sm font-medium text-gray-700 mb-2">
									Current Password
								</label>
								<div class="relative">
									<Lock class="absolute left-3 top-3 w-4 h-4 text-gray-400" />
									<input
										id="current_password"
										type={showCurrentPassword ? 'text' : 'password'}
										bind:value={currentPassword}
										class="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-800 transition-colors text-sm md:text-base"
										placeholder="Enter your current password"
										required
									/>
									<button
										type="button"
										class="absolute right-3 top-3 p-1 hover:bg-gray-100 rounded transition-colors"
										on:click={() => showCurrentPassword = !showCurrentPassword}
									>
										{#if showCurrentPassword}
											<EyeOff class="w-4 h-4 text-gray-400 hover:text-gray-600" />
										{:else}
											<Eye class="w-4 h-4 text-gray-400 hover:text-gray-600" />
										{/if}
									</button>
								</div>
							</div>

							<!-- New Password -->
							<div>
								<label for="new_password" class="block text-sm font-medium text-gray-700 mb-2">
									New Password
								</label>
								<div class="relative">
									<Lock class="absolute left-3 top-3 w-4 h-4 text-gray-400" />
									<input
										id="new_password"
										type={showNewPassword ? 'text' : 'password'}
										bind:value={newPassword}
										class="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-800 transition-colors text-sm md:text-base"
										placeholder="Enter your new password"
										required
									/>
									<button
										type="button"
										class="absolute right-3 top-3 p-1 hover:bg-gray-100 rounded transition-colors"
										on:click={() => showNewPassword = !showNewPassword}
									>
										{#if showNewPassword}
											<EyeOff class="w-4 h-4 text-gray-400 hover:text-gray-600" />
										{:else}
											<Eye class="w-4 h-4 text-gray-400 hover:text-gray-600" />
										{/if}
									</button>
								</div>
								<div class="mt-2 flex items-center gap-2">
									<div class="flex-1 bg-gray-200 rounded-full h-2">
										<div class="bg-gray-500 h-2 rounded-full transition-all duration-300" style="width: {Math.min((newPassword.length / 8) * 100, 100)}%"></div>
									</div>
									<span class="text-xs text-gray-500">
										{newPassword.length}/8 characters
									</span>
								</div>
								<p class="mt-1 text-sm text-gray-500">Password must be at least 8 characters long</p>
							</div>

							<!-- Confirm New Password -->
							<div>
								<label for="confirm_password" class="block text-sm font-medium text-gray-700 mb-2">
									Confirm New Password
								</label>
								<div class="relative">
									<Lock class="absolute left-3 top-3 w-4 h-4 text-gray-400" />
									<input
										id="confirm_password"
										type={showConfirmPassword ? 'text' : 'password'}
										bind:value={confirmPassword}
										class="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-800 transition-colors text-sm md:text-base"
										placeholder="Confirm your new password"
										required
									/>
									<button
										type="button"
										class="absolute right-3 top-3 p-1 hover:bg-gray-100 rounded transition-colors"
										on:click={() => showConfirmPassword = !showConfirmPassword}
									>
										{#if showConfirmPassword}
											<EyeOff class="w-4 h-4 text-gray-400 hover:text-gray-600" />
										{:else}
											<Eye class="w-4 h-4 text-gray-400 hover:text-gray-600" />
										{/if}
									</button>
								</div>
								{#if confirmPassword && newPassword !== confirmPassword}
									<p class="mt-1 text-sm text-red-600">Passwords do not match</p>
								{:else if confirmPassword && newPassword === confirmPassword}
									<p class="mt-1 text-sm text-emerald-600">Passwords match ✓</p>
								{/if}
							</div>

							<div class="flex flex-col sm:flex-row justify-end pt-6">
								<button
									type="submit"
									disabled={loading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 8}
									class="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-900 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
								>
									{#if loading}
										<LoadingSpinner size="sm" color="neutral" />
									{:else}
										<Save class="w-4 h-4" />
									{/if}
									Update Password
								</button>
							</div>
						</form>
					</div>

					<!-- Two-Factor Authentication Section -->
					<div class="border-t border-gray-200 pt-6 md:pt-8">
						<h3 class="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
						<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
							<div class="flex flex-col sm:flex-row items-start gap-3">
								<Shield class="w-5 h-5 text-gray-800 mt-0.5 flex-shrink-0" />
								<div>
									<h4 class="text-sm font-medium text-gray-900">Enhanced Security</h4>
									<p class="text-sm text-gray-700 mt-1">
										Enable two-factor authentication to add an extra layer of security to your account.
									</p>
								</div>
							</div>
						</div>

						<div class="space-y-4">
							<div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg gap-4">
								<div>
									<h4 class="text-sm font-medium text-gray-900">Email Verification</h4>
									<p class="text-sm text-gray-500">Receive a verification code via email for enhanced security</p>
								</div>
								<label class="relative inline-flex items-center cursor-pointer">
									<input type="checkbox" class="sr-only peer" disabled>
									<div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-500"></div>
								</label>
							</div>

							<p class="text-sm text-gray-500">A 6-digit verification code will be sent to your email each time you log in</p>

							<div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
								<div class="flex flex-col sm:flex-row items-start gap-3">
									<AlertCircle class="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
									<div>
										<h4 class="text-sm font-medium text-amber-900">Need Help Setting Up?</h4>
										<p class="text-sm text-amber-700 mt-1">
											Contact us at <a href="mailto:eligiobautista.dev@gmail.com" class="font-medium underline hover:text-amber-800">eligiobautista.dev@gmail.com</a> or visit <a href="https://eligiobautista.dev" target="_blank" class="font-medium underline hover:text-amber-800">eligiobautista.dev</a> for assistance.
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

		{/if}
	</div>
</div>

