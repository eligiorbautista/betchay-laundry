/**
 * Performance optimization utilities
 */

// Simple in-memory cache (in production, use Redis or similar)
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

/**
 * Cache configuration
 */
export const CACHE_CONFIG = {
	defaultTTL: 5 * 60 * 1000, // 5 minutes
	maxSize: 1000, // Maximum number of cached items
	cleanupInterval: 10 * 60 * 1000 // Clean up every 10 minutes
};

/**
 * Cache interface
 */
interface CacheOptions {
	ttl?: number;
	key?: string;
}

/**
 * Get cached data
 */
export function getCachedData<T>(key: string): T | null {
	const item = cache.get(key);
	
	if (!item) {
		return null;
	}
	
	// Check if expired
	if (Date.now() - item.timestamp > item.ttl) {
		cache.delete(key);
		return null;
	}
	
	return item.data as T;
}

/**
 * Set cached data
 */
export function setCachedData<T>(key: string, data: T, options: CacheOptions = {}): void {
	const ttl = options.ttl || CACHE_CONFIG.defaultTTL;
	
	// Clean up if cache is too large
	if (cache.size >= CACHE_CONFIG.maxSize) {
		cleanupCache();
	}
	
	cache.set(key, {
		data,
		timestamp: Date.now(),
		ttl
	});
}

/**
 * Remove cached data
 */
export function removeCachedData(key: string): void {
	cache.delete(key);
}

/**
 * Clear all cached data
 */
export function clearCache(): void {
	cache.clear();
}

/**
 * Clean up expired cache entries
 */
export function cleanupCache(): void {
	const now = Date.now();
	for (const [key, item] of cache.entries()) {
		if (now - item.timestamp > item.ttl) {
			cache.delete(key);
		}
	}
}

/**
 * Generate cache key from parameters
 */
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
	const sortedParams = Object.keys(params)
		.sort()
		.map(key => `${key}:${params[key]}`)
		.join('|');
	
	return `${prefix}:${sortedParams}`;
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout;
	
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
	func: T,
	limit: number
): (...args: Parameters<T>) => void {
	let inThrottle: boolean;
	
	return (...args: Parameters<T>) => {
		if (!inThrottle) {
			func(...args);
			inThrottle = true;
			setTimeout(() => inThrottle = false, limit);
		}
	};
}

/**
 * Memoize function results
 */
export function memoize<T extends (...args: any[]) => any>(
	fn: T,
	keyGenerator?: (...args: Parameters<T>) => string
): T {
	const cache = new Map<string, ReturnType<T>>();
	
	return ((...args: Parameters<T>): ReturnType<T> => {
		const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
		
		if (cache.has(key)) {
			return cache.get(key)!;
		}
		
		const result = fn(...args);
		cache.set(key, result);
		return result;
	}) as T;
}

/**
 * Lazy load component
 */
export function lazyLoad<T>(importFn: () => Promise<{ default: T }>): () => Promise<T> {
	let promise: Promise<T> | null = null;
	
	return () => {
		if (!promise) {
			promise = importFn().then(module => module.default);
		}
		return promise;
	};
}

/**
 * Preload critical resources
 */
export function preloadResources(resources: string[]): void {
	resources.forEach(resource => {
		const link = document.createElement('link');
		link.rel = 'preload';
		link.href = resource;
		
		if (resource.endsWith('.css')) {
			link.as = 'style';
		} else if (resource.endsWith('.js')) {
			link.as = 'script';
		} else if (resource.match(/\.(png|jpg|jpeg|gif|webp|svg)$/)) {
			link.as = 'image';
		}
		
		document.head.appendChild(link);
	});
}

/**
 * Optimize images
 */
export function optimizeImage(src: string, options: {
	width?: number;
	height?: number;
	quality?: number;
	format?: 'webp' | 'jpeg' | 'png';
} = {}): string {
	// In a real implementation, you would use an image optimization service
	// For now, return the original source
	return src;
}

/**
 * Measure performance
 */
export function measurePerformance<T>(name: string, fn: () => T): T {
	const start = performance.now();
	const result = fn();
	const end = performance.now();
	
	console.log(`${name} took ${end - start}ms`);
	return result;
}

/**
 * Async performance measurement
 */
export async function measureAsyncPerformance<T>(
	name: string, 
	fn: () => Promise<T>
): Promise<T> {
	const start = performance.now();
	const result = await fn();
	const end = performance.now();
	
	console.log(`${name} took ${end - start}ms`);
	return result;
}

/**
 * Batch operations for better performance
 */
export function batchOperations<T, R>(
	items: T[],
	batchSize: number,
	operation: (batch: T[]) => Promise<R[]>
): Promise<R[]> {
	const results: R[] = [];
	
	return new Promise((resolve, reject) => {
		let currentIndex = 0;
		
		function processBatch() {
			const batch = items.slice(currentIndex, currentIndex + batchSize);
			
			if (batch.length === 0) {
				resolve(results);
				return;
			}
			
			operation(batch)
				.then(batchResults => {
					results.push(...batchResults);
					currentIndex += batchSize;
					processBatch();
				})
				.catch(reject);
		}
		
		processBatch();
	});
}

/**
 * Virtual scrolling helper
 */
export function createVirtualScroller<T>(
	items: T[],
	itemHeight: number,
	containerHeight: number
) {
	const visibleCount = Math.ceil(containerHeight / itemHeight);
	const totalHeight = items.length * itemHeight;
	
	return {
		getVisibleItems: (scrollTop: number) => {
			const startIndex = Math.floor(scrollTop / itemHeight);
			const endIndex = Math.min(startIndex + visibleCount + 1, items.length);
			
			return {
				items: items.slice(startIndex, endIndex),
				startIndex,
				endIndex,
				offsetY: startIndex * itemHeight
			};
		},
		totalHeight,
		visibleCount
	};
}

// Clean up cache periodically
setInterval(cleanupCache, CACHE_CONFIG.cleanupInterval);
