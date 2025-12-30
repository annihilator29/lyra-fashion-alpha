'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { deleteShippingAddress, setDefaultShippingAddress } from '@/app/account/actions'
import { Button } from '@/components/ui/button'
import { Edit, MapPin, Trash2, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ShippingAddressListProps {
  addresses: Array<{
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
  }>
  onEdit?: (address: ShippingAddressListProps['addresses'][0]) => void
}

export default function ShippingAddressList({ addresses, onEdit }: ShippingAddressListProps) {
  const [isPending, startTransition] = useTransition()

  const handleSetDefault = async (id: string) => {
    startTransition(async () => {
      const result = await setDefaultShippingAddress(id)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Default address updated')
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return
    }

    startTransition(async () => {
      const result = await deleteShippingAddress(id)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Address deleted successfully')
      }
    })
  }

  if (addresses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No saved addresses yet</p>
        <p className="text-sm">Add your first shipping address to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <div
          key={address.id}
          className={cn(
            'border rounded-lg p-4 transition-all',
            address.is_default
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 bg-white hover:border-gray-300'
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'flex-shrink-0 rounded p-2',
                  address.is_default
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-100 text-gray-700'
                )}
              >
                <MapPin className="h-5 w-5" />
              </div>

              <div>
                <h3 className="font-semibold text-lg">{address.name}</h3>
                {address.is_default && (
                  <span className="inline-flex items-center ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                    <Check className="h-3 w-3 mr-1" />
                    Default
                  </span>
                )}

                <div className="mt-2 space-y-1">
                  <p className="text-gray-700">
                    {address.address_line1}
                    {address.address_line2 && `, ${address.address_line2}`}
                  </p>
                  <p className="text-gray-700">
                    {address.city}
                    {address.state && `, ${address.state}`} {address.postal_code}
                  </p>
                  <p className="text-gray-700">{address.country}</p>
                  {address.phone && (
                    <p className="text-sm text-gray-600">
                      Phone: {address.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 ml-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onEdit && onEdit(address)}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <Edit className="h-4 w-4" />
                )}
              </Button>

              {!address.is_default && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSetDefault(address.id)}
                  disabled={isPending}
                  title="Set as default address"
                >
                  <MapPin className="h-4 w-4" />
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDelete(address.id)}
                disabled={isPending}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
