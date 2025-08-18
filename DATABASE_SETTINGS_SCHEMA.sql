-- Simplified Settings Database Schema for Laundry Management System
-- This creates only the database schema needed for the settings page
-- Run these SQL commands in your Supabase SQL editor

-- ===================================================
-- NOTES
-- ===================================================
-- The settings page only requires password management functionality
-- User profile data comes from Supabase auth.users table
-- No additional database tables are needed for the current implementation

-- ===================================================
-- VERIFICATION QUERIES (Optional)
-- ===================================================
-- You can run these to verify your auth setup is working:

-- Check if auth.users table exists and has data
-- SELECT id, email, created_at FROM auth.users LIMIT 5;

-- Check user metadata (where full_name is stored)
-- SELECT id, email, raw_user_meta_data FROM auth.users LIMIT 5;

-- ===================================================
-- CLEANUP (Optional)
-- ===================================================
-- If you previously created settings-related tables and want to clean them up:

-- DROP TABLE IF EXISTS user_preferences CASCADE;
-- DROP TABLE IF EXISTS service_pricing CASCADE;

-- ===================================================
-- SUMMARY
-- ===================================================
-- Your simplified settings page only needs:
-- 1. User profile display (from auth.users)
-- 2. Password change functionality (via Supabase Auth API)
-- 3. No additional database tables required