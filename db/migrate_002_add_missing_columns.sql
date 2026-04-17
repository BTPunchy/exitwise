-- Migration: Add missing columns for auth, profiles, and POI details
-- Run this against your Supabase SQL Editor

-- 1. Users table: Add password hash and travel mode preference
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_travel_mode VARCHAR(20) DEFAULT 'lazy';

-- 2. POIs table: Add operating hours, rating, and image URL
ALTER TABLE pois ADD COLUMN IF NOT EXISTS operating_hours JSONB;
ALTER TABLE pois ADD COLUMN IF NOT EXISTS rating FLOAT;
ALTER TABLE pois ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE pois ADD COLUMN IF NOT EXISTS google_place_id TEXT;
