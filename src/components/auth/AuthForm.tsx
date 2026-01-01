'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { migrateGuestWishlistItems } from '@/app/account/actions';
import { getGuestWishlist, clearGuestWishlist } from '@/lib/wishlist-utils';

const authSchema = z.object({
  email: z.string().email(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .refine(
      (val) => {
        // Must contain at least 2 of the 4 character types
        const hasLower = /[a-z]/.test(val);
        const hasUpper = /[A-Z]/.test(val);
        const hasNumber = /\d/.test(val);
        const hasSpecial = /[^a-zA-Z0-9]/.test(val);
        const categoryCount = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
        return categoryCount >= 2;
      },
      {
        message: 'Password must contain at least 2 of: lowercase letters, uppercase letters, numbers, special characters'
      }
    ),
  name: z.string().optional(),
  rememberMe: z.boolean().optional(),
});

interface AuthFormProps {
  type: 'login' | 'register'
}

export function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const supabase = createClient();

  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      rememberMe: type === 'login',
    },
  });

  // Load "Remember me" preference from localStorage on mount
  React.useEffect(() => {
    if (type === 'login') {
      try {
        const savedPreference = localStorage.getItem('rememberMe');
        if (savedPreference === 'true') {
          form.setValue('email', localStorage.getItem('savedEmail') || '');
          form.setValue('password', localStorage.getItem('savedPassword') || '');
          form.setValue('rememberMe', true);
        }
      } catch (error) {
        console.error('Failed to load saved credentials:', error);
      }
    }
  }, [type, form]);

  async function onSubmit(values: z.infer<typeof authSchema>) {
    setIsLoading(true);

    try {
      if (type === 'register') {
        const { error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              name: values.name,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) {
          // Check for explicit "User already registered" error
          if (error.message.includes("User already registered")) {
            toast.error('User already registered. Please login.');
          } else {
            throw error;
          }
          setIsLoading(false);
          return;
        }

        toast.success('Registration successful! Please check your email.');
        // Auto-login or redirect logic can go here if email confirmation is disabled
        router.push('/login') // Redirect to login for now
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (error) throw error;

        toast.success('Logged in successfully!');

        // Migrate guest wishlist if exists
        const guestWishlist = getGuestWishlist();
        if (guestWishlist && guestWishlist.items.length > 0) {
          try {
            const result = await migrateGuestWishlistItems(guestWishlist.items);

            if (result.error) {
              console.error('Failed to migrate wishlist:', result.error);
            } else if (result.data?.migratedCount && result.data.migratedCount > 0) {
              toast.success(`${result.data.migratedCount} items added to your wishlist`);
              clearGuestWishlist();
            }
          } catch (error) {
            console.error('Wishlist migration error:', error);
          }
        }

        router.push('/account/dashboard');
        router.refresh();

        // Save credentials if "Remember me" is checked
        if (values.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('savedEmail', values.email);
          localStorage.setItem('savedPassword', values.password);
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('savedEmail');
          localStorage.removeItem('savedPassword');
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {type === 'register' && (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="********"
                  showStrength={type === 'register'}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {type === 'login' && (
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-2 space-y-0 pt-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked)}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-normal not-sr-only">
                    Remember me
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Stay logged in on this device
                  </p>
                </div>
              </FormItem>
            )}
          />
        )}
        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading && <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
          {type === 'register' ? 'Create account' : 'Sign in'}
        </Button>
      </form>
    </Form>
  );
}
