<script lang="ts">
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import type { Order } from '$lib/types/order';
	import type { PageData } from './$types';
	import { authStore, getUserEmail } from '$lib/stores/authStore';	import {
		User,
		Package,
		Calendar,
		FileText,
		CreditCard,
		DollarSign,
		ArrowLeft,
		CheckCircle,
		Plus,
		AlertCircle,
		XCircle
	} from 'lucide-svelte';

	export let data: PageData;

	// Order form state
	let formData = {
		customer_name: '',
		customer_phone: '',
		service_type: '',
		quantity: 1, // Load, start with 1
		unit_price: 0,
		payment_method: 'cash' as const,
		payment_status: 'unpaid' as string,
		status: 'pending' as string,
		pickup_date: '',
		delivery_date: '',
		remarks: ''
	};

	// Add-ons state
	let selectedAddOns: Array<{
		add_on_id: string;
		quantity: number;
		unit_price: number;
		name: string;
	}> = [];

	// Available services and add-ons from backend
	$: serviceTypes = data.servicePricing || [];
	$: availableAddOns = data.addOns || [];

	const paymentMethods = [
		{ value: 'cash', label: 'Cash' },
		{ value: 'gcash', label: 'GCash' },
		{ value: 'paymaya', label: 'PayMaya' },
		{ value: 'bank_transfer', label: 'Bank Transfer' }
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

	// Form submission state
	let isSubmitting = false;
	
	// Get current user email from auth store
	$: userEmail = getUserEmail($authStore);

	// Handle form submission with validation
	function handleSubmit(event: Event) {
		const errors = validateForm();
		if (errors.length > 0) {
			event.preventDefault();
			toast.error('Please fix the following errors:\n' + errors.join('\n'));
			return false;
		}
		isSubmitting = true;
		return true;
	}

	// Computed amounts
	$: subtotalAmount = formData.quantity * formData.unit_price;
	$: addOnsAmount = selectedAddOns.reduce((sum, addOn) => sum + (addOn.quantity * addOn.unit_price), 0);
	$: totalAmount = subtotalAmount + addOnsAmount;
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

	// Add-on functions
	function addAddOn(addOn: any) {
		const existingIndex = selectedAddOns.findIndex(item => item.add_on_id === addOn.id);
		if (existingIndex >= 0) {
			// Update quantity if already exists
			selectedAddOns[existingIndex].quantity += 1;
			selectedAddOns = [...selectedAddOns];
		} else {
			// Add new add-on
			selectedAddOns = [...selectedAddOns, {
				add_on_id: addOn.id,
				quantity: 1,
				unit_price: addOn.price,
				name: addOn.name
			}];
		}
	}

	function removeAddOn(addOnId: string) {
		selectedAddOns = selectedAddOns.filter(item => item.add_on_id !== addOnId);
	}

	function updateAddOnQuantity(addOnId: string, quantity: number) {
		if (quantity <= 0) {
			removeAddOn(addOnId);
			return;
		}
		
		const index = selectedAddOns.findIndex(item => item.add_on_id === addOnId);
		if (index >= 0) {
			selectedAddOns[index].quantity = quantity;
			selectedAddOns = [...selectedAddOns];
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
			errors.push('Load must be greater than 0 kg');
		}
		if (formData.unit_price <= 0) {
			errors.push('Unit price must be greater than 0');
		}

		if (!formData.pickup_date) {
			errors.push('Expected pickup date is required');
		}

		// Payment validation: Prevent marking as completed if payment is unpaid
		if (formData.status === 'completed' && formData.payment_status === 'unpaid') {
			errors.push('Cannot mark order as completed when payment status is unpaid. Please update payment status first.');
		}

		return errors;
	}

	import { enhance } from '$app/forms';
	
	// form action result from server
	export let form: { error?: string; success?: boolean } = {};

	// handle form submission response
	$: if (form?.success) {
		toast.success('Order created successfully!');
		goto('/orders');
	}

	$: if (form?.error) {
		toast.error(form.error);
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
					<Plus class="w-8 h-8 text-gray-600" />
					<h1 class="text-2xl font-bold text-brand-900">Create New Order</h1>
				</div>
				<p class="text-sm text-gray-500">Add a new laundry order to the system</p>
			</div>
		</div>
	</div>	<!-- Form -->
	<form 
		method="POST" 
		action="?/create" 
		on:submit={handleSubmit}
	>
		<!-- Hidden input for user email -->
		<input type="hidden" name="user_email" value={userEmail || ''} />


		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<!-- Left Column: Form Fields -->
			<div class="space-y-6 lg:col-span-2">
				<!-- Order Status -->
				<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-brand-900">
						<CheckCircle class="h-5 w-5 text-gray-600" />
						Order Status
					</h2>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<label for="status" class="block text-sm font-medium text-gray-500 mb-2">
								Order Status *
							</label>
							<select
								id="status"
								name="status"
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
								name="payment_status"
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

					<!-- Payment Warning -->
					{#if formData.status === 'completed' && formData.payment_status === 'unpaid'}
						<div class="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-3">
							<div class="flex items-start gap-2">
								<AlertCircle class="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
								<div class="text-sm">
									<p class="font-medium text-orange-800">Payment Required</p>
									<p class="text-orange-700">This order cannot be marked as completed until payment is received. Please update the payment status first.</p>
								</div>
							</div>
						</div>
					{/if}
				</div>

				<!-- Customer Information -->
				<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-brand-900">
						<User class="h-5 w-5 text-gray-600" />
						Customer Information
					</h2>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						<div>
							<label for="customer_name" class="block text-sm font-medium text-gray-500 mb-2">
								Customer Name *
							</label>
							<input
								type="text"
								id="customer_name"
								name="customer_name"
								bind:value={formData.customer_name}
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
								placeholder="Enter customer name"
							/>
						</div>
						<div>
							<label for="customer_phone" class="block text-sm font-medium text-gray-500 mb-2">
								Phone Number *
							</label>
							<input
								type="tel"
								id="customer_phone"
								name="customer_phone"
								bind:value={formData.customer_phone}
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
								placeholder="Enter phone number"
							/>
						</div>

					</div>
				</div>

				<!-- Service Details -->
				<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-brand-900">
						<Package class="h-5 w-5 text-gray-600" />
						Service Details
					</h2>
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
						<div>
							<label for="service_type" class="block text-sm font-medium text-gray-500 mb-2">
								Service Type *
							</label>
							<select
								id="service_type"
								name="service_type"
								bind:value={formData.service_type}
								on:change={handleServiceTypeChange}
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
							>
								<option value="">Select service type</option>
								{#each serviceTypes.filter((s) => s.is_active) as service}
									<option value={service.service_name}
										>{service.service_name} - ₱{service.price}/load</option
									>
								{/each}
							</select>
						</div>
						<div>
							<label for="quantity" class="block text-sm font-medium text-gray-500 mb-2">
								Load *
							</label>
							<input
								type="number"
								id="quantity"
								name="quantity"
								bind:value={formData.quantity}
								min="0.1"
								step="0.1"
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
								placeholder="Enter load"
							/>
							<p class="text-xs text-gray-500 mt-1">Load of laundry in kilograms</p>
						</div>
						<div>
							<label for="unit_price" class="block text-sm font-medium text-gray-500 mb-2">
								Price per load *
							</label>
							<div
								id="unit_price"
								class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
							>
								₱{formData.unit_price.toFixed(2)}
							</div>
							<input
								type="hidden"
								name="unit_price"
								value={formData.unit_price}
							/>
							<p class="text-xs text-gray-500 mt-1">Price per load (automatically set based on service type)</p>
						</div>
					</div>
				</div>

				<!-- Add-ons Section -->
				<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-brand-900">
						<Plus class="h-5 w-5 text-gray-600" />
						Add-ons & Extras
					</h2>
					
					<!-- Simple Add-ons Selection -->
					<div class="space-y-3">
						{#each availableAddOns as addOn}
							<div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
								<div class="flex items-center gap-3">
									<input
										type="checkbox"
										id={`addon-${addOn.id}`}
										checked={selectedAddOns.some(item => item.add_on_id === addOn.id)}
										on:change={(e) => {
											const target = e.target as HTMLInputElement;
											if (target.checked) {
												addAddOn(addOn);
											} else {
												removeAddOn(addOn.id);
											}
										}}
										class="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
									/>
									<label for={`addon-${addOn.id}`} class="font-medium text-gray-900 cursor-pointer">
										{addOn.name} - ₱{addOn.price}
									</label>
								</div>
								
								{#if selectedAddOns.some(item => item.add_on_id === addOn.id)}
									<div class="flex items-center gap-2">
										<label for={`qty-${addOn.id}`} class="text-sm text-gray-600">Qty:</label>
										<input
											id={`qty-${addOn.id}`}
											type="number"
											min="1"
											value={selectedAddOns.find(item => item.add_on_id === addOn.id)?.quantity || 1}
											on:change={(e) => {
												const target = e.target as HTMLInputElement;
												const quantity = parseInt(target.value) || 1;
												updateAddOnQuantity(addOn.id, quantity);
											}}
											class="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-brand-500 focus:border-transparent"
										/>
										<span class="text-sm font-semibold text-gray-900">
											₱{((selectedAddOns.find(item => item.add_on_id === addOn.id)?.quantity || 1) * addOn.price).toFixed(2)}
										</span>
									</div>
								{/if}
							</div>
						{/each}
					</div>

					<!-- Hidden inputs for form submission -->
					{#each selectedAddOns as addOn}
						<input type="hidden" name="add_on_id" value={addOn.add_on_id} />
						<input type="hidden" name="add_on_quantity" value={addOn.quantity} />
						<input type="hidden" name="add_on_price" value={addOn.unit_price} />
					{/each}
				</div>

				<!-- Schedule Information -->
				<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-brand-900">
						<Calendar class="h-5 w-5 text-gray-600" />
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
								name="pickup_date"
								bind:value={formData.pickup_date}
								min={new Date().toISOString().slice(0, 16)}
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
								name="delivery_date"
								bind:value={formData.delivery_date}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
							/>
							<p class="text-xs text-gray-500 mt-1">Optional delivery date</p>
						</div>
					</div>
				</div>

				<!-- Additional Information -->
				<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-brand-900">
						<FileText class="h-5 w-5 text-gray-600" />
						Additional Information
					</h2>
					<div>
						<label for="remarks" class="block text-sm font-medium text-gray-500 mb-2">
							Remarks
						</label>
						<textarea
							id="remarks"
							name="remarks"
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
					<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-brand-900">
						<DollarSign class="h-5 w-5 text-gray-600" />
						Order Summary
					</h2>
					<div class="space-y-4">
						<div>
							<span class="block text-sm font-medium text-gray-500">Service Type</span>
							<p class="text-base font-medium text-brand-900">
								{formData.service_type || 'Not selected'}
							</p>
						</div>
						<div>
							<span class="block text-sm font-medium text-gray-500">Load</span>
							<p class="text-base font-medium text-brand-900">{formData.quantity} kg</p>
						</div>
						<div>
							<span class="block text-sm font-medium text-gray-500">Unit Price</span>
							<p class="text-base font-medium text-brand-900">₱{formData.unit_price.toFixed(2)} per load</p>
						</div>
						<!-- Cost Breakdown -->
						<div class="border-t border-gray-200 pt-4">
							<div class="space-y-2">
								<div class="flex justify-between text-sm">
									<span class="text-gray-600">Subtotal:</span>
									<span class="font-medium">₱{subtotalAmount.toFixed(2)}</span>
								</div>
								{#if addOnsAmount > 0}
									<div class="flex justify-between text-sm">
										<span class="text-gray-600">Add-ons:</span>
										<span class="font-medium">₱{addOnsAmount.toFixed(2)}</span>
									</div>
								{/if}
								<div class="border-t border-gray-200 pt-2">
									<div class="flex justify-between">
										<span class="text-base font-semibold text-gray-900">Total Amount</span>
										<span class="text-2xl font-bold text-brand-900">₱{totalAmount.toFixed(2)}</span>
									</div>
									{#if formData.quantity > 0 && formData.unit_price > 0}
										<div class="text-xs text-gray-500 mt-1">
											{formData.quantity} kg × ₱{formData.unit_price}/load
											{#if addOnsAmount > 0}
												+ ₱{addOnsAmount.toFixed(2)} add-ons
											{/if}
										</div>
									{/if}
								</div>
							</div>
						</div>
					</div>
				</div>				<!-- Payment Information -->
				<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-brand-900">
						<CreditCard class="h-5 w-5 text-gray-600" />
						Payment Information
					</h2>
					<div>
						<label for="payment_method" class="block text-sm font-medium text-gray-500 mb-2">
							Payment Method *
						</label>
						<select
							id="payment_method"
							name="payment_method"
							bind:value={formData.payment_method}
							required
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
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
							class="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							class="px-6 py-2 text-white bg-gray-600 border border-transparent rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isSubmitting ? 'Creating Order...' : 'Create Order'}
						</button>
					</div>
				</div>
			</div>
		</div>
	</form>
</div>
