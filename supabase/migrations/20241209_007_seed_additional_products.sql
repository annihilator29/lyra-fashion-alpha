-- ============================================
-- Lyra Fashion - Additional Product Seed Data
-- Adds 9 more products per category (45 total)
-- ============================================
-- Run this script in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new
-- ============================================

-- First, add the 'featured' column if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- DRESSES (9 products)
INSERT INTO products (name, slug, description, price, category, images, craftsmanship_content, transparency_data, featured)
VALUES 
  ('Silk Midi Dress', 'silk-midi-dress', 'Elegant silk midi dress with flowing silhouette', 245.00, 'dresses',
   ARRAY['/https://pexsipchcidsoqydigbt.supabase.co/storage/v1/object/public/products/hero-1.jpg'],
   '{"story": "Hand-finished in a family-owned atelier in France", "materials": ["Mulberry Silk"], "techniques": ["French Seams"]}',
   '{"origin": "France", "carbonFootprint": "3.2kg CO2", "certifications": ["OEKO-TEX"]}', true),
  
  ('Linen Wrap Dress', 'linen-wrap-dress', 'Breathable linen wrap dress for warm days', 175.00, 'dresses',
   ARRAY['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800'],
   '{"story": "Woven from European flax in Belgium", "materials": ["Belgian Linen"], "techniques": ["Traditional Weaving"]}',
   '{"origin": "Belgium", "carbonFootprint": "2.1kg CO2", "certifications": ["European Flax"]}', false),
  
  ('Cotton Maxi Dress', 'cotton-maxi-dress', 'Flowy maxi dress in organic cotton', 155.00, 'dresses',
   ARRAY['/https://pexsipchcidsoqydigbt.supabase.co/storage/v1/object/public/products/hero-2.jpg'],
   '{"story": "Crafted by women artisans in India", "materials": ["Organic Cotton"], "techniques": ["Block Printing"]}',
   '{"origin": "India", "carbonFootprint": "2.8kg CO2", "certifications": ["GOTS", "Fair Trade"]}', true),

  ('Velvet Evening Dress', 'velvet-evening-dress', 'Luxurious velvet dress for special occasions', 295.00, 'dresses',
   ARRAY['/https://pexsipchcidsoqydigbt.supabase.co/storage/v1/object/public/products/hero-2.png'],
   '{"story": "Handcrafted in Milan with vintage techniques", "materials": ["Silk Velvet"], "techniques": ["Hand Draping"]}',
   '{"origin": "Italy", "carbonFootprint": "4.5kg CO2", "certifications": ["Made in Italy"]}', false),

  ('Embroidered Shift Dress', 'embroidered-shift-dress', 'Classic shift dress with delicate embroidery', 198.00, 'dresses',
   ARRAY['/https://pexsipchcidsoqydigbt.supabase.co/storage/v1/object/public/products/product-1.png'],
   '{"story": "Each dress features 20 hours of hand embroidery", "materials": ["Cotton Voile"], "techniques": ["Hand Embroidery"]}',
   '{"origin": "Vietnam", "carbonFootprint": "2.0kg CO2", "certifications": ["SA8000"]}', false),

  ('Jersey Wrap Dress', 'jersey-wrap-dress', 'Comfortable jersey dress with flattering wrap style', 135.00, 'dresses',
   ARRAY['/https://pexsipchcidsoqydigbt.supabase.co/storage/v1/object/public/products/hero-3.png'],
   '{"story": "Made in our solar-powered facility", "materials": ["Recycled Jersey"], "techniques": ["Zero-Waste Cutting"]}',
   '{"origin": "Portugal", "carbonFootprint": "1.5kg CO2", "certifications": ["GRS", "SA8000"]}', false),

  ('Pleated Satin Dress', 'pleated-satin-dress', 'Shimmering satin dress with permanent pleats', 265.00, 'dresses',
   ARRAY['/https://pexsipchcidsoqydigbt.supabase.co/storage/v1/object/public/products/hero-3.jpg'],
   '{"story": "Precision pleating by master craftsmen", "materials": ["Recycled Satin"], "techniques": ["Heat-Set Pleating"]}',
   '{"origin": "Japan", "carbonFootprint": "3.0kg CO2", "certifications": ["JIS"]}', true),

  ('Tiered Ruffle Dress', 'tiered-ruffle-dress', 'Romantic tiered dress with flowing ruffles', 185.00, 'dresses',
   ARRAY['/https://pexsipchcidsoqydigbt.supabase.co/storage/v1/object/public/products/new-product-2.png'],
   '{"story": "Designed for movement and comfort", "materials": ["Organic Cotton Voile"], "techniques": ["Bias Cutting"]}',
   '{"origin": "India", "carbonFootprint": "2.2kg CO2", "certifications": ["GOTS"]}', false),

  ('Knit Bodycon Dress', 'knit-bodycon-dress', 'Sleek seamless knit dress', 145.00, 'dresses',
   ARRAY['https://images.unsplash.com/photo-1571908599407-cdb918ed83bf?w=800'],
   '{"story": "Created using 3D knitting technology", "materials": ["Recycled Nylon"], "techniques": ["3D Knitting"]}',
   '{"origin": "Denmark", "carbonFootprint": "1.8kg CO2", "certifications": ["Nordic Swan"]}', false),

-- TOPS (9 products)
  ('Cashmere Turtleneck', 'cashmere-turtleneck', 'Luxuriously soft cashmere turtleneck', 285.00, 'tops',
   ARRAY['/https://pexsipchcidsoqydigbt.supabase.co/storage/v1/object/public/products/hero-4.jpg'],
   '{"story": "Made from ethically sourced Mongolian cashmere", "materials": ["Grade A Cashmere"], "techniques": ["Hand Finishing"]}',
   '{"origin": "Mongolia", "carbonFootprint": "5.2kg CO2", "certifications": ["Good Cashmere Standard"]}', true),

  ('Silk Camisole', 'silk-camisole', 'Elegant silk camisole with lace trim', 125.00, 'tops',
   ARRAY['https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=800'],
   '{"story": "French lace applied by hand", "materials": ["Silk Charmeuse", "French Lace"], "techniques": ["Hand Stitching"]}',
   '{"origin": "France", "carbonFootprint": "1.5kg CO2", "certifications": ["Origine France Garantie"]}', false),

  ('Organic Cotton Tee', 'organic-cotton-tee', 'Classic crew neck in organic cotton', 65.00, 'tops',
   ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'],
   '{"story": "Simple, sustainable, and made to last", "materials": ["Organic Cotton"], "techniques": ["Circular Knitting"]}',
   '{"origin": "Turkey", "carbonFootprint": "1.2kg CO2", "certifications": ["GOTS", "OEKO-TEX"]}', false),

  ('Linen Button-Up', 'linen-button-up', 'Relaxed linen shirt with mother of pearl buttons', 145.00, 'tops',
   ARRAY['/https://pexsipchcidsoqydigbt.supabase.co/storage/v1/object/public/products/hero-5.jpg'],
   '{"story": "Woven from European flax", "materials": ["European Linen"], "techniques": ["Garment Washed"]}',
   '{"origin": "Lithuania", "carbonFootprint": "1.8kg CO2", "certifications": ["European Flax", "OEKO-TEX"]}', true),

  ('Wool Blend Sweater', 'wool-blend-sweater', 'Cozy sweater in merino wool blend', 165.00, 'tops',
   ARRAY['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800'],
   '{"story": "Knitted in small batches in Scotland", "materials": ["Merino Wool", "Cashmere"], "techniques": ["Intarsia Knitting"]}',
   '{"origin": "Scotland", "carbonFootprint": "3.8kg CO2", "certifications": ["ZQ Merino"]}', false),

  ('Cropped Cardigan', 'cropped-cardigan', 'Versatile cropped cardigan with pearl buttons', 135.00, 'tops',
   ARRAY['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800'],
   '{"story": "Hand-knitted by skilled artisans", "materials": ["Organic Cotton Yarn"], "techniques": ["Hand Knitting"]}',
   '{"origin": "Peru", "carbonFootprint": "2.0kg CO2", "certifications": ["Fair Trade"]}', false),

  ('Satin Blouse', 'satin-blouse', 'Elegant satin blouse with bow detail', 155.00, 'tops',
   ARRAY['https://images.unsplash.com/photo-1608234808654-2a8875faa7fd?w=800'],
   '{"story": "Draped and sewn by master tailors", "materials": ["Recycled Polyester Satin"], "techniques": ["French Seams"]}',
   '{"origin": "Portugal", "carbonFootprint": "2.2kg CO2", "certifications": ["GRS"]}', false),

  ('Ribbed Tank Top', 'ribbed-tank-top', 'Essential ribbed tank in organic cotton', 55.00, 'tops',
   ARRAY['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800'],
   '{"story": "Made in our zero-waste facility", "materials": ["Organic Cotton"], "techniques": ["Seamless Knitting"]}',
   '{"origin": "Portugal", "carbonFootprint": "0.8kg CO2", "certifications": ["GOTS"]}', false),

  ('Embroidered Peasant Top', 'embroidered-peasant-top', 'Bohemian top with colorful embroidery', 115.00, 'tops',
   ARRAY['/https://pexsipchcidsoqydigbt.supabase.co/storage/v1/object/public/products/hero-6.jpg'],
   '{"story": "Traditional patterns passed down through generations", "materials": ["Organic Cotton"], "techniques": ["Hand Embroidery"]}',
   '{"origin": "Mexico", "carbonFootprint": "1.5kg CO2", "certifications": ["Fair Trade"]}', true),

-- BOTTOMS (9 products)
  ('Wide Leg Trousers', 'wide-leg-trousers', 'Flowing wide leg trousers in sustainable viscose', 145.00, 'bottoms',
   ARRAY['/https://pexsipchcidsoqydigbt.supabase.co/storage/v1/object/public/products/hero-7.jpg'],
   '{"story": "Designed for comfort and elegance", "materials": ["TENCEL Lyocell"], "techniques": ["Precision Cutting"]}',
   '{"origin": "Austria", "carbonFootprint": "2.5kg CO2", "certifications": ["FSC", "OEKO-TEX"]}', true),

  ('Linen Palazzo Pants', 'linen-palazzo-pants', 'Breezy palazzo pants in pure linen', 135.00, 'bottoms',
   ARRAY['https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=800'],
   '{"story": "Woven from Irish linen", "materials": ["Irish Linen"], "techniques": ["Pre-Washed"]}',
   '{"origin": "Ireland", "carbonFootprint": "2.0kg CO2", "certifications": ["Irish Linen Guild"]}', false),

  ('High-Waist Culottes', 'high-waist-culottes', 'Chic culottes with flattering high waist', 125.00, 'bottoms',
   ARRAY['https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800'],
   '{"story": "Made from deadstock fabric", "materials": ["Deadstock Wool Blend"], "techniques": ["Zero-Waste Pattern"]}',
   '{"origin": "UK", "carbonFootprint": "1.2kg CO2", "certifications": ["Upcycled"]}', false),

  ('Organic Cotton Joggers', 'organic-cotton-joggers', 'Comfortable joggers for everyday wear', 95.00, 'bottoms',
   ARRAY['https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800'],
   '{"story": "Lounge-ready and street-worthy", "materials": ["Organic Cotton Terry"], "techniques": ["Brushed Interior"]}',
   '{"origin": "Portugal", "carbonFootprint": "1.8kg CO2", "certifications": ["GOTS"]}', false),

  ('Pleated Midi Skirt', 'pleated-midi-skirt', 'Elegant pleated skirt in flowing fabric', 145.00, 'bottoms',
   ARRAY['/https://pexsipchcidsoqydigbt.supabase.co/storage/v1/object/public/products/new-product-1.png'],
   '{"story": "Each pleat set by skilled technicians", "materials": ["Recycled Polyester"], "techniques": ["Heat Pleating"]}',
   '{"origin": "Japan", "carbonFootprint": "2.2kg CO2", "certifications": ["GRS"]}', true),

  ('Tailored Shorts', 'tailored-shorts', 'Sophisticated tailored shorts for summer', 110.00, 'bottoms',
   ARRAY['https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800'],
   '{"story": "Made with precision tailoring", "materials": ["Organic Cotton Twill"], "techniques": ["Tailored Fit"]}',
   '{"origin": "Portugal", "carbonFootprint": "1.5kg CO2", "certifications": ["GOTS"]}', false),

  ('Wrap Midi Skirt', 'wrap-midi-skirt', 'Versatile wrap skirt with tie waist', 125.00, 'bottoms',
   ARRAY['https://images.unsplash.com/photo-1577900232427-18219b9166a0?w=800'],
   '{"story": "Adjustable fit for all body types", "materials": ["Linen Blend"], "techniques": ["Bias Cut"]}',
   '{"origin": "India", "carbonFootprint": "1.6kg CO2", "certifications": ["Fair Trade"]}', false),

  ('Cargo Pants', 'cargo-pants', 'Utility-inspired cargo pants in organic cotton', 155.00, 'bottoms',
   ARRAY['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800'],
   '{"story": "Functional pockets meet sustainable style", "materials": ["Organic Cotton Canvas"], "techniques": ["Garment Dyed"]}',
   '{"origin": "Turkey", "carbonFootprint": "2.8kg CO2", "certifications": ["GOTS"]}', false),

  ('A-Line Denim Skirt', 'a-line-denim-skirt', 'Classic denim skirt in recycled denim', 115.00, 'bottoms',
   ARRAY['https://images.unsplash.com/photo-1582142306909-195724d33ffc?w=800'],
   '{"story": "Made from post-consumer recycled jeans", "materials": ["Recycled Denim"], "techniques": ["Laser Finishing"]}',
   '{"origin": "Spain", "carbonFootprint": "2.0kg CO2", "certifications": ["GRS"]}', false),

-- OUTERWEAR (9 products)
  ('Wool Blend Coat', 'wool-blend-coat', 'Classic tailored coat in Italian wool', 395.00, 'outerwear',
   ARRAY['/https://pexsipchcidsoqydigbt.supabase.co/storage/v1/object/public/products/hero-0.jpg'],
   '{"story": "Crafted in a century-old Italian mill", "materials": ["Italian Wool", "Cashmere"], "techniques": ["Hand Finished"]}',
   '{"origin": "Italy", "carbonFootprint": "8.5kg CO2", "certifications": ["Made in Italy"]}', true),

  ('Quilted Jacket', 'quilted-jacket', 'Lightweight quilted jacket with recycled filling', 225.00, 'outerwear',
   ARRAY['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'],
   '{"story": "Filled with recycled PET bottles", "materials": ["Recycled Nylon", "Recycled Fill"], "techniques": ["Quilting"]}',
   '{"origin": "Sweden", "carbonFootprint": "4.2kg CO2", "certifications": ["GRS", "Bluesign"]}', false),

  ('Trench Coat', 'trench-coat', 'Timeless trench coat in organic cotton', 285.00, 'outerwear',
   ARRAY['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800'],
   '{"story": "Inspired by classic British design", "materials": ["Organic Cotton Gabardine"], "techniques": ["Double Stitching"]}',
   '{"origin": "UK", "carbonFootprint": "5.5kg CO2", "certifications": ["GOTS", "OEKO-TEX"]}', true),

  ('Denim Jacket', 'denim-jacket', 'Vintage-inspired denim jacket', 175.00, 'outerwear',
   ARRAY['https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800'],
   '{"story": "Each jacket gets unique character", "materials": ["Organic Denim"], "techniques": ["Stone Wash"]}',
   '{"origin": "Japan", "carbonFootprint": "4.8kg CO2", "certifications": ["GOTS"]}', false),

  ('Linen Blazer', 'linen-blazer', 'Relaxed linen blazer for warm weather', 195.00, 'outerwear',
   ARRAY['/https://pexsipchcidsoqydigbt.supabase.co/storage/v1/object/public/products/new-product-3.png'],
   '{"story": "Perfect for summer evenings", "materials": ["Belgian Linen"], "techniques": ["Unconstructed Tailoring"]}',
   '{"origin": "Belgium", "carbonFootprint": "2.8kg CO2", "certifications": ["European Flax"]}', false),

  ('Puffer Vest', 'puffer-vest', 'Versatile puffer vest with down alternative', 165.00, 'outerwear',
   ARRAY['https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800'],
   '{"story": "Warm without the weight", "materials": ["Recycled Nylon", "PrimaLoft"], "techniques": ["Baffle Construction"]}',
   '{"origin": "Germany", "carbonFootprint": "3.5kg CO2", "certifications": ["Bluesign"]}', false),

  ('Suede Moto Jacket', 'suede-moto-jacket', 'Classic moto jacket in sustainable suede', 345.00, 'outerwear',
   ARRAY['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'],
   '{"story": "Made from chrome-free tanned leather", "materials": ["Sustainable Suede"], "techniques": ["Traditional Tanning"]}',
   '{"origin": "Spain", "carbonFootprint": "12.0kg CO2", "certifications": ["Leather Working Group"]}', false),

  ('Rain Jacket', 'rain-jacket', 'Stylish waterproof jacket in recycled materials', 195.00, 'outerwear',
   ARRAY['https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800'],
   '{"story": "Water-resistant without harmful chemicals", "materials": ["Recycled Polyester"], "techniques": ["PFC-Free Coating"]}',
   '{"origin": "Finland", "carbonFootprint": "3.2kg CO2", "certifications": ["GRS", "Bluesign"]}', false),

  ('Knit Cardigan Coat', 'knit-cardigan-coat', 'Cozy long cardigan in alpaca blend', 275.00, 'outerwear',
   ARRAY['https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800'],
   '{"story": "Hand-knitted by Peruvian artisans", "materials": ["Baby Alpaca", "Wool"], "techniques": ["Hand Knitting"]}',
   '{"origin": "Peru", "carbonFootprint": "4.0kg CO2", "certifications": ["Fair Trade"]}', true),

-- ACCESSORIES (9 products)
  ('Leather Tote Bag', 'leather-tote-bag', 'Spacious tote in vegetable-tanned leather', 245.00, 'accessories',
   ARRAY['/https://pexsipchcidsoqydigbt.supabase.co/storage/v1/object/public/products/product-2.png'],
   '{"story": "Tanned using traditional Italian methods", "materials": ["Vegetable-Tanned Leather"], "techniques": ["Hand Stitched"]}',
   '{"origin": "Italy", "carbonFootprint": "6.5kg CO2", "certifications": ["Leather Working Group"]}', true),

  ('Cashmere Beanie', 'cashmere-beanie', 'Soft cashmere beanie for cold days', 85.00, 'accessories',
   ARRAY['https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800'],
   '{"story": "Made from the finest Mongolian cashmere", "materials": ["Grade A Cashmere"], "techniques": ["Seamless Knitting"]}',
   '{"origin": "Mongolia", "carbonFootprint": "1.2kg CO2", "certifications": ["Good Cashmere Standard"]}', false),

  ('Woven Belt', 'woven-belt', 'Handwoven belt with brass buckle', 65.00, 'accessories',
   ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'],
   '{"story": "Each belt is unique", "materials": ["Organic Cotton", "Recycled Brass"], "techniques": ["Hand Weaving"]}',
   '{"origin": "Guatemala", "carbonFootprint": "0.5kg CO2", "certifications": ["Fair Trade"]}', false),

  ('Linen Bucket Hat', 'linen-bucket-hat', 'Sun-protection bucket hat in linen', 55.00, 'accessories',
   ARRAY['https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800'],
   '{"story": "Perfect for sunny adventures", "materials": ["European Linen"], "techniques": ["Structured Top"]}',
   '{"origin": "Portugal", "carbonFootprint": "0.8kg CO2", "certifications": ["European Flax"]}', false),

  ('Silk Eye Mask', 'silk-eye-mask', 'Luxurious silk eye mask for restful sleep', 45.00, 'accessories',
   ARRAY['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800'],
   '{"story": "Self-care meets sustainability", "materials": ["Mulberry Silk"], "techniques": ["Hand Finished"]}',
   '{"origin": "China", "carbonFootprint": "0.3kg CO2", "certifications": ["OEKO-TEX"]}', false),

  ('Canvas Weekender', 'canvas-weekender', 'Durable weekender bag in organic canvas', 165.00, 'accessories',
   ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'],
   '{"story": "Built for adventures near and far", "materials": ["Organic Canvas", "Leather Trim"], "techniques": ["Reinforced Construction"]}',
   '{"origin": "USA", "carbonFootprint": "3.5kg CO2", "certifications": ["GOTS"]}', true),

  ('Pearl Drop Earrings', 'pearl-drop-earrings', 'Elegant freshwater pearl earrings', 75.00, 'accessories',
   ARRAY['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800'],
   '{"story": "Sustainably sourced freshwater pearls", "materials": ["Freshwater Pearls", "Recycled Gold"], "techniques": ["Hand Set"]}',
   '{"origin": "USA", "carbonFootprint": "0.2kg CO2", "certifications": ["Responsibly Sourced"]}', false),

  ('Wool Fedora', 'wool-fedora', 'Classic fedora in Australian wool', 95.00, 'accessories',
   ARRAY['https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800'],
   '{"story": "Shaped by hand in our workshop", "materials": ["Australian Wool Felt"], "techniques": ["Steam Forming"]}',
   '{"origin": "Australia", "carbonFootprint": "1.5kg CO2", "certifications": ["Woolmark"]}', false),

  ('Leather Card Holder', 'leather-card-holder', 'Slim card holder in recycled leather', 55.00, 'accessories',
   ARRAY['https://images.unsplash.com/photo-1627123424574-724758594e93?w=800'],
   '{"story": "Made from leather offcuts", "materials": ["Recycled Leather"], "techniques": ["Edge Painted"]}',
   '{"origin": "Portugal", "carbonFootprint": "0.4kg CO2", "certifications": ["Upcycled"]}', false);


-- Update featured status for existing products
UPDATE products SET featured = true WHERE slug IN ('organic-cotton-dress', 'linen-summer-blouse');

-- Add inventory for new products
INSERT INTO inventory (product_id, quantity, reserved, production_status)
SELECT id, 
  CASE 
    WHEN featured = true THEN 30 
    ELSE FLOOR(15 + RANDOM() * 20)::INT 
  END, 
  0, 
  'ready' 
FROM products 
WHERE id NOT IN (SELECT product_id FROM inventory);

-- ============================================
-- SEED DATA COMPLETE
-- ============================================
-- Verify by running: SELECT category, COUNT(*) FROM products GROUP BY category;
-- Expected: 10 products per category (1 original + 9 new)
