-- Fix for existing databases: Update RLS policy to allow viewing all recipes
-- Run this in your Supabase SQL editor

-- Drop the old restrictive policy that only allows users to see their own recipes
DROP POLICY IF EXISTS "Users can view their own recipes" ON recipes;

-- Create the new permissive policy that allows all authenticated users to view all recipes
CREATE POLICY "Users can view all recipes" ON recipes
    FOR SELECT USING (true);

-- Verify the change by checking the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'recipes'; 