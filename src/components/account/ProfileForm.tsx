'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { updateProfile } from '@/app/account/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import type { Customer } from '@/types/database.types'

interface ProfileFormProps {
  customer: Customer
}

export default function ProfileForm({ customer }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: customer.name || '',
      email: customer.email || '',
      phone_number: customer.phone_number || '',
    },
  })

  const onSubmit = (data: {
    name: string
    email: string
    phone_number: string
  }) => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('email', data.email)
      formData.append('phone_number', data.phone_number)

      const result = await updateProfile(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Profile updated successfully')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          {...register('name', { required: true })}
          placeholder="Your full name"
          disabled={isPending}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message as string}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email', { required: true })}
          disabled={true} // Email changes require verification
          className="bg-gray-50"
        />
        <p className="text-gray-500 text-sm">
          To change your email, please contact customer support
        </p>
      </div>

      <div>
        <Label htmlFor="phone_number">Phone Number</Label>
        <Input
          id="phone_number"
          type="tel"
          {...register('phone_number')}
          placeholder="+1 (555) 000-0000"
          disabled={isPending}
        />
        {errors.phone_number && (
          <p className="text-red-500 text-sm mt-1">{errors.phone_number.message as string}</p>
        )}
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Changes'
        )}
      </Button>
    </form>
  )
}
