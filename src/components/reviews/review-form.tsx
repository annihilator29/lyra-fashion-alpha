'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { submitProductReview } from '@/actions/reviews';

// Local schema for form validation
const formSchema = z.object({
  rating: z.number().min(1, 'Rating is required').max(5, 'Rating must be between 1 and 5'),
  title: z.string().min(5, 'Headline must be at least 5 characters').max(100, 'Headline must be less than 100 characters'),
  content: z.string().min(50, 'Review must be at least 50 characters').max(2000, 'Review must be less than 2000 characters'),
  fitFeedback: z.enum(['true-to-size', 'small', 'large', 'n/a']),
  token: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface ReviewFormProps {
  productId: string;
  productName: string;
  token: string;
  onSuccess?: () => void;
}

export function ReviewForm({ productName, token, onSuccess }: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: 0,
      title: '',
      content: '',
      fitFeedback: 'n/a',
      token,
    },
  });

  const watchedRating = form.watch('rating');

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);

    try {
      const result = await submitProductReview(data);

      if (result.success) {
        toast.success('Review submitted successfully!', {
          description: 'Your review is pending approval and will be visible once approved.',
        });
        form.reset();
        onSuccess?.();
      } else {
        toast.error('Failed to submit review', {
          description: result.error || 'Please try again later.',
        });
      }
    } catch {
      toast.error('An error occurred', {
        description: 'Failed to submit your review. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Product Info */}
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">Writing a review for</p>
          <p className="font-medium">{productName}</p>
        </div>

        {/* Star Rating */}
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Overall Rating *</FormLabel>
              <FormControl>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="p-1 transition-transform hover:scale-110 focus:outline-none"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => field.onChange(star)}
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          star <= (hoverRating || watchedRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-gray-200 text-gray-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </FormControl>
              <FormDescription>
                {watchedRating > 0
                  ? `${watchedRating} star${watchedRating > 1 ? 's' : ''}`
                  : 'Click to rate'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Headline */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Review Headline *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Sum up your experience in a few words"
                  maxLength={100}
                  {...field}
                />
              </FormControl>
              <FormDescription className="flex justify-between">
                <span>Minimum 5 characters</span>
                <span>{field.value.length}/100</span>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Detailed Review */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detailed Review *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about your experience with this product. What did you like? What could be improved?"
                  className="min-h-[150px] resize-none"
                  maxLength={2000}
                  {...field}
                />
              </FormControl>
              <FormDescription className="flex justify-between">
                <span>Minimum 50 characters</span>
                <span>{field.value.length}/2000</span>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Fit Feedback */}
        <FormField
          control={form.control}
          name="fitFeedback"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How does it fit? (Optional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fit feedback" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="true-to-size">True to size</SelectItem>
                  <SelectItem value="small">Runs small</SelectItem>
                  <SelectItem value="large">Runs large</SelectItem>
                  <SelectItem value="n/a">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Help other customers choose the right size
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || watchedRating === 0}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Review'
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Your review will be pending approval before being published
        </p>
      </form>
    </Form>
  );
}
