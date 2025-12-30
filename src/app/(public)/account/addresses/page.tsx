'use client'

import { useState, useTransition, useEffect } from 'react'
import { toast } from 'sonner'
import { getShippingAddresses } from '@/app/account/actions'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import ShippingAddressForm from '@/components/account/ShippingAddressForm'
import ShippingAddressList from '@/components/account/ShippingAddressList'
import type { ShippingAddress } from '@/types/database.types'

export default function AddressesPage() {
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [addresses, setAddresses] = useState<ShippingAddress[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAddresses()
  }, [])

  const loadAddresses = () => {
    startTransition(async () => {
      const result = await getShippingAddresses()
      if (result.error) {
        toast.error(result.error)
      } else {
        setAddresses(result.data || [])
      }
      setIsLoading(false)
    })
  }

  const handleAddAddress = () => {
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
  }

  const handleSuccess = () => {
    setShowForm(false)
    loadAddresses()
    toast.success('Address saved successfully')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Shipping Addresses</h1>
        <Button
          type="button"
          onClick={handleAddAddress}
          className="flex items-center gap-2"
          disabled={isPending}
        >
          <Plus className="h-4 w-4" />
          Add New Address
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 border mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">Add New Address</h2>
            <Button
              type="button"
              variant="ghost"
              onClick={handleCloseForm}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
          <ShippingAddressForm onCancel={handleCloseForm} onSuccess={handleSuccess} />
        </div>
      )}

      <ShippingAddressList
        addresses={addresses}
        onEdit={() => {
          // For now, just show toast. In future, implement edit mode
          toast.info('Edit functionality coming soon')
        }}
      />
    </div>
  )
}
