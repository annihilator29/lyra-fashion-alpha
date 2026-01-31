/**
 * JSON-LD Structured Data for Reviews
 *
 * Schema.org structured data generation for SEO optimization.
 * Includes Product, AggregateRating, and Review schemas.
 *
 * @module lib/reviews/json-ld
 */

import { Review, ReviewSummary } from './types';

export interface ProductForSchema {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  slug: string;
  category: string;
  price: number;
}

interface AggregateRatingSchema {
  '@type': 'AggregateRating';
  ratingValue: string;
  reviewCount: number;
  bestRating: number;
  worstRating: number;
}

interface ReviewSchema {
  '@type': 'Review';
  reviewRating: {
    '@type': 'Rating';
    ratingValue: number;
    bestRating: number;
    worstRating: number;
  };
  author: {
    '@type': 'Person';
    name: string;
  };
  datePublished: string;
  reviewBody: string;
  name: string;
}

interface ProductWithReviewsSchema {
  '@context': 'https://schema.org';
  '@type': 'Product';
  name: string;
  description: string;
  image: string[];
  sku: string;
  brand: {
    '@type': 'Brand';
    name: string;
  };
  category: string;
  aggregateRating?: AggregateRatingSchema;
  review?: ReviewSchema[];
}

/**
 * Generate schema.org JSON-LD for product with reviews
 *
 * @param product - Product data for schema
 * @param reviews - Array of reviews to include
 * @param stats - Review summary statistics
 * @returns Complete schema.org Product JSON-LD object
 */
export function generateProductReviewSchema(
  product: ProductForSchema,
  reviews: Review[],
  stats: ReviewSummary | null
): ProductWithReviewsSchema {
  const schema: ProductWithReviewsSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `Shop ${product.name} - Factory-direct women's fashion with artisan quality.`,
    image: product.images.length > 0 ? product.images : ['/placeholder-product.jpg'],
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Lyra Fashion',
    },
    category: product.category,
  };

  // Add aggregate rating if reviews exist
  if (stats && stats.total_reviews > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: stats.average_rating.toFixed(1),
      reviewCount: stats.total_reviews,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // Add individual reviews (limit to first 10 for performance)
  if (reviews.length > 0) {
    schema.review = reviews.slice(0, 10).map((review) => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      author: {
        '@type': 'Person',
        name: review.customer?.name || 'Anonymous User',
      },
      datePublished: review.created_at,
      reviewBody: review.content,
      name: review.title,
    }));
  }

  return schema;
}

/**
 * Generate JSON-LD script tag content
 *
 * @param schema - Schema.org JSON-LD object
 * @returns JSON string for script tag
 */
export function generateJsonLdScript(schema: unknown): string {
  return JSON.stringify(schema);
}

/**
 * Generate complete review schema with all components
 *
 * Convenience function that combines product, reviews, and stats into complete schema
 *
 * @param product - Product information
 * @param reviews - List of reviews
 * @param stats - Review summary statistics
 * @returns JSON string ready for script tag injection
 */
export function generateCompleteReviewSchema(
  product: ProductForSchema,
  reviews: Review[],
  stats: ReviewSummary | null
): string {
  const schema = generateProductReviewSchema(product, reviews, stats);
  return generateJsonLdScript(schema);
}
