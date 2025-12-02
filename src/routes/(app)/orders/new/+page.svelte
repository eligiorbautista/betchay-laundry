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
		XCircle,
		Scale
	} from 'lucide-svelte';

	export let data: PageData;

	// Order form state
	let formData = {
		customer_name: '',
		customer_phone: '',
		service_type: '',
		unit_price: 0,
		payment_method: 'cash' as const,
		payment_status: 'unpaid' as string,
		status: 'pending' as string,
		pickup_date: '',
		delivery_date: '',
		remarks: ''
	};

	type LoadEntry = { id: string; weight: number };
	const MAX_LOADS = 8.3;
	const MAX_KG_PER_LOAD = 8;

	function generateLoadId() {
		if (typeof crypto !== 'undefined' && crypto.randomUUID) {
			return crypto.randomUUID();
		}
		return Math.random().toString(36).slice(2);
	}

	function createLoadEntry(weight = 8): LoadEntry {
		return {
			id: generateLoadId(),
			weight
		};
	}

	let loadEntries: LoadEntry[] = [createLoadEntry(8)];
let totalWeightKg = 0;
let loadCount = 0;

	// Add-ons state
	let selectedAddOns: Array<{
		add_on_id: string;
		quantity: number;
		unit_price: number;
		name: string;
	}> = [];

	function addLoadEntry() {
		if (loadEntries.length >= 20 || loadCount >= MAX_LOADS) {
			return;
		}
		loadEntries = [...loadEntries, createLoadEntry(8)];
	}

	function removeLoadEntry(id: string) {
		if (loadEntries.length === 1) {
			return;
		}
		loadEntries = loadEntries.filter(entry => entry.id !== id);
	}

	function updateLoadEntryWeight(id: string, weight: number) {
		loadEntries = loadEntries.map(entry => entry.id === id ? { ...entry, weight } : entry);
	}

	// Available services and add-ons from backend
	$: serviceTypes = data.servicePricing || [];
	$: availableAddOns = data.addOns || [];

	const paymentMethods = [
		{ value: 'cash', label: 'Cash' },
		{ value: 'gcash', label: 'GCash' },
		{ value: 'others', label: 'Others' }
	];

	const paymentStatuses = [
		{ value: 'paid', label: 'Paid' },
		{ value: 'unpaid', label: 'Unpaid' }
	];

	const orderStatuses = [
		{ value: 'pending', label: 'Pending' },
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

	// Ensure unit_price is always a valid number
	$: unitPrice = Number.isFinite(formData.unit_price) && formData.unit_price >= 0 ? formData.unit_price : 0;
	
	// Computed amounts
	$: totalWeightKg = parseFloat(loadEntries.reduce((sum, entry) => sum + (Number.isFinite(entry.weight) ? entry.weight : 0), 0).toFixed(2));
	// Each load entry counts as 1 load (rounded up), regardless of weight
	$: loadCount = loadEntries.length || 0;
	$: subtotalAmount = loadCount * unitPrice;
	$: addOnsAmount = selectedAddOns.reduce((sum, addOn) => sum + (addOn.quantity * addOn.unit_price), 0);
	$: totalAmount = subtotalAmount + addOnsAmount;
	function handleServiceTypeChange() {
		const selectedService = serviceTypes.find((s) => s.service_name === formData.service_type);
		if (selectedService) {
			// Only auto-set price if it's not "Dry Clean" (clients set the price for Dry Clean)
			if (formData.service_type !== 'Dry Clean') {
				formData.unit_price = selectedService.price;
			} else {
				// For Dry Clean, set initial price but allow user to change it
				formData.unit_price = selectedService.price;
			}
		}
	}
	
	// Check if current service type is Dry Clean (allows price editing)
	$: isDryClean = formData.service_type === 'Dry Clean';

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
		if (loadEntries.length === 0) {
			errors.push('Please add at least one load entry');
		}
		loadEntries.forEach((entry, index) => {
			if (!Number.isFinite(entry.weight) || entry.weight <= 0) {
				errors.push(`Load #${index + 1} must be greater than 0 kg`);
			}
			if (entry.weight > MAX_KG_PER_LOAD) {
				errors.push(`Load #${index + 1} cannot exceed ${MAX_KG_PER_LOAD} kg`);
			}
		});
		if (loadCount <= 0) {
			errors.push('Total loads must be greater than 0');
		}
		if (loadCount > MAX_LOADS) {
			errors.push(`Total loads cannot exceed ${MAX_LOADS}`);
		}
		if (formData.unit_price <= 0) {
			errors.push('Unit price must be greater than 0');
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
		// Redirect to orders page
		goto('/orders');
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
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
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
							<label for="unit_price" class="block text-sm font-medium text-gray-500 mb-2">
								Price per load *
							</label>
							{#if isDryClean}
								<input
									type="number"
									id="unit_price"
									name="unit_price"
									bind:value={formData.unit_price}
									min="0"
									step="0.01"
									required
									on:input={(e) => {
										const input = e.currentTarget as HTMLInputElement;
										const value = input.value === '' ? 0 : parseFloat(input.value);
										formData.unit_price = Number.isFinite(value) && value >= 0 ? value : 0;
									}}
									class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
									placeholder="Enter price per load"
								/>
								<p class="text-xs text-gray-500 mt-1">Enter the price as specified by the client</p>
							{:else}
								<div class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
									₱{formData.unit_price.toFixed(2)}
								</div>
								<input type="hidden" name="unit_price" value={formData.unit_price} />
								<p class="text-xs text-gray-500 mt-1">Automatically set based on the service selected</p>
							{/if}
						</div>
					</div>
				</div>

				<!-- Load Breakdown -->
				<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<div class="flex items-center justify-between mb-4">
						<div>
							<h2 class="flex items-center gap-2 text-lg font-semibold text-brand-900">
								<Scale class="h-5 w-5 text-gray-600" />
								Load Breakdown
							</h2>
							<p class="text-sm text-gray-500">Maximum {MAX_KG_PER_LOAD} kg per load, up to {MAX_LOADS} loads per order.</p>
						</div>
						<button
							type="button"
							on:click={addLoadEntry}
							class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
							disabled={loadEntries.length >= 20 || loadCount >= MAX_LOADS}
						>
							<Plus class="h-4 w-4" />
							Add Load
						</button>
					</div>

					<div class="space-y-4">
						{#each loadEntries as load, index}
							<div class="rounded-lg border border-gray-200 p-4">
								<div class="flex items-center justify-between">
									<div class="text-sm font-medium text-gray-700">Load {index + 1}</div>
									{#if loadEntries.length > 1}
										<button
											type="button"
											on:click={() => removeLoadEntry(load.id)}
											class="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
										>
											<XCircle class="h-4 w-4" />
											Remove
										</button>
									{/if}
								</div>
								<div class="mt-3">
									<label class="block text-sm font-medium text-gray-500 mb-1">
										Weight (kg)
									</label>
									<input
										type="number"
										name="load_weight"
										min="0.1"
										max={MAX_KG_PER_LOAD}
										step="0.1"
										value={load.weight}
										on:input={(event) => updateLoadEntryWeight(load.id, parseFloat((event.currentTarget as HTMLInputElement).value) || 0)}
										required
										class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
									/>
									<input type="hidden" name="load_id" value={load.id} />
									<p class="text-xs text-gray-500 mt-1">Maximum {MAX_KG_PER_LOAD} kg per load</p>
								</div>
							</div>
						{/each}
						<div class="rounded-lg bg-gray-50 border border-dashed border-gray-200 p-3 text-sm text-gray-600">
							<div class="flex flex-wrap gap-4">
								<span><strong>Total loads:</strong> {loadCount}</span>
								<span><strong>Total weight:</strong> {totalWeightKg.toFixed(2)} kg</span>
							</div>
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
								Expected Pickup Date & Time <span class="text-gray-400">(optional)</span>
							</label>
							<input
								type="datetime-local"
								id="pickup_date"
								name="pickup_date"
								bind:value={formData.pickup_date}
								min={new Date().toISOString().slice(0, 16)}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
							/>
							<p class="text-xs text-gray-500 mt-1">When customer plans to pick up (if known)</p>
						</div>

						<div>
							<label for="delivery_date" class="block text-sm font-medium text-gray-500 mb-2">
								Delivery Date & Time <span class="text-gray-400">(optional)</span>
							</label>
							<input
								type="datetime-local"
								id="delivery_date"
								name="delivery_date"
								bind:value={formData.delivery_date}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
							/>
							<p class="text-xs text-gray-500 mt-1">When order will be delivered (if known)</p>
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
							<span class="block text-sm font-medium text-gray-500">Total Loads</span>
							<p class="text-base font-medium text-brand-900">{loadCount}</p>
						</div>
						<div>
							<span class="block text-sm font-medium text-gray-500">Unit Price</span>
							<p class="text-base font-medium text-brand-900">₱{unitPrice.toFixed(2)} per load</p>
						</div>
						<div>
							<span class="block text-sm font-medium text-gray-500">Total Weight</span>
							<p class="text-base font-medium text-brand-900">
								{totalWeightKg ? totalWeightKg.toFixed(2) : '0.00'} kg
							</p>
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
									{#if loadCount > 0 && unitPrice > 0}
										<div class="text-xs text-gray-500 mt-1">
											{loadCount} {loadCount === 1 ? 'load' : 'loads'} × ₱{unitPrice}/load
											{#if totalWeightKg > 0}
												(≈ {totalWeightKg.toFixed(2)} kg)
											{/if}
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
							class="px-6 py-2 text-white bg-brand-900 border border-brand-900 rounded-lg hover:bg-brand-800 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
						>
							{isSubmitting ? 'Creating Order...' : 'Create Order'}
						</button>
					</div>
				</div>
			</div>
		</div>
	</form>
</div>
