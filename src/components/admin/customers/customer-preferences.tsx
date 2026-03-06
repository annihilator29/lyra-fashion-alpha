/**
 * Customer Preferences Component
 * Story 7.4a: Customer Lookup & Profile
 * AC4: Customer Addresses & Preferences
 * 
 * Displays customer communication and marketing preferences
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageSquare, Bell } from 'lucide-react';

interface CustomerPreferencesProps {
  customer: {
    email_preferences?: any | null;
    preferences?: any | null;
  };
}

export function CustomerPreferences({ customer }: CustomerPreferencesProps) {
  const emailPrefs = customer.email_preferences || {};
  const generalPrefs = customer.preferences || {};

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <PreferenceRow
            label="Newsletter"
            value={emailPrefs.marketing_opt_in}
          />
          <PreferenceRow
            label="Order Updates"
            value={emailPrefs.order_updates}
          />
          <PreferenceRow
            label="Promotional Emails"
            value={emailPrefs.promotional_emails}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Communication Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <PreferenceRow
            label="SMS Notifications"
            value={generalPrefs.sms_notifications}
          />
          <PreferenceRow
            label="Preferred Contact Method"
            value={generalPrefs.preferred_contact_method}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function PreferenceRow({ label, value }: { label: string; value: any }) {
  const displayValue = value === true ? (
    <Badge variant="default" className="text-xs">Enabled</Badge>
  ) : value === false ? (
    <Badge variant="secondary" className="text-xs">Disabled</Badge>
  ) : (
    <span className="text-sm text-muted-foreground">Not set</span>
  );

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      {displayValue}
    </div>
  );
}
