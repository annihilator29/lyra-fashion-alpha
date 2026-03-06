/**
 * Customer Addresses Component
 * Story 7.4a: Customer Lookup & Profile
 * AC4: Customer Addresses & Preferences
 * 
 * Displays customer saved shipping addresses
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Home, Phone } from 'lucide-react';

interface Address {
  id: string;
  name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string | null;
  postal_code: string;
  country: string;
  phone: string | null;
  is_default: boolean;
}

interface CustomerAddressesProps {
  addresses: Address[];
}

export function CustomerAddresses({ addresses }: CustomerAddressesProps) {
  if (!addresses || addresses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Saved Addresses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No saved addresses found.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Saved Addresses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="p-4 border rounded-lg space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{address.name}</span>
                </div>
                {address.is_default && (
                  <Badge variant="secondary">Default</Badge>
                )}
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <div>{address.address_line1}</div>
                {address.address_line2 && <div>{address.address_line2}</div>}
                <div>
                  {address.city}, {address.state || 'N/A'} {address.postal_code}
                </div>
                <div>{address.country}</div>
              </div>
              
              {address.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span>{address.phone}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
