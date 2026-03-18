/**
 * Customer Header Component
 * Story 7.4a: Customer Lookup & Profile
 * AC2: Customer Profile View
 * 
 * Displays customer header with name, email, account age, and segment badge
 */

import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Phone, Calendar } from 'lucide-react';

interface CustomerHeaderProps {
  customer: {
    name?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    email: string;
    phone?: string | null;
    phone_number?: string | null;
    created_at: string;
    segment: 'VIP' | 'Regular' | 'New';
    avatar_url?: string | null;
  };
}

const segmentColors = {
  VIP: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  Regular: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  New: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

export function CustomerHeader({ customer }: CustomerHeaderProps) {
  // Derive display name: prefer first_name + last_name, fallback to name, then 'N/A'
  const fullName = (
    [customer.first_name, customer.last_name].filter(Boolean).join(' ').trim() ||
    customer.name ||
    'N/A'
  );
  const phone = customer.phone || customer.phone_number || null;
  const initials = getInitials(fullName);
  const accountAge = calculateAccountAge(customer.created_at);

  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-start gap-4">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="text-lg">
            {getInitials(fullName)}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{fullName}</h1>
            <Badge className={segmentColors[customer.segment]}>
              {customer.segment} Customer
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <a href={`mailto:${customer.email}`} className="hover:underline">
                {customer.email}
              </a>
            </div>
            
            {phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href={`tel:${phone}`} className="hover:underline">
                  {phone}
                </a>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Customer since {accountAge}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getInitials(name: string): string {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function calculateAccountAge(created_at: string): string {
  const created = new Date(created_at);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    if (months > 0) {
      return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''} ago`;
    }
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  }
}
