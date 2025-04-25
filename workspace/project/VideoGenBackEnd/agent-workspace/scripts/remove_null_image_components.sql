-- Script to remove prompt components with null image_url values
-- This script will delete all entries from the prompt_components table where image_url is null

-- First, let's see how many records will be affected (optional, for verification)
SELECT COUNT(*) 
FROM public.prompt_components 
WHERE image_url IS NULL;

-- Now delete the records with null image_url values
DELETE FROM public.prompt_components 
WHERE image_url IS NULL;

-- Verify the deletion was successful (optional)
SELECT COUNT(*) 
FROM public.prompt_components 
WHERE image_url IS NULL;

-- Show remaining records (optional)
SELECT id, name, category, display_order, image_url 
FROM public.prompt_components 
ORDER BY category, display_order; 