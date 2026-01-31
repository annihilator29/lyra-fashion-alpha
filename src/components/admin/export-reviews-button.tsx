/**
 * Export Reviews Button
 * 
 * Client component to handle CSV export with download.
 * 
 * @module components/admin/export-reviews-button
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ExportReviewsButtonProps {
  status: string;
  search: string;
}

export function ExportReviewsButton({ status, search }: ExportReviewsButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (status && status !== 'all') {
        params.set('status', status);
      }
      if (search) {
        params.set('search', search);
      }

      const response = await fetch(`/api/admin/reviews/export?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to export reviews');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reviews-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Reviews exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export reviews');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="gap-2"
      onClick={handleExport}
      disabled={isExporting}
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Export CSV
        </>
      )}
    </Button>
  );
}
