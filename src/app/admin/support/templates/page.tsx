/**
 * Admin Support Templates Page
 * Story 7.4b: Support Ticket System — AC4
 *
 * Route: /admin/support/templates
 */

import { isAdmin } from '@/lib/auth/roles';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import { TemplatesList } from '@/components/admin/support/templates-list';
import { getTemplates } from '@/app/admin/support/templates/actions';

export const metadata = {
  title: 'Email Templates | Support | Lyra Admin',
};

export default async function AdminSupportTemplatesPage() {
  const admin = await isAdmin();
  if (!admin) redirect('/');

  const { templates, total, error } = await getTemplates();

  return (
    <div className="container mx-auto px-4 py-8 pb-20">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/admin/support">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tickets
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Email Templates</h1>
            <p className="text-muted-foreground">
              Canned responses for common support scenarios
            </p>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive mb-4 bg-destructive/10 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <TemplatesList initialTemplates={templates} />
    </div>
  );
}
