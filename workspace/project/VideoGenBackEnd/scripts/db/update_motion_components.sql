-- Script to update motion category components with motion-focused options
-- This script updates the existing motion category components to focus specifically on motion effects

-- First, let's delete the existing motion category components
DELETE FROM public.prompt_components WHERE category = 'motion';

-- Now, let's insert the new motion-focused components
INSERT INTO public.prompt_components (id, name, description, category, display_order, image_url, created_at, updated_at) 
VALUES 
('eb63439d-96b8-49ef-94e3-18ac3587b001', 'Fade In', 'Elements gradually appear from transparent to fully visible', 'motion', 1, 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=600&auto=format&fit=crop', NOW(), NOW()),
('e9c71139-c8a3-4ae9-a521-e31f091215cc', 'Slide From Left', 'Elements enter the frame smoothly from the left side', 'motion', 2, 'https://images.unsplash.com/photo-1550684848-86a5d8727436?q=80&w=600&auto=format&fit=crop', NOW(), NOW()),
('a7059573-8fd3-4bd3-bf50-578f66552d79', 'Slide From Right', 'Elements enter the frame smoothly from the right side', 'motion', 3, 'https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?q=80&w=600&auto=format&fit=crop', NOW(), NOW()),
('8555ecc6-62f6-4dca-bf7e-59618d144419', 'Pop Up', 'Elements appear with a quick scaling effect from small to full size', 'motion', 4, 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=600&auto=format&fit=crop', NOW(), NOW()),
('30181182-8126-4cc1-93bf-8708ccb1a54a', 'Zoom In', 'Camera gradually moves closer to the subject', 'motion', 5, 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=600&auto=format&fit=crop', NOW(), NOW()),
('3ee0471e-b118-4596-b2f7-70e65e2e5d04', 'Zoom Out', 'Camera gradually moves away from the subject', 'motion', 6, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop', NOW(), NOW()),
('3335cb19-b5c4-420b-a7e1-8df7aaa4941e', 'Rotate', 'Elements spin around their center axis', 'motion', 7, 'https://images.unsplash.com/photo-1633613286991-611fe299c4be?q=80&w=600&auto=format&fit=crop', NOW(), NOW()),
('18dcb48b-ced2-4725-9985-db39b7d01b98', 'Bounce', 'Elements move with a springy, bouncing effect', 'motion', 8, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop', NOW(), NOW()),
('ccff7154-b40a-4dc3-bbe4-a9b7feceb8ca', 'Float Up', 'Elements gently rise from bottom to top', 'motion', 9, 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=600&auto=format&fit=crop', NOW(), NOW()),
('8b5bfe43-1a30-4ac4-9aab-f54a62323387', 'Burst', 'Elements explode outward from a central point', 'motion', 10, 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?q=80&w=600&auto=format&fit=crop', NOW(), NOW());

-- Note: This script preserves the existing IDs from your data to maintain referential integrity
-- The descriptions have been updated to focus specifically on motion effects
-- The image URLs are kept the same as they were in your provided data 