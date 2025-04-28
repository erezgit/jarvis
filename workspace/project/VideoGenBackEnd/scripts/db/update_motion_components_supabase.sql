-- Script to update motion category components with motion-focused options
-- This script can be run directly in the Supabase SQL Editor

-- First, let's update the existing motion category components
-- We'll use UPDATE statements instead of DELETE + INSERT to maintain any relationships

-- Update the first motion component
UPDATE public.prompt_components
SET name = 'Fade In',
    description = 'Elements gradually appear from transparent to fully visible'
WHERE id = 'eb63439d-96b8-49ef-94e3-18ac3587b001';

-- Update the second motion component
UPDATE public.prompt_components
SET name = 'Slide From Left',
    description = 'Elements enter the frame smoothly from the left side'
WHERE id = 'e9c71139-c8a3-4ae9-a521-e31f091215cc';

-- Update the third motion component
UPDATE public.prompt_components
SET name = 'Slide From Right',
    description = 'Elements enter the frame smoothly from the right side'
WHERE id = 'a7059573-8fd3-4bd3-bf50-578f66552d79';

-- Update the fourth motion component
UPDATE public.prompt_components
SET name = 'Pop Up',
    description = 'Elements appear with a quick scaling effect from small to full size'
WHERE id = '8555ecc6-62f6-4dca-bf7e-59618d144419';

-- Update the fifth motion component
UPDATE public.prompt_components
SET name = 'Zoom In',
    description = 'Camera gradually moves closer to the subject'
WHERE id = '30181182-8126-4cc1-93bf-8708ccb1a54a';

-- Update the sixth motion component
UPDATE public.prompt_components
SET name = 'Zoom Out',
    description = 'Camera gradually moves away from the subject'
WHERE id = '3ee0471e-b118-4596-b2f7-70e65e2e5d04';

-- Update the seventh motion component
UPDATE public.prompt_components
SET name = 'Rotate',
    description = 'Elements spin around their center axis'
WHERE id = '3335cb19-b5c4-420b-a7e1-8df7aaa4941e';

-- Update the eighth motion component
UPDATE public.prompt_components
SET name = 'Bounce',
    description = 'Elements move with a springy, bouncing effect'
WHERE id = '18dcb48b-ced2-4725-9985-db39b7d01b98';

-- Update the ninth motion component
UPDATE public.prompt_components
SET name = 'Float Up',
    description = 'Elements gently rise from bottom to top'
WHERE id = 'ccff7154-b40a-4dc3-bbe4-a9b7feceb8ca';

-- Update the tenth motion component
UPDATE public.prompt_components
SET name = 'Burst',
    description = 'Elements explode outward from a central point'
WHERE id = '8b5bfe43-1a30-4ac4-9aab-f54a62323387';

-- Verify the changes (optional - you can run this separately in Supabase)
-- SELECT id, name, description, category, display_order FROM public.prompt_components WHERE category = 'motion' ORDER BY display_order; 