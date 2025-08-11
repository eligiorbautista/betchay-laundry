// Global constants for the Laundry Management System

// Application Info
export const APP_NAME = 'Betchay Laundry';
export const APP_SHORT_NAME = 'LMS';

// API Endpoints
export const API_ENDPOINTS = {
  ORDERS: '/api/orders',
  INVOICES: '/api/invoices',
  REPORTS: '/api/reports',
  AUTH: '/api/auth'
} as const;

// Order Status Enums
export const ORDER_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

// Payment Status Enums
export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  PARTIAL: 'partial',
  REFUNDED: 'refunded'
} as const;

// Claim Status Enums
export const CLAIM_STATUS = {
  UNCLAIMED: 'unclaimed',
  CLAIMED: 'claimed'
} as const;

// Payment Method Enums
export const PAYMENT_METHODS = {
  CASH: 'cash',
  GCASH: 'gcash',
  BANK_TRANSFER: 'bank_transfer',
  CREDIT_CARD: 'credit_card',
  PAYMAYA: 'paymaya'
} as const;

// Service Prices (moved to database later)
export const SERVICE_PRICES = {
  WASH_ONLY: 50,
  DRY_ONLY: 30,
  WASH_AND_DRY: 75,
  IRON_ONLY: 25,
  WASH_DRY_IRON: 95
} as const;
