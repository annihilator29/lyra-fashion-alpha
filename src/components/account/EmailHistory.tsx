'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Mail, Clock, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'

interface SentEmail {
  id: string
  email_type: string
  subject: string
  status: string
  sent_at: string
  delivered_at: string | null
  opened_at: string | null
  clicked_at: string | null
  metadata: Record<string, unknown>
}

export default function EmailHistory() {
  const [emails, setEmails] = useState<SentEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const supabase = createClient()

  useEffect(() => {
    fetchEmailHistory()
  }, [])

  async function fetchEmailHistory() {
    try {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please log in to view email history')
        return
      }

      const { data, error } = await supabase
        .from('sent_emails')
        .select('*')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(50)

      if (error) {
        throw error
      }

      setEmails(data || [])
    } catch (error) {
      console.error('Failed to fetch email history:', error)
      toast.error('Failed to load email history. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'delivered':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'opened':
        return <CheckCircle2 className="h-4 w-4 text-blue-600" />
      case 'clicked':
        return <CheckCircle2 className="h-4 w-4 text-purple-600" />
      case 'bounced':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  function getStatusLabel(status: string): string {
    switch (status) {
      case 'sent':
        return 'Sent'
      case 'delivered':
        return 'Delivered'
      case 'opened':
        return 'Opened'
      case 'clicked':
        return 'Clicked'
      case 'bounced':
        return 'Bounced'
      case 'failed':
        return 'Failed'
      default:
        return status
    }
  }

  function getEmailTypeLabel(type: string): string {
    switch (type) {
      case 'order_confirmation':
        return 'Order Confirmation'
      case 'shipment':
        return 'Shipment Notification'
      case 'delivery':
        return 'Delivery Confirmation'
      case 'newsletter':
        return 'Newsletter'
      case 'sales':
        return 'Sales Update'
      case 'personalized':
        return 'Personalized Recommendations'
      default:
        return type
    }
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '-'

    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString()
  }

  const filteredEmails =
    filter === 'all' ? emails : emails.filter((email) => email.email_type === filter)

  const emailTypes = [
    { value: 'all', label: 'All Emails' },
    { value: 'order_confirmation', label: 'Order Confirmation' },
    { value: 'shipment', label: 'Shipment' },
    { value: 'delivery', label: 'Delivery' },
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'sales', label: 'Sales' },
    { value: 'personalized', label: 'Recommendations' },
  ]

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Email History</h2>
        <p className="text-gray-600">
          View all emails sent to your account, including delivery status and
          engagement metrics.
        </p>
      </div>

      {/* Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {emailTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => setFilter(type.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === type.value
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filteredEmails.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Mail className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg mb-2">No emails found</p>
          <p className="text-gray-500 text-sm">
            {filter === 'all'
              ? "You haven't received any emails yet"
              : `No ${getEmailTypeLabel(filter)} emails found`}
          </p>
        </div>
      ) : (
        /* Email List */
        <div className="space-y-4">
          {filteredEmails.map((email) => (
            <div
              key={email.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Email Header */}
              <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-gray-900">
                        {getEmailTypeLabel(email.email_type)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(email.sent_at)}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm ml-8">{email.subject}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {getStatusIcon(email.status)}
                      <span>{getStatusLabel(email.status)}</span>
                    </div>
                    <button
                      onClick={() => toggleExpanded(email.id)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      {expandedIds.has(email.id) ? (
                        <ChevronUp className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Email Details (Expandable) */}
              {expandedIds.has(email.id) && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Sent At</p>
                      <p className="text-gray-900">
                        {formatDate(email.sent_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Delivered At</p>
                      <p className="text-gray-900">
                        {formatDate(email.delivered_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Opened At</p>
                      <p className="text-gray-900">
                        {formatDate(email.opened_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Clicked At</p>
                      <p className="text-gray-900">
                        {formatDate(email.clicked_at)}
                      </p>
                    </div>
                  </div>

                  {/* Metadata */}
                  {Object.keys(email.metadata).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-gray-500 text-sm mb-2">
                        Additional Details
                      </p>
                      <pre className="bg-gray-100 p-3 rounded text-xs text-gray-700 overflow-x-auto">
                        {JSON.stringify(email.metadata, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                    <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Refresh Status
                    </button>
                    {email.status === 'bounced' && (
                      <button
                        onClick={() =>
                          toast.info('Contact support for help with bounced emails')
                        }
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                      >
                        Get Help
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Email history shows the last 50 emails sent to your
          account. Engagement metrics (opened, clicked) may take a few minutes to
          update after opening or clicking links in emails.
        </p>
      </div>
    </div>
  )
}
