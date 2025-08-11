<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Order } from '$lib/types/order';
	import type { PageData } from './$types';	import {
		User,
		Package,
		Calendar,
		FileText,
		CreditCard,
		DollarSign,
		ArrowLeft,
		CheckCircle,
		Plus
	} from 'lucide-svelte';

	export let data: PageData;	// Form data
	let formData = {
		customer_name: '',
		customer_phone: '',
		service_type: '',
		quantity: 0.5, // Weight in kg, start with 0.5kg minimum
		unit_price: 0,
		payment_method: 'cash' as const,
		payment_status: 'unpaid' as const,
		status: 'pending' as const,
		pickup_date: '',
		delivery_date: '',
		remarks: ''
	};

	// Get service types from server data
	$: serviceTypes = data.servicePricing || [];	const paymentMethods = [
		{ value: 'cash', label: 'Cash' },
		{ value: 'gcash', label: 'GCash' },
		{ value: 'paymaya', label: 'PayMaya' },
		{ value: 'bank_transfer', label: 'Bank Transfer' },
		{ value: 'credit_card', label: 'Credit Card' }
	];

	const paymentStatuses = [
		{ value: 'paid', label: 'Paid' },
		{ value: 'unpaid', label: 'Unpaid' },
		{ value: 'partial', label: 'Partial' }
	];

	const orderStatuses = [
		{ value: 'pending', label: 'Pending' },
		{ value: 'processing', label: 'Processing' },
		{ value: 'ready', label: 'Ready' },
		{ value: 'completed', label: 'Completed' },
		{ value: 'cancelled', label: 'Cancelled' }
	];

	// Loading state
	let isSubmitting = false;

	// Computed total amount
	$: totalAmount = formData.quantity * formData.unit_price; // Update unit price when service type changes
	function handleServiceTypeChange() {
		const selectedService = serviceTypes.find((s) => s.service_name === formData.service_type);
		if (selectedService) {
			formData.unit_price = selectedService.price;
		}
	}

	// Generate order number
	function generateOrderNumber(): string {
		const now = new Date();
		const year = now.getFullYear().toString().slice(-2);
		const month = (now.getMonth() + 1).toString().padStart(2, '0');
		const day = now.getDate().toString().padStart(2, '0');
		const random = Math.floor(Math.random() * 1000)
			.toString()
			.padStart(3, '0');
		return `ORD${year}${month}${day}${random}`;
	}

	// Form validation
	function validateForm(): string[] {
		const errors: string[] = [];

		if (!formData.customer_name.trim()) {
			errors.push('Customer name is required');
		}

		if (!formData.service_type) {
			errors.push('Service type is required');
		}
		if (formData.quantity <= 0) {
			errors.push('Weight must be greater than 0 kg');
		}
		if (formData.unit_price <= 0) {
			errors.push('Unit price must be greater than 0');
		}

		if (!formData.pickup_date) {
			errors.push('Expected pickup date is required');
		}

		return errors;
	}

	// Submit form
	async function handleSubmit() {
		const errors = validateForm();
		if (errors.length > 0) {
			alert('Please fix the following errors:\n' + errors.join('\n'));
			return;
		}

		isSubmitting = true;

		try {			// Create the order object
			const newOrder: Partial<Order> = {
				id: crypto.randomUUID(),
				customer_name: formData.customer_name.trim(),
				customer_phone: formData.customer_phone.trim() || undefined,
				order_number: generateOrderNumber(),
				status: formData.status,
				service_type: formData.service_type,
				quantity: formData.quantity,
				unit_price: formData.unit_price,
				total_amount: totalAmount,
				payment_status: formData.payment_status,
				payment_method: formData.payment_method,
				pickup_date: formData.pickup_date,
				delivery_date: formData.delivery_date || undefined,
				remarks: formData.remarks.trim() || undefined,
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString()
			};

			// TODO: Save to database/API
			console.log('New Order:', newOrder);

			// For now, just show success and redirect
			alert('Order created successfully!');
			goto('/orders');
		} catch (error) {
			console.error('Error creating order:', error);
			alert('Failed to create order. Please try again.');		} finally {
			isSubmitting = false;
		}
	}

	// Navigation
	function goBack() {
		// Use browser history to go back to previous page
		if (window.history.length > 1) {
			window.history.back();
		} else {
			// Fallback to orders page if no history
			goto('/orders');
		}
	}
</script>

<svelte:head>
	<title>New Order - Laundry Management</title>
</svelte:head>

<div class="min-h-screen w-full bg-gray-50 p-4 lg:p-6">
	<!-- Header -->
	<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">		<div class="flex items-center gap-3">
			<button
				on:click={goBack}
				type="button"
				class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white transition-colors hover:bg-gray-50"
			>
				<ArrowLeft class="h-5 w-5 text-gray-600" />
			</button>			<div>
				<div class="flex items-center gap-3 mb-2">
					<Plus class="w-8 h-8 text-blue-600" />
					<h1 class="text-2xl font-bold text-gray-900">Create New Order</h1>
				</div>
				<p class="text-sm text-gray-500">Add a new laundry order to the system</p>
			</div>
		</div>
	</div>	<!-- Form -->
	<form on:submit|preventDefault={handleSubmit}>		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<!-- Left Column: Form Fields -->
			<div class="space-y-6 lg:col-span-2">
				<!-- Order Status -->
				<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
						<CheckCircle class="h-5 w-5 text-blue-600" />
						Order Status
					</h2>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<label for="status" class="block text-sm font-medium text-gray-500 mb-2">
								Order Status *
							</label>
							<select
								id="status"
								bind:value={formData.status}
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							>
								{#each orderStatuses as status}
									<option value={status.value}>{status.label}</option>
								{/each}
							</select>
						</div>
						<div>
							<label for="payment_status" class="block text-sm font-medium text-gray-500 mb-2">
								Payment Status *
							</label>
							<select
								id="payment_status"
								bind:value={formData.payment_status}
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							>
								{#each paymentStatuses as status}
									<option value={status.value}>{status.label}</option>
								{/each}
							</select>
						</div>
					</div>
				</div>

				<!-- Customer Information -->
				<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
						<User class="h-5 w-5 text-blue-600" />
						Customer Information
					</h2>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<label for="customer_name" class="block text-sm font-medium text-gray-500 mb-2">
								Customer Name *
							</label>
							<input
								type="text"
								id="customer_name"
								bind:value={formData.customer_name}
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="Enter customer name"
							/>
						</div>
						<div>
							<label for="customer_phone" class="block text-sm font-medium text-gray-500 mb-2">
								Phone Number
							</label>
							<input
								type="tel"
								id="customer_phone"
								bind:value={formData.customer_phone}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="Enter phone number"
							/>
						</div>
					</div>
				</div>

				<!-- Service Details -->
				<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
						<Package class="h-5 w-5 text-blue-600" />
						Service Details
					</h2>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						<div>
							<label for="service_type" class="block text-sm font-medium text-gray-500 mb-2">
								Service Type *
							</label>
							<select
								id="service_type"
								bind:value={formData.service_type}
								on:change={handleServiceTypeChange}
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							>
								<option value="">Select service type</option>
								{#each serviceTypes.filter((s) => s.is_active) as service}
									<option value={service.service_name}
										>{service.service_name} - ₱{service.price}/kg</option
									>
								{/each}
							</select>
						</div>
						<div>
							<label for="quantity" class="block text-sm font-medium text-gray-500 mb-2">
								Weight (kg) *
							</label>
							<input
								type="number"
								id="quantity"
								bind:value={formData.quantity}
								min="0.1"
								step="0.1"
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="Enter weight in kg"
							/>
							<p class="text-xs text-gray-500 mt-1">Weight of laundry in kilograms</p>
						</div>
						<div>
							<label for="unit_price" class="block text-sm font-medium text-gray-500 mb-2">
								Price per kg *
							</label>
							<input
								type="number"
								id="unit_price"
								bind:value={formData.unit_price}
								min="0"
								step="0.01"
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="Enter price per kg"
							/>
							<p class="text-xs text-gray-500 mt-1">Price per kilogram</p>
						</div>
					</div>
				</div>

				<!-- Schedule Information -->
				<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
						<Calendar class="h-5 w-5 text-blue-600" />
						Schedule Information
					</h2>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<label for="pickup_date" class="block text-sm font-medium text-gray-500 mb-2">
								Expected Pickup Date & Time *
							</label>
							<input
								type="datetime-local"
								id="pickup_date"
								bind:value={formData.pickup_date}
								min={new Date().toISOString().slice(0, 16)}
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
							<p class="text-xs text-gray-500 mt-1">When customer plans to pick up</p>
						</div>

						<div>
							<label for="delivery_date" class="block text-sm font-medium text-gray-500 mb-2">
								Delivery Date & Time
							</label>
							<input
								type="datetime-local"
								id="delivery_date"
								bind:value={formData.delivery_date}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
							<p class="text-xs text-gray-500 mt-1">Optional delivery date</p>
						</div>
					</div>
				</div>

				<!-- Additional Information -->
				<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
						<FileText class="h-5 w-5 text-blue-600" />
						Additional Information
					</h2>
					<div>
						<label for="remarks" class="block text-sm font-medium text-gray-500 mb-2">
							Remarks
						</label>
						<textarea
							id="remarks"
							bind:value={formData.remarks}
							rows="4"
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							placeholder="Enter any special instructions or remarks..."
						></textarea>
					</div>
				</div>
			</div>

			<!-- Right Column: Summary & Payment -->
			<div class="space-y-6">
				<!-- Order Summary -->
				<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
						<DollarSign class="h-5 w-5 text-blue-600" />
						Order Summary
					</h2>
					<div class="space-y-4">
						<div>
							<span class="block text-sm font-medium text-gray-500">Service Type</span>
							<p class="text-base font-medium text-gray-900">
								{formData.service_type || 'Not selected'}
							</p>
						</div>
						<div>
							<span class="block text-sm font-medium text-gray-500">Weight</span>
							<p class="text-base font-medium text-gray-900">{formData.quantity} kg</p>
						</div>
						<div>
							<span class="block text-sm font-medium text-gray-500">Unit Price</span>
							<p class="text-base font-medium text-gray-900">₱{formData.unit_price.toFixed(2)} per kg</p>
						</div>
						<div class="border-t border-gray-200 pt-4">
							<div class="bg-gray-50 rounded-lg p-4">
								<div class="text-sm text-gray-600">Total Amount</div>
								<div class="text-2xl font-bold text-gray-900">₱{totalAmount.toFixed(2)}</div>
								{#if formData.quantity > 0 && formData.unit_price > 0}
									<div class="text-xs text-gray-500 mt-1">
										{formData.quantity} kg × ₱{formData.unit_price}/kg
									</div>
								{/if}
							</div>
						</div>
					</div>
				</div>				<!-- Payment Information -->
				<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
						<CreditCard class="h-5 w-5 text-blue-600" />
						Payment Information
					</h2>
					<div>
						<label for="payment_method" class="block text-sm font-medium text-gray-500 mb-2">
							Payment Method *
						</label>
						<select
							id="payment_method"
							bind:value={formData.payment_method}
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						>
							{#each paymentMethods as method}
								<option value={method.value}>{method.label}</option>
							{/each}
						</select>
					</div>
				</div>

				<!-- Form Actions -->
				<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<div class="flex flex-col gap-3">						<button
							type="button"
							on:click={goBack}
							class="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							class="px-6 py-2 text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isSubmitting ? 'Creating Order...' : 'Create Order'}
						</button>
					</div>
				</div>
			</div>
		</div>
	</form>
</div>
