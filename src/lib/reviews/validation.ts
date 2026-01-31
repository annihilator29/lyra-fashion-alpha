import { z } from 'zod';

export const reviewSubmissionSchema = z.object({
  rating: z
    .number()
    .min(1, 'Rating is required')
    .max(5, 'Rating must be between 1 and 5'),
  title: z
    .string()
    .min(5, 'Headline must be at least 5 characters')
    .max(100, 'Headline must be less than 100 characters'),
  content: z
    .string()
    .min(50, 'Review must be at least 50 characters')
    .max(2000, 'Review must be less than 2000 characters'),
  fitFeedback: z
    .enum(['true-to-size', 'small', 'large', 'n/a'])
    .default('n/a'),
  token: z.string().min(1, 'Review token is required'),
});

export type ReviewSubmissionData = z.infer<typeof reviewSubmissionSchema>;

export interface ReviewSubmissionResponse {
  success: boolean;
  message: string;
  reviewId?: string;
  error?: string;
}
