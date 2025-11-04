-- Migration: Fix Favorites table to support string IDs (NCT IDs, PubMed IDs, ORCID IDs)
-- This allows favorites to work with external API data

USE curalink;

-- Drop the existing unique constraint
ALTER TABLE Favorites DROP INDEX unique_favorite;

-- Modify item_id column from INT to VARCHAR to support string IDs
ALTER TABLE Favorites MODIFY item_id VARCHAR(100) NOT NULL;

-- Recreate the unique constraint
ALTER TABLE Favorites ADD UNIQUE KEY unique_favorite (user_id, item_type, item_id);

-- Verify the change
DESCRIBE Favorites;
