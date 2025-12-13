-- ============================================
-- Update product images to use local assets
-- Replaces Unsplash URLs with /images/[filename]
-- ============================================

-- COATS / OUTERWEAR
UPDATE products 
SET images = ARRAY['/images/hero-0.jpg'] 
WHERE slug = 'wool-blend-coat';

UPDATE products 
SET images = ARRAY['/images/new-product-3.png'] 
WHERE slug = 'linen-blazer'; -- Using Grey Suit for Linen Blazer as best fit

-- DRESSES
UPDATE products 
SET images = ARRAY['/images/hero-1.jpg'] 
WHERE slug = 'silk-midi-dress';

UPDATE products 
SET images = ARRAY['/images/hero-2.jpg'] 
WHERE slug = 'cotton-maxi-dress';

UPDATE products 
SET images = ARRAY['/images/hero-2.png'] 
WHERE slug = 'velvet-evening-dress';

UPDATE products 
SET images = ARRAY['/images/hero-3.jpg'] 
WHERE slug = 'pleated-satin-dress';

UPDATE products 
SET images = ARRAY['/images/hero-3.png'] 
WHERE slug = 'jersey-wrap-dress'; -- Using Grey Jumpsuit for Jersey Wrap Dress as stylistic match

UPDATE products 
SET images = ARRAY['/images/new-product-2.png'] 
WHERE slug = 'tiered-ruffle-dress';

UPDATE products 
SET images = ARRAY['/images/product-1.png'] 
WHERE slug = 'embroidered-shift-dress'; -- Using Red Paisley Dress

-- TOPS
UPDATE products 
SET images = ARRAY['/images/hero-4.jpg'] 
WHERE slug = 'cashmere-turtleneck';

UPDATE products 
SET images = ARRAY['/images/hero-5.jpg'] 
WHERE slug = 'linen-button-up';

UPDATE products 
SET images = ARRAY['/images/hero-6.jpg'] 
WHERE slug = 'embroidered-peasant-top';

-- BOTTOMS
UPDATE products 
SET images = ARRAY['/images/hero-7.jpg'] 
WHERE slug = 'wide-leg-trousers';

UPDATE products 
SET images = ARRAY['/images/new-product-1.png'] 
WHERE slug = 'pleated-midi-skirt';

-- ACCESSORIES
UPDATE products 
SET images = ARRAY['/images/product-2.png'] 
WHERE slug = 'leather-tote-bag';

-- Note: 'navy-one-shoulder-gown' (hero-8.jpg) does not have a confirmed match in the seed file 'outerwear' list section for gowns,
-- but implies a formal dress. If 'navy-one-shoulder-gown' existed, it would be updated.
-- 'suede-pumps' (product-3.png) also has no direct match.
