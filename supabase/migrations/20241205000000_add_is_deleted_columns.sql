-- Migration: Add is_deleted columns for soft delete functionality
-- Tables: statues, images

-- Add is_deleted column to statues table
ALTER TABLE statues 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE NOT NULL;

-- Add is_deleted column to images table  
ALTER TABLE images 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE NOT NULL;

-- Add indexes for performance when filtering out deleted records
CREATE INDEX IF NOT EXISTS idx_statues_is_deleted ON statues(is_deleted) WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_images_is_deleted ON images(is_deleted) WHERE is_deleted = FALSE;

-- Update existing NULL values to FALSE (if any exist)
UPDATE statues SET is_deleted = FALSE WHERE is_deleted IS NULL;
UPDATE images SET is_deleted = FALSE WHERE is_deleted IS NULL;

