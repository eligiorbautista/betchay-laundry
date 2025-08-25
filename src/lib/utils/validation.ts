/**
 * Input validation and sanitization utilities
 */

/**
 * Sanitize and validate customer name
 */
export function validateCustomerName(name: string): { isValid: boolean; error?: string; sanitized?: string } {
	if (!name || typeof name !== 'string') {
		return { isValid: false, error: 'Customer name is required' };
	}

	const sanitized = name.trim();
	
	if (sanitized.length === 0) {
		return { isValid: false, error: 'Customer name cannot be empty' };
	}
	
	if (sanitized.length > 100) {
		return { isValid: false, error: 'Customer name too long (max 100 characters)' };
	}
	
	// Check for potentially malicious content
	const dangerousPatterns = [
		/<script/i,
		/javascript:/i,
		/on\w+\s*=/i,
		/data:text\/html/i,
		/vbscript:/i
	];
	
	for (const pattern of dangerousPatterns) {
		if (pattern.test(sanitized)) {
			return { isValid: false, error: 'Customer name contains invalid characters' };
		}
	}
	
	return { isValid: true, sanitized };
}

/**
 * Sanitize and validate phone number
 */
export function validatePhoneNumber(phone: string): { isValid: boolean; error?: string; sanitized?: string } {
	if (!phone || typeof phone !== 'string') {
		return { isValid: false, error: 'Phone number is required' };
	}

	const sanitized = phone.trim();
	
	if (sanitized.length === 0) {
		return { isValid: false, error: 'Phone number cannot be empty' };
	}
	
	// Basic phone number validation (international format)
	const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,15}$/;
	if (!phoneRegex.test(sanitized)) {
		return { isValid: false, error: 'Invalid phone number format' };
	}
	
	return { isValid: true, sanitized };
}

/**
 * Sanitize and validate quantity
 */
export function validateQuantity(quantity: number): { isValid: boolean; error?: string } {
	if (typeof quantity !== 'number' || isNaN(quantity)) {
		return { isValid: false, error: 'Quantity must be a valid number' };
	}
	
	if (quantity <= 0) {
		return { isValid: false, error: 'Quantity must be greater than 0' };
	}
	
	if (quantity > 1000) {
		return { isValid: false, error: 'Quantity too large (max 1000 kg)' };
	}
	
	return { isValid: true };
}

/**
 * Sanitize and validate unit price
 */
export function validateUnitPrice(price: number): { isValid: boolean; error?: string } {
	if (typeof price !== 'number' || isNaN(price)) {
		return { isValid: false, error: 'Unit price must be a valid number' };
	}
	
	if (price < 0) {
		return { isValid: false, error: 'Unit price must be non-negative' };
	}
	
	if (price > 10000) {
		return { isValid: false, error: 'Unit price too high (max ₱10,000)' };
	}
	
	return { isValid: true };
}

/**
 * Sanitize and validate remarks
 */
export function validateRemarks(remarks?: string): { isValid: boolean; error?: string; sanitized?: string } {
	if (!remarks) {
		return { isValid: true, sanitized: '' };
	}
	
	if (typeof remarks !== 'string') {
		return { isValid: false, error: 'Remarks must be a string' };
	}
	
	const sanitized = remarks.trim();
	
	if (sanitized.length > 500) {
		return { isValid: false, error: 'Remarks too long (max 500 characters)' };
	}
	
	// Check for potentially malicious content
	const dangerousPatterns = [
		/<script/i,
		/javascript:/i,
		/on\w+\s*=/i,
		/data:text\/html/i,
		/vbscript:/i
	];
	
	for (const pattern of dangerousPatterns) {
		if (pattern.test(sanitized)) {
			return { isValid: false, error: 'Remarks contain invalid characters' };
		}
	}
	
	return { isValid: true, sanitized };
}

/**
 * Validate UUID format
 */
export function validateUUID(uuid: string): { isValid: boolean; error?: string } {
	if (!uuid || typeof uuid !== 'string') {
		return { isValid: false, error: 'UUID is required' };
	}
	
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	if (!uuidRegex.test(uuid)) {
		return { isValid: false, error: 'Invalid UUID format' };
	}
	
	return { isValid: true };
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function validateDate(date: string): { isValid: boolean; error?: string } {
	if (!date || typeof date !== 'string') {
		return { isValid: false, error: 'Date is required' };
	}
	
	const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
	if (!dateRegex.test(date)) {
		return { isValid: false, error: 'Invalid date format. Use YYYY-MM-DD' };
	}
	
	// Check if it's a valid date
	const dateObj = new Date(date);
	if (isNaN(dateObj.getTime())) {
		return { isValid: false, error: 'Invalid date' };
	}
	
	return { isValid: true };
}

/**
 * Validate order status
 */
export function validateOrderStatus(status: string): { isValid: boolean; error?: string } {
	const validStatuses = ['pending', 'processing', 'ready', 'completed', 'cancelled'];
	
	if (!validStatuses.includes(status)) {
		return { isValid: false, error: 'Invalid order status' };
	}
	
	return { isValid: true };
}

/**
 * Validate payment status
 */
export function validatePaymentStatus(status: string): { isValid: boolean; error?: string } {
	const validStatuses = ['paid', 'unpaid', 'partial'];
	
	if (!validStatuses.includes(status)) {
		return { isValid: false, error: 'Invalid payment status' };
	}
	
	return { isValid: true };
}

/**
 * Validate payment method
 */
export function validatePaymentMethod(method: string): { isValid: boolean; error?: string } {
	const validMethods = ['cash', 'gcash', 'paymaya', 'bank_transfer', 'credit_card'];
	
	if (!validMethods.includes(method)) {
		return { isValid: false, error: 'Invalid payment method' };
	}
	
	return { isValid: true };
}

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHtml(html: string): string {
	return html
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#x27;')
		.replace(/\//g, '&#x2F;');
}

/**
 * Validate search query
 */
export function validateSearchQuery(query: string): { isValid: boolean; error?: string; sanitized?: string } {
	if (!query || typeof query !== 'string') {
		return { isValid: true, sanitized: '' };
	}
	
	const sanitized = query.trim();
	
	if (sanitized.length > 100) {
		return { isValid: false, error: 'Search query too long (max 100 characters)' };
	}
	
	// Check for potentially malicious content
	const dangerousPatterns = [
		/<script/i,
		/javascript:/i,
		/on\w+\s*=/i,
		/data:text\/html/i,
		/vbscript:/i
	];
	
	for (const pattern of dangerousPatterns) {
		if (pattern.test(sanitized)) {
			return { isValid: false, error: 'Search query contains invalid characters' };
		}
	}
	
	return { isValid: true, sanitized };
}
