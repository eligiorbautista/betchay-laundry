# Supabase Authentication Setup

This document explains how the Supabase authentication is integrated into your Laundry Management System.

## Overview

The authentication system uses Supabase for user management and includes:
- Email/password login and signup
- Password reset functionality
- Protected routes
- **Cookie-based session storage** (instead of localStorage)
- Server-side session validation
- User state management with Svelte stores

## Why Cookies Instead of localStorage?

This implementation uses **secure cookies** instead of localStorage for better security:

### 🔒 **Security Benefits:**
- **XSS Protection**: Cookies can't be accessed by malicious JavaScript
- **Server-side Access**: Your SvelteKit server can read sessions for SSR
- **Automatic Expiry**: Browsers handle cookie expiration automatically
- **CSRF Protection**: Combined with SameSite=Lax for better security

### 🚀 **SSR Benefits:**
- **Page Load Speed**: Server can validate auth before sending HTML
- **SEO Friendly**: Protected content properly rendered server-side
- **Better UX**: No flash of unauthenticated content

### ⚙️ **Cookie Configuration:**
```javascript
// Secure cookie settings
{
  path: '/',
  maxAge: 7 * 24 * 60 * 60,    // 7 days
  sameSite: 'lax',             // CSRF protection
  secure: true,                // HTTPS only in production
  httpOnly: false              // Supabase needs access
}
```

## Environment Configuration

Make sure your `.env` file contains:
```env
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Authentication Flow

### 1. **Login Process**
- Users can log in at `/auth/login`
- Client-side validation and server-side fallback
- Automatic redirect to dashboard on success
- Error handling with toast notifications

### 2. **Password Reset**
- Users can request password reset at `/auth/forgot-password`
- Email sent via Supabase with reset link
- Password update at `/auth/reset-password`

### 3. **Route Protection**
- All routes under `(app)` are protected
- Automatic redirect to login if not authenticated
- Server-side session validation

### 4. **Logout**
- Logout button in header dropdown
- Clears session and redirects to login

## Key Files

### Authentication Store (`src/lib/stores/authStore.ts`)
- Central authentication state management
- Helper functions for login, logout, password reset
- Session monitoring and updates

### Layout Files
- `src/routes/+layout.svelte` - Initializes auth store
- `src/routes/+layout.server.ts` - Server-side session handling
- `src/routes/(app)/+layout.server.ts` - Protected route validation

### Auth Pages
- `src/routes/auth/login/` - Login page with Supabase integration
- `src/routes/auth/forgot-password/` - Password reset request
- `src/routes/auth/reset-password/` - Password reset form
- `src/routes/auth/logout/` - Logout handling

### Components
- `src/lib/components/layout/Header.svelte` - User menu with logout

## How to Use

### For Development
1. Set up a Supabase project
2. Enable Email authentication in Supabase dashboard
3. Copy your project URL and anon key to `.env`
4. Run the application: `npm run dev`

### Creating Users
Users can be created through:
1. Supabase dashboard (for testing)
2. The signup flow (if you implement a signup page)
3. Invitations (if you implement user invitations)

### Testing Authentication
1. Create a test user in Supabase dashboard
2. Try logging in at `/auth/login`
3. Test password reset flow
4. Verify protected routes redirect when not authenticated

## Security Features

- **Cookie-based sessions** - Sessions stored in secure cookies instead of localStorage
- **Server-side session validation** - Full SSR support with cookie access
- **Automatic token refresh** - Sessions are automatically refreshed
- **Secure cookie settings** - SameSite=Lax, Secure in production, 7-day expiry
- **Route protection** - Protected routes check authentication server-side
- **Error handling** - Proper error messages and fallbacks
- **XSS protection** - Cookies provide better security than localStorage

## Next Steps

To complete the authentication system, consider adding:
1. User signup page
2. Email verification flow
3. Two-factor authentication
4. User profile management
5. Password strength requirements
6. Rate limiting for login attempts

## Troubleshooting

### Common Issues
1. **Environment variables not loading** - Ensure `.env` file is in project root
2. **Redirect loops** - Check that protected routes properly validate sessions
3. **Session not persisting** - Verify Supabase client configuration

### Debug Tips
- Check browser console for authentication errors
- Verify Supabase project settings
- Ensure email templates are configured in Supabase dashboard for password reset