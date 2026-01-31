/**
 * Review Calculation Utilities
 * 
 * Pure functions for calculating review statistics.
 * 
 * @module lib/reviews/calculations
 */

/**
 * Calculate the average rating from an array of ratings
 * @param ratings - Array of rating numbers (1-5)
 * @returns The average rating, or 0 if empty array
 */
export function calculateAverageRating(ratings: number[]): number {
  if (ratings.length === 0) {
    return 0;
  }
  
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return sum / ratings.length;
}

/**
 * Calculate the distribution of ratings (count per star)
 * @param ratings - Array of rating numbers (1-5)
 * @returns Record with count for each star rating (1-5)
 */
export function calculateRatingDistribution(ratings: number[]): Record<number, number> {
  const distribution: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  
  for (const rating of ratings) {
    if (rating >= 1 && rating <= 5) {
      distribution[rating]++;
    }
  }
  
  return distribution;
}
