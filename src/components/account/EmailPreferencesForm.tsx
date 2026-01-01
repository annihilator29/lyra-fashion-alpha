'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Check, Mail, AlertCircle } from 'lucide-react'
import { updateEmailPreferences, type EmailPreferences } from '@/app/account/actions'

interface EmailPreferencesFormProps {
  initialPreferences: EmailPreferences
}

export default function EmailPreferencesForm({ initialPreferences }: EmailPreferencesFormProps) {
  const [preferences, setPreferences] = useState(initialPreferences)
  const [saving, setSaving] = useState(false)

  const handleToggle = (key: keyof EmailPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const result = await updateEmailPreferences(preferences)

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Email preferences saved successfully!')
      setPreferences(result.data as EmailPreferences)
    } catch (error) {
      console.error('Failed to save email preferences:', error)
      toast.error('Failed to update preferences. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Email Preferences
        </h2>
        <p className="text-gray-600 mb-6">
          Choose which emails you&apos;d like to receive. Transactional emails (order updates)
          are essential for order processing, but marketing emails are optional.
        </p>
      </div>

      {/* Preferences Form */}
      <div className="space-y-6">
        {/* Transactional Emails */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900">
              Transactional Emails
            </h3>
            <span className="text-xs text-gray-500 ml-2">(Essential)</span>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                id="order_updates"
                checked={preferences.order_updates}
                onChange={() => handleToggle('order_updates')}
                disabled={saving}
                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="flex-1">
                <span className="font-medium text-gray-900">Order Updates</span>
                <p className="text-sm text-gray-500">
                  Order confirmation, shipping notifications, delivery updates
                </p>
              </div>
              {preferences.order_updates ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <div className="h-5 w-5 rounded border-2 border-gray-200" />
              )}
            </label>
          </div>
        </div>

        {/* Marketing Emails */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="h-5 w-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">
              Marketing Emails
            </h3>
            <span className="text-xs text-gray-500 ml-2">(Optional)</span>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                id="new_products"
                checked={preferences.new_products}
                onChange={() => handleToggle('new_products')}
                disabled={saving}
                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="flex-1">
                <span className="font-medium text-gray-900">New Products</span>
                <p className="text-sm text-gray-500">
                  New arrivals, seasonal collections, product launches
                </p>
              </div>
              {preferences.new_products ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <div className="h-5 w-5 rounded border-2 border-gray-200" />
              )}
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                id="sales"
                checked={preferences.sales}
                onChange={() => handleToggle('sales')}
                disabled={saving}
                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="flex-1">
                <span className="font-medium text-gray-900">Sales & Promotions</span>
                <p className="text-sm text-gray-500">
                  Exclusive discounts, flash sales, promotional offers
                </p>
              </div>
              {preferences.sales ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <div className="h-5 w-5 rounded border-2 border-gray-200" />
              )}
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                id="blog"
                checked={preferences.blog}
                onChange={() => handleToggle('blog')}
                disabled={saving}
                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              />
              <div className="flex-1">
                <span className="font-medium text-gray-900">Blog & Content</span>
                <p className="text-sm text-gray-500">
                  Styling tips, factory stories, fashion news
                </p>
              </div>
              {preferences.blog ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <div className="h-5 w-5 rounded border-2 border-gray-200" />
              )}
            </label>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-blue-200 rounded-lg p-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-2">About Your Privacy</h4>
              <p className="text-sm text-blue-800">
                We respect your privacy. You can update your preferences at any time,
                and we&apos;ll never share your email with third parties. Unsubscribe
                links are included in all emails we send.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  )
}
