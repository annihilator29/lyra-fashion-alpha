/**
 * Packing Slip Button Component
 * Story 7.3: Order Management & Fulfillment Tools
 * AC4: Generate and print packing slip PDF
 */

'use client';

import * as React from 'react';
import { Printer, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import type { OrderWithItems } from '@/types/order';

interface PackingSlipButtonProps {
  order: OrderWithItems;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  showLabel?: boolean;
}

export function PackingSlipButton({
  order,
  variant = 'outline',
  size = 'sm',
  showLabel = true,
}: PackingSlipButtonProps) {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);

    try {
      // Dynamic import to avoid SSR issues with @react-pdf/renderer
      const { downloadPackingSlip } = await import('@/lib/pdf/packing-slip');

      await downloadPackingSlip(order);

      toast.success('Packing slip downloaded');
    } catch (error) {
      console.error('Packing slip generation error:', error);
      toast.error('Failed to generate packing slip');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    setIsGenerating(true);

    try {
      // Dynamic import to avoid SSR issues
      const { generatePackingSlipPDF } = await import('@/lib/pdf/packing-slip');

      const blob = await generatePackingSlipPDF(order);
      const url = URL.createObjectURL(blob);
      
      // Open in new window for printing
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }

      toast.success('Packing slip ready for printing');
    } catch (error) {
      console.error('Packing slip print error:', error);
      toast.error('Failed to prepare packing slip for printing');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={isGenerating}>
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Printer className="h-4 w-4" />
          )}
          {showLabel && (
            <span className="ml-2">
              {isGenerating ? 'Generating...' : 'Packing Slip'}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleDownload}>
          Download PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePrint}>
          Print Packing Slip
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Bulk Packing Slips Button
 * For generating multiple packing slips at once
 */
interface BulkPackingSlipButtonProps {
  orders: OrderWithItems[];
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function BulkPackingSlipButton({
  orders,
  variant = 'default',
  size = 'default',
}: BulkPackingSlipButtonProps) {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleBulkDownload = async () => {
    if (orders.length === 0) {
      toast.error('No orders selected');
      return;
    }

    setIsGenerating(true);

    try {
      // In production, this would generate a single PDF with all packing slips
      // For now, we'll download them individually with a slight delay
      const { downloadPackingSlip } = await import('@/lib/pdf/packing-slip');

      toast.info(`Generating ${orders.length} packing slip(s)...`);

      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        // This is a simplified version - in production you'd fetch full order data
        await downloadPackingSlip(order as any);
        
        // Add small delay between downloads
        if (i < orders.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      toast.success(`Downloaded ${orders.length} packing slip(s)`);
    } catch (error) {
      console.error('Bulk packing slip error:', error);
      toast.error('Failed to generate bulk packing slips');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleBulkDownload}
      disabled={isGenerating || orders.length === 0}
    >
      {isGenerating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Printer className="h-4 w-4 mr-2" />
          Print {orders.length} Packing Slip{orders.length !== 1 ? 's' : ''}
        </>
      )}
    </Button>
  );
}
