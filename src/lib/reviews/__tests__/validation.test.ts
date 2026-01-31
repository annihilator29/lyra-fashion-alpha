import { reviewSubmissionSchema } from '../validation';

describe('reviewSubmissionSchema', () => {
  const validSubmission = {
    rating: 4,
    title: 'Great product quality',
    content: 'This product exceeded my expectations. The quality is outstanding and it fits perfectly. I would highly recommend this to anyone looking for something similar.',
    fitFeedback: 'true-to-size',
    token: 'valid-token-12345',
  };

  describe('rating validation', () => {
    it('should accept ratings between 1 and 5', () => {
      for (let rating = 1; rating <= 5; rating++) {
        const result = reviewSubmissionSchema.safeParse({
          ...validSubmission,
          rating,
        });
        expect(result.success).toBe(true);
      }
    });

    it('should reject rating below 1', () => {
      const result = reviewSubmissionSchema.safeParse({
        ...validSubmission,
        rating: 0,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Rating is required');
      }
    });

    it('should reject rating above 5', () => {
      const result = reviewSubmissionSchema.safeParse({
        ...validSubmission,
        rating: 6,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Rating must be between 1 and 5');
      }
    });

    it('should reject non-integer ratings', () => {
      const result = reviewSubmissionSchema.safeParse({
        ...validSubmission,
        rating: 3.5,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('title validation', () => {
    it('should accept titles with 5-100 characters', () => {
      const result = reviewSubmissionSchema.safeParse({
        ...validSubmission,
        title: 'Great product quality',
      });
      expect(result.success).toBe(true);
    });

    it('should reject titles shorter than 5 characters', () => {
      const result = reviewSubmissionSchema.safeParse({
        ...validSubmission,
        title: 'Good',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Headline must be at least 5 characters');
      }
    });

    it('should reject titles longer than 100 characters', () => {
      const longTitle = 'a'.repeat(101);
      const result = reviewSubmissionSchema.safeParse({
        ...validSubmission,
        title: longTitle,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Headline must be less than 100 characters');
      }
    });

    it('should accept exactly 5 characters', () => {
      const result = reviewSubmissionSchema.safeParse({
        ...validSubmission,
        title: 'Great',
      });
      expect(result.success).toBe(true);
    });

    it('should accept exactly 100 characters', () => {
      const result = reviewSubmissionSchema.safeParse({
        ...validSubmission,
        title: 'a'.repeat(100),
      });
      expect(result.success).toBe(true);
    });
  });

  describe('content validation', () => {
    it('should accept content with 50-2000 characters', () => {
      const result = reviewSubmissionSchema.safeParse(validSubmission);
      expect(result.success).toBe(true);
    });

    it('should reject content shorter than 50 characters', () => {
      const result = reviewSubmissionSchema.safeParse({
        ...validSubmission,
        content: 'Too short.',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Review must be at least 50 characters');
      }
    });

    it('should reject content longer than 2000 characters', () => {
      const longContent = 'a'.repeat(2001);
      const result = reviewSubmissionSchema.safeParse({
        ...validSubmission,
        content: longContent,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Review must be less than 2000 characters');
      }
    });

    it('should accept exactly 50 characters', () => {
      const content = 'This is exactly fifty characters long for testing.';
      expect(content.length).toBe(50);
      const result = reviewSubmissionSchema.safeParse({
        ...validSubmission,
        content,
      });
      expect(result.success).toBe(true);
    });

    it('should accept exactly 2000 characters', () => {
      const result = reviewSubmissionSchema.safeParse({
        ...validSubmission,
        content: 'a'.repeat(2000),
      });
      expect(result.success).toBe(true);
    });
  });

  describe('fitFeedback validation', () => {
    it('should accept valid fit feedback values', () => {
      const validValues = ['true-to-size', 'small', 'large', 'n/a'];
      for (const value of validValues) {
        const result = reviewSubmissionSchema.safeParse({
          ...validSubmission,
          fitFeedback: value,
        });
        expect(result.success).toBe(true);
      }
    });

    it('should default to "n/a" when not provided', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { fitFeedback, ...submissionWithoutFit } = validSubmission;
      const result = reviewSubmissionSchema.safeParse(submissionWithoutFit);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fitFeedback).toBe('n/a');
      }
    });

    it('should reject invalid fit feedback values', () => {
      const result = reviewSubmissionSchema.safeParse({
        ...validSubmission,
        fitFeedback: 'invalid-value',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('token validation', () => {
    it('should require a token', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { token, ...submissionWithoutToken } = validSubmission;
      const result = reviewSubmissionSchema.safeParse(submissionWithoutToken);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Review token is required');
      }
    });

    it('should reject empty token', () => {
      const result = reviewSubmissionSchema.safeParse({
        ...validSubmission,
        token: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Review token is required');
      }
    });

    it('should accept valid token string', () => {
      const result = reviewSubmissionSchema.safeParse(validSubmission);
      expect(result.success).toBe(true);
    });
  });
});
