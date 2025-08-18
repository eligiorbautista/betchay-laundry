<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
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
		Edit2
	} from 'lucide-svelte';

	export let data: PageData;

	const orderId = $page.params.orderId;

	// Pre-populate form with current order values
	let formData = {
		customer_name: data.order.customer_name,
		customer_phone: data.order.customer_phone || '',
		service_type: data.order.service_type,
		quantity: data.order.quantity,
		unit_price: data.order.unit_price,
		payment_method: data.order.payment_method,
		payment_status: data.order.payment_status,
		status: data.order.status,
		pickup_date: data.order.pickup_date ? new Date(data.order.pickup_date).toISOString().slice(0, 16) : '',
		delivery_date: data.order.delivery_date ? new Date(data.order.delivery_date).toISOString().slice(0, 16) : '',
		remarks: data.order.remarks || ''
	};

	// Available services from backend
	$: serviceTypes = data.servicePricing || [];

	const paymentMethods = [
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
	$: totalAmount = formData.quantity * formData.unit_price;

	// Update unit price when service type changes
	function handleServiceTypeChange() {
		const selectedService = serviceTypes.find(s => s.service_name === formData.service_type);
		if (selectedService) {
			formData.unit_price = selectedService.price;
		}
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
		
		try {
			// Create the updated order object
			const updatedOrder: Partial<Order> = {
				id: data.order.id,
				customer_name: formData.customer_name.trim(),
				customer_phone: formData.customer_phone.trim() || undefined,
				order_number: data.order.order_number,
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
				created_at: data.order.created_at,
				updated_at: new Date().toISOString()
			};

			// NOTE: Database integration pending
			console.log('Updated Order:', updatedOrder);
			
			// Show success feedback and navigate
			alert('Order updated successfully!');
			goto(`/orders/${orderId}`);
			
		} catch (error) {
			console.error('Error updating order:', error);
			alert('Failed to update order. Please try again.');		} finally {
			isSubmitting = false;
		}
	}

	// Navigation
	function goBack() {
		// Use browser history to go back to previous page
		if (window.history.length > 1) {
			window.history.back();
		} else {
			// Fallback to order view page if no history
			goto(`/orders/${orderId}`);
		}
	}
</script>

<svelte:head>
	<title>Edit Order {data.order.order_number} - Laundry Management</title>
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
					<Edit2 class="w-8 h-8 text-gray-800" />
					<h1 class="text-2xl font-bold text-gray-900">Edit Order {data.order.order_number}</h1>
				</div>
				<p class="text-sm text-gray-500">Update order details and status</p>
			</div>
		</div>
	</div>	<!-- Form -->
	<form on:submit|preventDefault={handleSubmit}>
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<!-- Left Column: Form Fields -->
			<div class="space-y-6 lg:col-span-2">
				<!-- Order Status -->
				<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
						<CheckCircle class="h-5 w-5 text-gray-800" />
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
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
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
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
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
						<User class="h-5 w-5 text-gray-800" />
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
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
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
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
								placeholder="Enter phone number"
							/>
						</div>
					</div>
				</div>

				<!-- Service Details -->
				<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
						<Package class="h-5 w-5 text-gray-800" />
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
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
							>
								<option value="">Select service type</option>
								{#each serviceTypes.filter(s => s.is_active) as service}
									<option value={service.service_name}>{service.service_name} - ₱{service.price}/kg</option>
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
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
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
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
								placeholder="Enter price per kg"
							/>
							<p class="text-xs text-gray-500 mt-1">Price per kilogram</p>
						</div>
					</div>
				</div>

				<!-- Schedule Information -->
				<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
						<Calendar class="h-5 w-5 text-gray-800" />
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
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
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
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
							/>
							<p class="text-xs text-gray-500 mt-1">Optional delivery date</p>
						</div>
					</div>
				</div>

				<!-- Additional Information -->
				<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
						<FileText class="h-5 w-5 text-gray-800" />
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
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
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
						<DollarSign class="h-5 w-5 text-gray-800" />
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
				</div>

				<!-- Payment Information -->
				<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
						<CreditCard class="h-5 w-5 text-gray-800" />
						Payment Information
					</h2>
					<div class="space-y-4">
						<div>
							<label for="payment_method" class="block text-sm font-medium text-gray-500 mb-2">
								Payment Method *
							</label>
							<select
								id="payment_method"
								bind:value={formData.payment_method}
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
							>
								{#each paymentMethods as method}
									<option value={method.value}>{method.label}</option>
								{/each}
							</select>
						</div>
						<div class="rounded-lg border border-gray-200 bg-gray-50 p-3">
							<div class="text-sm text-gray-800">
								Current payment status: <strong class="capitalize">{formData.payment_status}</strong>
							</div>
						</div>
					</div>
				</div>

				<!-- Form Actions -->
				<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<div class="flex flex-col gap-3">						<button
							type="button"
							on:click={goBack}
							class="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							class="px-6 py-2 text-white bg-gray-800 border border-transparent rounded-lg hover:bg-gray-900 focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>							{isSubmitting ? 'Updating Order...' : 'Update Order'}
						</button>
					</div>
				</div>
			</div>
		</div>
	</form>
</div>
