-- Migration: Seed blog_posts table with sample data
-- Author: Lyra Fashion Dev
-- Description: Adds sample blog posts for testing the UI

INSERT INTO blog_posts (title, slug, content, excerpt, featured_image, status, categories, tags, reading_time, published_at, author_id)
VALUES
  (
    'The Art of Sustainable Leather Crafting',
    'art-of-sustainable-leather-crafting',
    '# The Art of Sustainable Leather Crafting

At Lyra Fashion, we believe that true luxury lies in sustainability. Our leather crafting process is a testament to this belief.

## Sourcing with Care

We source our leather from certified ethical tanneries that prioritize environmental stewardship. Every hide is selected not just for its quality, but for its responsible origin.

## The Hand-Stitching Difference

Unlike mass-produced goods, our bags are hand-stitched by master artisans.

*   **Durability**: Hand-stitching creates a stronger bond than machine stitching.
*   **Aesthetics**: The unique character of a hand-stitch adds a touch of bespoke elegance.
*   **Tradition**: We preserve age-old techniques that have been passed down through generations.

![Artisan working](https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800)

## Conclusion

When you choose a Lyra bag, you are choosing a piece of art that respects the planet and the people who made it.',
    'Discover how Lyra Fashion combines traditional leather crafting techniques with modern sustainable practices to create timeless pieces.',
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800',
    'published',
    '["Craftsmanship", "Factory Stories"]'::jsonb,
    '["leather", "sustainability", "handmade"]'::jsonb,
    3,
    NOW() - INTERVAL '2 days',
    (SELECT id FROM auth.users LIMIT 1) -- Assign to first available user (or null if none)
  ),
  (
    '5 Ways to Style Your Tote for Summer',
    '5-ways-to-style-your-tote-summer',
    '# Summer Styling with Your Lyra Tote

Summer is the perfect time to let your accessories shine. Here are 5 ways to style your favorite Lyra Tote.

1.  **The Beach Day Look**: Pair your tote with a flowing maxi dress and sandals.
2.  **Office Chic**: Structured blazer, linen trousers, and your tote make for a powerful combination.
3.  **Weekend Brunch**: Jeans, a white tee, and your tote - effortless and classic.

> "Style is a way to say who you are without having to speak." - Rachel Zoe

Don''t be afraid to experiment with colors and textures this season!',
    'Get inspired with these 5 chic ways to style your Lyra Tote bag for the upcoming summer season. From beach days to office chic.',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=800',
    'published',
    '["Styling Tips"]'::jsonb,
    '["summer", "style", "tote bag"]'::jsonb,
    2,
    NOW() - INTERVAL '5 days',
    (SELECT id FROM auth.users LIMIT 1)
  ),
  (
    'Understanding Leather Grades: A Quality Guide',
    'understanding-leather-grades-quality-guide',
    '# A Guide to Leather Grades

Not all leather is created equal. Understanding the different grades can help you make informed decisions.

### Full Grain Leather
The highest quality leather, using the entire grain of the hide. It develops a beautiful patina over time.

### Top Grain Leather
The second highest quality, where the top layer is sanded to remove imperfections.

### Genuine Leather
Often a marketing term for lower quality split leather.

At Lyra, we exclusively use **Full Grain Leather** for maximum durability and beauty.',
    'Confused about leather grades? Our comprehensive guide explains the difference between Full Grain, Top Grain, and Genuine leather.',
    'https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&q=80&w=800',
    'published',
    '["Quality Guide", "Craftsmanship"]'::jsonb,
    '["leather guide", "education", "quality"]'::jsonb,
    4,
    NOW() - INTERVAL '10 days',
    (SELECT id FROM auth.users LIMIT 1)
  ),
  (
    'Behind the Scenes: Our Factory in Italy',
    'behind-the-scenes-italy-factory',
    '# Visit Our Italian Factory

Take a virtual tour of our facility in Florence, where the magic happens.

We believe in transparency. Our artisans work in a safe, well-lit environment where their skills are valued and rewarded.

*Draft post content...*',
    'Take a virtual tour of our sustainable manufacturing facility in the heart of Florence, Italy.',
    null,
    'draft',
    '["Factory Stories"]'::jsonb,
    '["italy", "transparency", "factory"]'::jsonb,
    2,
    null,
    (SELECT id FROM auth.users LIMIT 1)
  );
