'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { changePassword } from '@/app/account/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

interface PasswordChangeFormProps {
  email: string
}

export default function PasswordChangeForm({ }: PasswordChangeFormProps) {
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  })

  const newPassword = watch('new_password')

  const onSubmit = (data: {
    current_password: string
    new_password: string
    confirm_password: string
  }) => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('current_password', data.current_password)
      formData.append('new_password', data.new_password)
      formData.append('confirm_password', data.confirm_password)

      const result = await changePassword(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Password changed successfully')
        // Reset form
        // form reset would go here
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        For security, please enter your current password to confirm your identity.
      </p>

      <div>
        <Label htmlFor="current_password">Current Password</Label>
        <Input
          id="current_password"
          type="password"
          {...register('current_password', { required: true })}
          placeholder="Enter your current password"
          disabled={isPending}
        />
        {errors.current_password && (
          <p className="text-red-500 text-sm mt-1">{errors.current_password.message as string}</p>
        )}
      </div>

      <div>
        <Label htmlFor="new_password">New Password</Label>
        <Input
          id="new_password"
          type="password"
          {...register('new_password', { required: true })}
          placeholder="Enter new password (min 8 characters)"
          disabled={isPending}
        />
        {errors.new_password && (
          <p className="text-red-500 text-sm mt-1">{errors.new_password.message as string}</p>
        )}
      </div>

      <div>
        <Label htmlFor="confirm_password">Confirm New Password</Label>
        <Input
          id="confirm_password"
          type="password"
          {...register('confirm_password', { required: true })}
          placeholder="Confirm new password"
          disabled={isPending}
        />
        {errors.confirm_password && (
          <p className="text-red-500 text-sm mt-1">{errors.confirm_password.message as string}</p>
        )}
      </div>

      {newPassword && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <p className="text-sm text-blue-800 font-medium">Password Requirements:</p>
          <ul className="text-sm text-blue-700 mt-2 space-y-1">
            <li className="flex items-center gap-2">
              <span className={newPassword.length >= 8 ? 'text-green-600' : 'text-red-600'}>
                {newPassword.length >= 8 ? '✓' : '✗'}
              </span>
              At least 8 characters
            </li>
            <li className="flex items-center gap-2">
              <span className={/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-red-600'}>
                {/[A-Z]/.test(newPassword) ? '✓' : '✗'}
              </span>
              At least 1 uppercase letter
            </li>
            <li className="flex items-center gap-2">
              <span className={/[a-z]/.test(newPassword) ? 'text-green-600' : 'text-red-600'}>
                {/[a-z]/.test(newPassword) ? '✓' : '✗'}
              </span>
              At least 1 lowercase letter
            </li>
            <li className="flex items-center gap-2">
              <span className={/[0-9]/.test(newPassword) ? 'text-green-600' : 'text-red-600'}>
                {/[0-9]/.test(newPassword) ? '✓' : '✗'}
              </span>
              At least 1 number
            </li>
            <li className="flex items-center gap-2">
              <span className={/[^A-Za-z0-9]/.test(newPassword) ? 'text-green-600' : 'text-red-600'}>
                {/[^A-Za-z0-9]/.test(newPassword) ? '✓' : '✗'}
              </span>
              At least 1 special character
            </li>
          </ul>
        </div>
      )}

      <Button type="submit" disabled={isPending} className="w-full md:w-auto">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Changing Password...
          </>
        ) : (
          'Change Password'
        )}
      </Button>
    </form>
  )
}
