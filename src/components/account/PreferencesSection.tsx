'use client'

import { useTransition } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { updatePreferences } from '@/app/account/actions'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import type { Customer } from '@/types/database.types'

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const

const CATEGORIES = ['dresses', 'tops', 'bottoms', 'outerwear', 'accessories'] as const

interface PreferencesSectionProps {
  customer: Customer
}

export default function PreferencesSection({ customer }: PreferencesSectionProps) {
  const [isPending, startTransition] = useTransition()

  const preferences = (customer.preferences as Record<string, unknown>) || {}
  const emailPrefs = (preferences.email as Record<string, unknown>) || {}
  const stylePrefs = (preferences.style as Record<string, unknown>) || {}

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email_marketing: (emailPrefs.marketing as boolean) ?? false,
      order_updates: (emailPrefs.order_updates as boolean) ?? true,
      new_products: (emailPrefs.new_products as boolean) ?? false,
      favorite_categories: (stylePrefs.favorite_categories as string[]) || [],
      size_profile: (stylePrefs.size_profile as string) || undefined,
    },
  })

  const onSubmit = (data: unknown) => {
    const formDataData = data as Record<string, unknown>
    startTransition(async () => {
      const formData = new FormData()
      formData.append('email_marketing', String(formDataData.email_marketing))
      formData.append('order_updates', String(formDataData.order_updates))
      formData.append('new_products', String(formDataData.new_products))
      formData.append('favorite_categories', JSON.stringify(formDataData.favorite_categories))
      const sizeProfile = formDataData.size_profile === 'none' ? '' : (formDataData.size_profile || '')
      formData.append('size_profile', String(sizeProfile))

      const result = await updatePreferences(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Preferences updated successfully')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Email Preferences</h2>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Controller
            name="order_updates"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="order_updates"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isPending}
              />
            )}
          />
          <Label htmlFor="order_updates" className="cursor-pointer">
            Order updates (confirmations, shipping, delivery)
          </Label>
        </div>

        <div className="flex items-center space-x-3">
          <Controller
            name="email_marketing"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="email_marketing"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isPending}
              />
            )}
          />
          <Label htmlFor="email_marketing" className="cursor-pointer">
            Marketing newsletter (promotions, sales, events)
          </Label>
        </div>

        <div className="flex items-center space-x-3">
          <Controller
            name="new_products"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="new_products"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isPending}
              />
            )}
          />
          <Label htmlFor="new_products" className="cursor-pointer">
            New arrivals (based on your favorite categories)
          </Label>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4 mt-8">Style Preferences</h2>
      <div className="space-y-4">
        <div>
          <Label className="block mb-2">Favorite Categories</Label>
          <p className="text-sm text-gray-600 mb-3">
            Select clothing categories you&apos;re most interested in
          </p>
          <div className="grid grid-cols-2 gap-4">
          <Controller
            name="favorite_categories"
            control={control}
            render={({ field }) => (
              <>
                {CATEGORIES.map((category) => {
                  const isChecked = field.value?.includes(category)
                  return (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${category}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const updated = checked
                            ? [...(field.value || []), category]
                            : (field.value || []).filter((c: string) => c !== category)
                          field.onChange(updated)
                        }}
                        disabled={isPending}
                      />
                      <Label htmlFor={`cat-${category}`} className="cursor-pointer capitalize">
                        {category}
                      </Label>
                    </div>
                  )
                })}
              </>
            )}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="size_profile">Size Profile</Label>
        <p className="text-sm text-gray-600 mb-2">
          Your preferred size for recommendations
        </p>
        <Controller
          name="size_profile"
          control={control}
          render={({ field }) => (
            <Select
              disabled={isPending}
              onValueChange={field.onChange}
              value={field.value || undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No preference</SelectItem>
                {SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.favorite_categories && (
          <p className="text-red-500 text-sm mt-1">{errors.favorite_categories.message as string}</p>
        )}
      </div>
      </div>

      <Button type="submit" disabled={isPending} className="w-full md:w-auto">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Preferences'
        )}
      </Button>
    </form>
  )
}
