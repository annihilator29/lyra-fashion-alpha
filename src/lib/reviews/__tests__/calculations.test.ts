import { calculateAverageRating, calculateRatingDistribution } from '../calculations';

describe('calculateAverageRating', () => {
  it('should calculate average of [1, 2, 3, 4, 5] as 3.0', () => {
    const ratings = [1, 2, 3, 4, 5];
    const average = calculateAverageRating(ratings);
    expect(average).toBe(3);
  });

  it('should return 0 for empty array', () => {
    const average = calculateAverageRating([]);
    expect(average).toBe(0);
  });

  it('should return the rating for single element array', () => {
    const average = calculateAverageRating([5]);
    expect(average).toBe(5);
  });

  it('should calculate correct average for all same ratings', () => {
    const average = calculateAverageRating([4, 4, 4, 4]);
    expect(average).toBe(4);
  });

  it('should handle decimal averages', () => {
    const ratings = [4, 5, 5];
    const average = calculateAverageRating(ratings);
    expect(average).toBeCloseTo(4.667, 3);
  });

  it('should handle large arrays', () => {
    const ratings = Array(100).fill(5);
    const average = calculateAverageRating(ratings);
    expect(average).toBe(5);
  });
});

describe('calculateRatingDistribution', () => {
  it('should return zero counts for empty array', () => {
    const distribution = calculateRatingDistribution([]);
    expect(distribution).toEqual({
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    });
  });

  it('should count single rating correctly', () => {
    const distribution = calculateRatingDistribution([5]);
    expect(distribution).toEqual({
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 1,
    });
  });

  it('should count multiple ratings correctly', () => {
    const ratings = [5, 5, 4, 3, 3, 3, 2, 1];
    const distribution = calculateRatingDistribution(ratings);
    expect(distribution).toEqual({
      1: 1,
      2: 1,
      3: 3,
      4: 1,
      5: 2,
    });
  });

  it('should handle all same ratings', () => {
    const distribution = calculateRatingDistribution([4, 4, 4, 4, 4]);
    expect(distribution).toEqual({
      1: 0,
      2: 0,
      3: 0,
      4: 5,
      5: 0,
    });
  });

  it('should handle ratings out of range gracefully', () => {
    const ratings = [0, 1, 2, 6, 5];
    const distribution = calculateRatingDistribution(ratings);
    expect(distribution).toEqual({
      1: 1,
      2: 1,
      3: 0,
      4: 0,
      5: 1,
    });
  });

  it('should handle large arrays', () => {
    const ratings = [
      ...Array(50).fill(5),
      ...Array(30).fill(4),
      ...Array(15).fill(3),
      ...Array(4).fill(2),
      ...Array(1).fill(1),
    ];
    const distribution = calculateRatingDistribution(ratings);
    expect(distribution).toEqual({
      1: 1,
      2: 4,
      3: 15,
      4: 30,
      5: 50,
    });
  });
});
