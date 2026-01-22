-- Migration: Migrate craftsmanship_content to new nested structure
-- Story 5.3: Product Craftsmanship Details Integration
-- Created: 2026-01-22
-- Purpose: Update all existing craftsmanship_content from old flat structure to new nested structure

-- Migration: 20260122_001_migrate_craftsmanship_to_nested_structure.sql
-- Purpose: Update all existing craftsmanship_content to new nested structure

-- Update dresses category
UPDATE products
SET craftsmanship_content = jsonb_build_object(
    'materials', jsonb_build_object(
        'fabric', COALESCE(craftsmanship_content->'materials'->>'fabric', ''),
        'origin', COALESCE(craftsmanship_content->'materials'->>'origin', ''),
        'weight', craftsmanship_content->'materials'->>'weight',
        'certifications', craftsmanship_content->'materials'->'certifications'
    ),
    'construction', jsonb_build_object(
        'stitching', (
            SELECT jsonb_agg(item)
            FROM jsonb_array_elements(
                CASE
                    WHEN jsonb_typeof(craftsmanship_content->'construction') = 'array'
                    THEN craftsmanship_content->'construction'
                    ELSE jsonb_build_array(
                        COALESCE((craftsmanship_content->'construction'->>0)::text, 'Standard construction'),
                        COALESCE((craftsmanship_content->'construction'->>1)::text, 'Quality finishing')
                    )
                END
            ) AS item
            WHERE item IS NOT NULL AND item != 'null'::jsonb
        ),
        'finishing', jsonb_build_array(
            'Hand-finished hems',
            'French binding on cuffs'
        ),
        'quality_checks', craftsmanship_content->'quality_checks'
    ),
    'quality_checks', craftsmanship_content->'quality_checks',
    'care_instructions', (
        CASE
            WHEN craftsmanship_content->'care_instructions' IS NULL THEN NULL
            WHEN jsonb_typeof(craftsmanship_content->'care_instructions') = 'array' THEN
                (SELECT string_agg(elem::text, '. ' ORDER BY ordinality)
                 FROM jsonb_array_elements_text(craftsmanship_content->'care_instructions') WITH ORDINALITY AS arr(elem, ordinality)
                ) || '.'
            ELSE craftsmanship_content->'care_instructions'->>0
        END
    ),
    'factory_story_link', craftsmanship_content->>'factory_story_link'
)
WHERE craftsmanship_content IS NOT NULL
  AND (
    -- Only update if construction is still a flat array (old structure)
    jsonb_typeof(craftsmanship_content->'construction') = 'array'
    OR
    -- Or if care_instructions is an array (old structure)
    (craftsmanship_content->'care_instructions' IS NOT NULL AND jsonb_typeof(craftsmanship_content->'care_instructions') = 'array')
  );

-- Verify migration by checking a sample of updated records
-- SELECT id, category, craftsmanship_content FROM products WHERE craftsmanship_content IS NOT NULL LIMIT 5;
