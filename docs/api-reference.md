# API Reference

This document provides comprehensive information about the Laundry Management System's REST API endpoints, request/response formats, and authentication mechanisms.

## Base URL

```
Production: https://your-domain.com/api
Development: http://localhost:5173/api
```

## Authentication

### Authentication Methods

All API requests require authentication using JWT tokens obtained through the login endpoint.

#### Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Login Endpoint
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": "2024-01-01T00:00:00Z"
  }
}
```

## Orders API

### Get Orders

```http
GET /api/orders
```

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 10, max: 100)
- `status` (string): Filter by status (pending, processing, ready, completed, cancelled)
- `payment_status` (string): Filter by payment status (paid, unpaid, partial)
- `start_date` (string): Start date filter (ISO 8601)
- `end_date` (string): End date filter (ISO 8601)
- `search` (string): Search in customer name, phone, or order number

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "uuid",
        "order_number": "ORD-2024-001",
        "customer_name": "John Doe",
        "customer_phone": "+639123456789",
        "service_type": "Wash & Fold",
        "quantity": 2.5,
        "unit_price": 45.00,
        "subtotal": 112.50,
        "add_ons_total": 25.00,
        "total_amount": 137.50,
        "payment_method": "cash",
        "payment_status": "paid",
        "status": "completed",
        "pickup_date": "2024-01-15",
        "delivery_date": "2024-01-17",
        "remarks": "Handle with care",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-17T14:20:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "total_pages": 15
    }
  }
}
```

### Create Order

```http
POST /api/orders
```

**Request Body:**
```json
{
  "customer_name": "Jane Smith",
  "customer_phone": "+639987654321",
  "customer_id": "uuid", // Optional: link to existing customer
  "service_type": "Dry Clean",
  "quantity": 3,
  "unit_price": 120.00,
  "payment_method": "gcash",
  "payment_status": "unpaid",
  "status": "pending",
  "pickup_date": "2024-01-20",
  "delivery_date": "2024-01-22",
  "remarks": "Express service required",
  "add_ons": [
    {
      "add_on_id": "uuid",
      "quantity": 1,
      "unit_price": 15.00
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "order_number": "ORD-2024-002",
      // ... full order object
    }
  }
}
```

### Get Order by ID

```http
GET /api/orders/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "order_number": "ORD-2024-001",
      // ... full order object with add-ons
      "add_ons": [
        {
          "id": "uuid",
          "name": "Fabric Softener",
          "quantity": 1,
          "unit_price": 10.00,
          "total_price": 10.00
        }
      ]
    }
  }
}
```

### Update Order

```http
PUT /api/orders/{id}
```

**Request Body:**
```json
{
  "status": "processing",
  "payment_status": "paid",
  "remarks": "Updated remarks"
}
```

### Delete Order

```http
DELETE /api/orders/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "Order deleted successfully"
}
```

## Customers API

### Get Customers

```http
GET /api/customers
```

**Query Parameters:**
- `page` (integer): Page number
- `limit` (integer): Items per page
- `search` (string): Search in name, phone, or email

**Response:**
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": "uuid",
        "name": "John Doe",
        "phone": "+639123456789",
        "address": "123 Main St, Manila",
        "email": "john@example.com",
        "total_orders": 15,
        "total_spent": 2500.00,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "total_pages": 5
    }
  }
}
```

### Create Customer

```http
POST /api/customers
```

**Request Body:**
```json
{
  "name": "Alice Johnson",
  "phone": "+639555123456",
  "address": "456 Oak Ave, Quezon City",
  "email": "alice@example.com"
}
```

### Update Customer

```http
PUT /api/customers/{id}
```

### Delete Customer

```http
DELETE /api/customers/{id}
```

## Service Pricing API

### Get Service Pricing

```http
GET /api/service-pricing
```

**Response:**
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "id": "uuid",
        "service_name": "Wash & Fold",
        "price": 45.00,
        "unit": "kg",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### Create Service

```http
POST /api/service-pricing
```

**Request Body:**
```json
{
  "service_name": "Premium Wash",
  "price": 60.00,
  "unit": "kg",
  "is_active": true
}
```

## Add-ons API

### Get Add-ons

```http
GET /api/add-ons
```

**Response:**
```json
{
  "success": true,
  "data": {
    "add_ons": [
      {
        "id": "uuid",
        "name": "Fabric Softener",
        "price": 10.00,
        "unit": "order",
        "is_active": true
      }
    ]
  }
}
```

## Reports API

### Financial Report

```http
GET /api/reports/financial
```

**Query Parameters:**
- `start_date` (string): Start date (ISO 8601)
- `end_date` (string): End date (ISO 8601)
- `group_by` (string): day, week, month

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_revenue": 50000.00,
      "total_orders": 250,
      "average_order_value": 200.00,
      "payment_methods": {
        "cash": 20000.00,
        "gcash": 15000.00,
        "paymaya": 10000.00,
        "bank_transfer": 5000.00
      }
    },
    "daily_breakdown": [
      {
        "date": "2024-01-15",
        "revenue": 2500.00,
        "orders": 12,
        "avg_order_value": 208.33
      }
    ]
  }
}
```

### Orders Report

```http
GET /api/reports/orders
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_orders": 250,
      "pending": 15,
      "processing": 25,
      "ready": 10,
      "completed": 195,
      "cancelled": 5
    },
    "service_breakdown": [
      {
        "service_type": "Wash & Fold",
        "count": 150,
        "percentage": 60.0
      }
    ]
  }
}
```

## User Management API (Admin Only)

### Get Users

```http
GET /api/users
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "admin@example.com",
        "full_name": "Admin User",
        "role": "admin",
        "is_active": true,
        "last_login": "2024-01-15T10:30:00Z",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### Create User

```http
POST /api/users
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "full_name": "New User",
  "role": "staff",
  "password": "temporaryPassword123"
}
```

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "customer_phone",
        "message": "Invalid phone number format"
      }
    ]
  }
}
```

### HTTP Status Codes

- **200 OK**: Successful request
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **422 Unprocessable Entity**: Validation errors
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

### Common Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request data validation failed |
| `UNAUTHORIZED` | Invalid or expired authentication token |
| `FORBIDDEN` | User lacks required permissions |
| `NOT_FOUND` | Requested resource does not exist |
| `DUPLICATE_ENTRY` | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `SERVER_ERROR` | Internal server error |

## Rate Limiting

API requests are rate limited to prevent abuse:

- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **Order creation**: 10 requests per minute per user
- **General API**: 100 requests per minute per user
- **Report generation**: 5 requests per hour per user

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Webhooks

### Order Status Change

When an order status changes, a webhook can be sent to your configured endpoint:

**Webhook Payload:**
```json
{
  "event": "order.status_changed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "order_id": "uuid",
    "order_number": "ORD-2024-001",
    "old_status": "processing",
    "new_status": "ready",
    "customer": {
      "name": "John Doe",
      "phone": "+639123456789"
    }
  }
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
// Initialize API client
class LaundryAPI {
  private baseURL = 'https://your-domain.com/api';
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  // Get orders
  async getOrders(params: GetOrdersParams = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/orders?${query}`);
  }

  // Create order
  async createOrder(orderData: CreateOrderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }
}

// Usage
const api = new LaundryAPI('your-jwt-token');
const orders = await api.getOrders({ status: 'pending', limit: 20 });
```

### Python

```python
import requests
from typing import Dict, Any, Optional

class LaundryAPI:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }

    def get_orders(self, **params) -> Dict[str, Any]:
        response = requests.get(
            f'{self.base_url}/orders',
            headers=self.headers,
            params=params
        )
        response.raise_for_status()
        return response.json()

    def create_order(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        response = requests.post(
            f'{self.base_url}/orders',
            headers=self.headers,
            json=order_data
        )
        response.raise_for_status()
        return response.json()

# Usage
api = LaundryAPI('https://your-domain.com/api', 'your-jwt-token')
orders = api.get_orders(status='pending', limit=20)
```

## Versioning

The API uses URL versioning. Current version is v1:

```
https://your-domain.com/api/v1/orders
```

Breaking changes will result in a new version (v2, v3, etc.). Non-breaking changes are deployed to existing versions.

## Testing

### Postman Collection

A Postman collection is available for testing the API:
[Download Postman Collection](./postman/laundry-api.postman_collection.json)

### Environment Variables

Set up these environment variables in Postman:
- `base_url`: API base URL
- `auth_token`: JWT authentication token
- `user_id`: Current user ID for testing

---

*Next: [Database Schema](./database-schema.md)*
