-- Migration: Update products with craftsmanship_content sample data
-- Story 2-5: Craftsmanship Content Integration in PDP
-- Created: 2025-12-12

-- Update products with sample craftsmanship_content data
-- This populates the craftsmanship_content JSONB field with materials, construction, quality_checks

UPDATE products
SET craftsmanship_content = jsonb_build_object(
    'materials', jsonb_build_object(
        'fabric', '100% Organic Cotton',
        'origin', 'Gujarat, India',
        'composition', 'Ring-spun organic cotton, GOTS certified'
    ),
    'construction', jsonb_build_array(
        'French seams for durability',
        'Double-needle stitching at stress points',
        'Hand-finished buttonholes',
        'Reinforced shoulder seams'
    ),
    'quality_checks', jsonb_build_array(
        'Fabric inspection for defects',
        'Stitch integrity verification',
        'Color fastness testing',
        'Final press and packaging quality check'
    ),
    'care_instructions', jsonb_build_array(
        'Machine wash cold with like colors',
        'Tumble dry low',
        'Iron on low heat if needed',
        'Do not bleach'
    ),
    'factory_story_link', '/about'
)
WHERE category = 'dresses' AND craftsmanship_content IS NULL;

UPDATE products
SET craftsmanship_content = jsonb_build_object(
    'materials', jsonb_build_object(
        'fabric', 'Premium Linen Blend',
        'origin', 'Flanders, Belgium',
        'composition', '70% European Linen, 30% Organic Cotton'
    ),
    'construction', jsonb_build_array(
        'Flatlock seams for comfort',
        'Reinforced side seams',
        'Bar-tacked stress points',
        'Pre-washed for softness'
    ),
    'quality_checks', jsonb_build_array(
        'Thread tension verification',
        'Seam strength testing',
        'Shrinkage control check',
        'Final quality inspection'
    ),
    'care_instructions', jsonb_build_array(
        'Machine wash warm',
        'Hang dry or tumble dry low',
        'Iron while slightly damp',
        'May soften with each wash'
    ),
    'factory_story_link', '/about'
)
WHERE category = 'tops' AND craftsmanship_content IS NULL;

UPDATE products
SET craftsmanship_content = jsonb_build_object(
    'materials', jsonb_build_object(
        'fabric', 'Stretch Organic Denim',
        'origin', 'Fukuyama, Japan',
        'composition', '98% Organic Cotton, 2% Elastane'
    ),
    'construction', jsonb_build_array(
        'Traditional indigo rope dyeing',
        'Chain-stitch hemming',
        'Copper rivets at stress points',
        'Selvedge edge detailing'
    ),
    'quality_checks', jsonb_build_array(
        'Denim weight consistency',
        'Color uniformity testing',
        'Stretch recovery verification',
        'Hardware durability check'
    ),
    'care_instructions', jsonb_build_array(
        'Wash inside out in cold water',
        'Hang dry to preserve fit',
        'Avoid over-washing to maintain color',
        'Steam to remove wrinkles'
    ),
    'factory_story_link', '/about'
)
WHERE category = 'bottoms' AND craftsmanship_content IS NULL;

UPDATE products
SET craftsmanship_content = jsonb_build_object(
    'materials', jsonb_build_object(
        'fabric', 'Recycled Wool Blend',
        'origin', 'Prato, Italy',
        'composition', '60% Recycled Wool, 40% Organic Cotton'
    ),
    'construction', jsonb_build_array(
        'Fully lined with organic cotton',
        'Hand-set shoulder pads',
        'Real horn buttons',
        'Bound buttonholes'
    ),
    'quality_checks', jsonb_build_array(
        'Fabric weight consistency',
        'Lining alignment check',
        'Button attachment strength',
        'Final pressing inspection'
    ),
    'care_instructions', jsonb_build_array(
        'Dry clean only',
        'Store on padded hanger',
        'Steam to refresh between wears',
        'Keep away from direct heat'
    ),
    'factory_story_link', '/about'
)
WHERE category = 'outerwear' AND craftsmanship_content IS NULL;

UPDATE products
SET craftsmanship_content = jsonb_build_object(
    'materials', jsonb_build_object(
        'fabric', 'Handwoven Cotton',
        'origin', 'Oaxaca, Mexico',
        'composition', '100% Hand-dyed Natural Cotton'
    ),
    'construction', jsonb_build_array(
        'Traditional backstrap loom weaving',
        'Natural plant dyes',
        'Each piece is unique',
        'Artisan signed'
    ),
    'quality_checks', jsonb_build_array(
        'Weave density verification',
        'Color fastness testing',
        'Artisan quality standards',
        'Final inspection by master weaver'
    ),
    'care_instructions', jsonb_build_array(
        'Hand wash in cold water',
        'Lay flat to dry',
        'Do not wring',
        'Iron on reverse side'
    ),
    'factory_story_link', '/about'
)
WHERE category = 'accessories' AND craftsmanship_content IS NULL;
