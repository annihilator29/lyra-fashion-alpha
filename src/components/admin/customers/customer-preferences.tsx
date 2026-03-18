/**
 * Customer Preferences Component
 * Story 7.4a: Customer Lookup & Profile
 * AC2 & AC4: Customer Profile View, Customer Addresses & Preferences
 * 
 * Displays customer communication and marketing preferences
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageSquare, Bell, Settings } from 'lucide-react';

interface CustomerPreferencesProps {
  customer: {
    email_preferences?: any | null;
    preferences?: any | null;
    customer_preferences?: {
      preferences: any | null;
      size_preferences: any | null;
      style_preferences: any | null;
    } | null;
    communication_preferences?: {
      email_opt_in: boolean | null;
      sms_opt_in: boolean | null;
      marketing_opt_in: boolean | null;
      newsletter_subscription: boolean | null;
    } | null;
  };
}

export function CustomerPreferences({ customer }: CustomerPreferencesProps) {
  const emailPrefs = (customer.email_preferences || {}) as Record<string, any>;
  const generalPrefs = (customer.preferences || {}) as Record<string, any>;
  const commPrefs = (customer.communication_preferences || {}) as Record<string, any>;
  const customerPrefs = (customer.customer_preferences || {}) as Record<string, any>;

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
            label="Email Opt-in"
            value={commPrefs.email_opt_in}
          />
          <PreferenceRow
            label="Newsletter Subscription"
            value={commPrefs.newsletter_subscription}
          />
          <PreferenceRow
            label="Marketing Opt-in"
            value={commPrefs.marketing_opt_in}
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
            label="SMS Opt-in"
            value={commPrefs.sms_opt_in}
          />
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Customer Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <PreferenceRow
            label="Size Preferences"
            value={customerPrefs.size_preferences}
          />
          <PreferenceRow
            label="Style Preferences"
            value={customerPrefs.style_preferences}
          />
          <PreferenceRow
            label="General Preferences"
            value={customerPrefs.preferences}
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
