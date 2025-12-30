import { MapPin } from 'lucide-react';

interface ShippingAddressDisplayProps {
  address: {
    name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
    phone?: string;
  };
}

export default function ShippingAddressDisplay({ address }: ShippingAddressDisplayProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-gray-700 space-y-1">
          <p className="font-medium">{address.name}</p>
          <p>{address.address_line1}</p>
          {address.address_line2 && <p>{address.address_line2}</p>}
          <p>
            {address.city}
            {address.state && `, ${address.state}`}
            {' '}{address.postal_code}
          </p>
          <p>{address.country}</p>
          {address.phone && <p className="text-gray-600">{address.phone}</p>}
        </div>
      </div>
    </div>
  );
}
