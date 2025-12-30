'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { createShippingAddress, updateShippingAddress } from '@/app/account/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2 } from 'lucide-react'

interface ShippingAddressFormProps {
  editingAddress?: {
    id: string
    name: string
    address_line1: string
    address_line2: string | null
    city: string
    state: string | null
    postal_code: string
    country: string
    phone: string | null
    is_default: boolean
  }
  onCancel?: () => void
  onSuccess?: () => void
}

export default function ShippingAddressForm({
  editingAddress,
  onCancel,
  onSuccess,
}: ShippingAddressFormProps) {
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: editingAddress || {
      name: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
      phone: '',
      is_default: false,
    },
  })

  const onSubmit = (data: unknown) => {
    startTransition(async () => {
      const formData = new FormData()
      Object.keys(data as Record<string, unknown>).forEach((key) => {
        formData.append(key, String((data as Record<string, unknown>)[key]))
      })

      let result: { error: string | null, data: unknown | null }
      if (editingAddress?.id) {
        formData.append('id', editingAddress.id)
        result = await updateShippingAddress(editingAddress.id, formData)
      } else {
        result = await createShippingAddress(formData)
      }

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(editingAddress ? 'Address updated successfully' : 'Address added successfully')
        if (onCancel) onCancel()
        if (onSuccess) onSuccess()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Address Label</Label>
        <p className="text-sm text-gray-600 mb-2">
          E.g., &quot;Home&quot;, &quot;Office&quot;, &quot;Shipping&quot;
        </p>
        <Input
          id="name"
          type="text"
          {...register('name', { required: true, minLength: 1 })}
          placeholder="Home"
          disabled={isPending}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message as string}</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="address_line1">Address Line 1</Label>
          <Input
            id="address_line1"
            type="text"
            {...register('address_line1', { required: true, minLength: 1 })}
            placeholder="123 Main St"
            disabled={isPending}
          />
          {errors.address_line1 && (
            <p className="text-red-500 text-sm mt-1">{errors.address_line1.message as string}</p>
          )}
        </div>

        <div>
          <Label htmlFor="address_line2">Address Line 2</Label>
          <p className="text-sm text-gray-600 mb-2">
            Apartment, suite, unit, etc. (optional)
          </p>
          <Input
            id="address_line2"
            type="text"
            {...register('address_line2')}
            placeholder="Apt 4"
            disabled={isPending}
          />
          {errors.address_line2 && (
            <p className="text-red-500 text-sm mt-1">{errors.address_line2.message as string}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            type="text"
            {...register('city', { required: true, minLength: 1 })}
            placeholder="San Francisco"
            disabled={isPending}
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1">{errors.city.message as string}</p>
          )}
        </div>

        <div>
          <Label htmlFor="state">State/Province</Label>
          <Input
            id="state"
            type="text"
            {...register('state')}
            placeholder="CA"
            disabled={isPending}
          />
          {errors.state && (
            <p className="text-red-500 text-sm mt-1">{errors.state.message as string}</p>
          )}
        </div>

        <div>
          <Label htmlFor="postal_code">Postal Code</Label>
          <Input
            id="postal_code"
            type="text"
            {...register('postal_code', { required: true, minLength: 1 })}
            placeholder="94102"
            disabled={isPending}
          />
          {errors.postal_code && (
            <p className="text-red-500 text-sm mt-1">{errors.postal_code.message as string}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="country">Country</Label>
        <Input
          id="country"
          type="text"
          {...register('country', { required: true })}
          placeholder="United States"
          disabled={isPending}
        />
        {errors.country && (
          <p className="text-red-500 text-sm mt-1">{errors.country.message as string}</p>
        )}
      </div>

      <div>
        <Label htmlFor="phone">Phone (optional)</Label>
        <p className="text-sm text-gray-600 mb-2">
          For delivery inquiries only
        </p>
        <Input
          id="phone"
          type="tel"
          {...register('phone')}
          placeholder="+1 (555) 000-0000"
          disabled={isPending}
        />
        {errors.phone && (
          <p className="text-red-500 text-sm mt-1">{errors.phone.message as string}</p>
        )}
      </div>

      <div className="flex items-center space-x-3">
        <Checkbox
          id="is_default"
          {...register('is_default')}
          disabled={isPending}
        />
        <Label htmlFor="is_default" className="cursor-pointer">
          Set as default address for checkout
        </Label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            editingAddress ? 'Update Address' : 'Add Address'
          )}
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
