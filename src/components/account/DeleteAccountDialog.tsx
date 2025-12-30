'use client'

import { useState } from 'react'
import { deleteAccount } from '@/app/account/actions'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle } from 'lucide-react'

export default function DeleteAccountDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmation, setConfirmation] = useState('')

  const handleDelete = async () => {
    if (confirmation !== 'DELETE_ACCOUNT') {
      toast.error('Please type "DELETE_ACCOUNT" to confirm')
      return
    }

    setIsDeleting(true)

    try {
      const formData = new FormData()
      formData.append('confirmation', confirmation)

      const result = await deleteAccount(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Account deleted successfully')
        // Redirect will be handled by server action signing user out
      }
    } catch (err) {
      toast.error('Failed to delete account')
      console.error('Delete account error:', err)
    } finally {
      setIsDeleting(false)
      setIsOpen(false)
      setConfirmation('')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmation(e.target.value)
  }

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        onClick={() => setIsOpen(true)}
        className="text-sm"
      >
        Delete Account
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xl font-bold text-red-900">Delete Account</h2>
                <p className="text-gray-700 mt-2">
                  This action <strong>cannot be undone</strong>.
                  Once you delete your account:
                </p>
                <ul className="mt-3 space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">•</span>
                    <span>Your account will be permanently deleted</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">•</span>
                    <span>All personal data will be removed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">•</span>
                    <span>You will be logged out immediately</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">•</span>
                    <span>Saved addresses and preferences will be lost</span>
                  </li>
                </ul>
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm font-medium text-yellow-900">
                    <strong>Note:</strong> Your order history will be retained for legal purposes
                    in accordance with our data retention policy.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Label htmlFor="confirmation" className="block mb-2">
                Type <span className="text-red-600 font-bold">DELETE_ACCOUNT</span> to confirm
              </Label>
              <Input
                id="confirmation"
                type="text"
                value={confirmation}
                onChange={handleInputChange}
                placeholder="DELETE_ACCOUNT"
                className="font-mono"
                disabled={isDeleting}
              />
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOpen(false)
                  setConfirmation('')
                }}
                disabled={isDeleting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting || confirmation !== 'DELETE_ACCOUNT'}
                className="flex-1"
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
