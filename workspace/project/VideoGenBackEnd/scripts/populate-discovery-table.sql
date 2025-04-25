-- Populate Discovery Table with Available Videos
-- This script will add all completed generations with videos to the discoveries table

-- Variables
DO $$
DECLARE
    next_display_order INTEGER;
    creator_user_id UUID;
    video_count INTEGER := 0;
    inserted_rows INTEGER;
BEGIN
    -- Get a user ID from an existing generation
    -- This ensures we use a valid user ID that exists in the system
    SELECT user_id INTO creator_user_id FROM generations WHERE user_id IS NOT NULL LIMIT 1;
    
    IF creator_user_id IS NULL THEN
        RAISE EXCEPTION 'No user IDs found in generations table. Cannot proceed.';
    END IF;
    
    RAISE NOTICE 'Using user ID: %', creator_user_id;
    
    -- Get the current max display order
    SELECT COALESCE(MAX(display_order), 0) + 1 INTO next_display_order FROM discoveries;
    
    RAISE NOTICE 'Starting with display order: %', next_display_order;
    
    -- Insert all completed generations with videos that aren't already in discoveries
    WITH available_videos AS (
        SELECT 
            g.id,
            g.project_id,
            g.user_id,
            g.status,
            g.video_url,
            g.thumbnail_url,
            g.duration,
            g.created_at
        FROM 
            generations g
        WHERE 
            g.status = 'completed'
            AND g.video_url IS NOT NULL
            AND NOT EXISTS (
                SELECT 1 FROM discoveries d WHERE d.generation_id = g.id
            )
        ORDER BY 
            g.created_at DESC
    ),
    inserted AS (
        INSERT INTO discoveries (
            generation_id,
            display_order,
            created_by,
            created_at,
            updated_at
        )
        SELECT
            id,
            next_display_order + row_number() OVER () - 1,
            creator_user_id,  -- Use the existing user ID from generations
            NOW(),
            NOW()
        FROM
            available_videos
        RETURNING 1
    )
    SELECT COUNT(*) INTO inserted_rows FROM inserted;
    
    RAISE NOTICE 'Added % videos to the discoveries table', inserted_rows;
END $$;

-- Verify the results
SELECT COUNT(*) AS total_discoveries FROM discoveries;

-- List the newly added discoveries
SELECT 
    d.id,
    d.generation_id,
    d.display_order,
    d.created_at,
    g.video_url,
    g.thumbnail_url,
    p.title AS project_title,
    d.created_by
FROM 
    discoveries d
JOIN 
    generations g ON d.generation_id = g.id
LEFT JOIN
    projects p ON g.project_id = p.id
ORDER BY 
    d.display_order DESC
LIMIT 20; 