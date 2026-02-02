'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { createReturnRequest } from '@/lib/returns/mutations';
import { checkItemsAlreadyReturned } from '@/lib/returns/queries';
import type { OrderWithItems } from '@/types/order';
import type { ReturnReason } from '@/types/returns';
import { RETURN_REASON_LABELS } from '@/types/returns';
import Image from 'next/image';
import { Loader2, AlertCircle, Package } from 'lucide-react';

interface ReturnRequestFormProps {
  order: OrderWithItems;
}

export function ReturnRequestForm({ order }: ReturnRequestFormProps) {
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [reason, setReason] = useState<ReturnReason>('size_fit');
  const [conditionNotes, setConditionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alreadyReturnedItems, setAlreadyReturnedItems] = useState<string[]>([]);

  // Filter items that can be returned (exclude final sale)
  const returnableItems = order.order_items?.filter(
    (item) => !item.products?.final_sale
  ) || [];

  // Calculate refund amount
  const refundAmount = returnableItems
    .filter((item) => selectedItems.includes(item.id))
    .reduce((total, item) => total + item.price * item.quantity, 0);

  // Check if items are already in a return
  const handleItemSelection = async (itemId: string, checked: boolean) => {
    if (checked) {
      const { alreadyReturned } = await checkItemsAlreadyReturned(order.id, [itemId]);
      if (alreadyReturned.length > 0) {
        setAlreadyReturnedItems((prev) => [...prev, itemId]);
        toast.error('This item is already in another return request');
        return;
      }
      setSelectedItems((prev) => [...prev, itemId]);
    } else {
      setSelectedItems((prev) => prev.filter((id) => id !== itemId));
      setAlreadyReturnedItems((prev) => prev.filter((id) => id !== itemId));
    }
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item to return');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createReturnRequest({
        orderId: order.id,
        itemIds: selectedItems,
        reason,
        conditionNotes: conditionNotes || undefined,
      });

      if (result.success && result.return) {
        toast.success(
          `Return request submitted! Your RMA number is ${result.return.rma_number}`
        );
        router.push(`/account/orders/${order.id}?return=submitted`);
      } else {
        toast.error(result.message || 'Failed to submit return request');
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
      console.error('Return submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Item Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Select Items to Return</h3>
        <div className="space-y-4">
          {returnableItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-4 p-4 border rounded-lg transition-colors ${
                selectedItems.includes(item.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              } ${alreadyReturnedItems.includes(item.id) ? 'opacity-50' : ''}`}
            >
              <Checkbox
                id={`item-${item.id}`}
                checked={selectedItems.includes(item.id)}
                onCheckedChange={(checked) =>
                  handleItemSelection(item.id, checked as boolean)
                }
                disabled={alreadyReturnedItems.includes(item.id)}
              />
              <div className="flex-1 flex gap-4">
                {item.products?.images?.[0] && (
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                      src={item.products.images[0]}
                      alt={item.products.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <Label
                    htmlFor={`item-${item.id}`}
                    className="font-medium cursor-pointer"
                  >
                    {item.products?.name || 'Unknown Product'}
                  </Label>
                  {item.variant && (
                    <p className="text-sm text-muted-foreground">
                      {item.variant.size && `Size: ${item.variant.size}`}
                      {item.variant.size && item.variant.color && ' | '}
                      {item.variant.color && `Color: ${item.variant.color}`}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                  </p>
                  {alreadyReturnedItems.includes(item.id) && (
                    <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-4 h-4" />
                      Already in another return
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {returnableItems.length === 0 && (
            <div className="text-center py-8 border rounded-lg bg-gray-50">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-muted-foreground">
                No returnable items found in this order. All items may be final sale or already returned.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Return Reason */}
      <div>
        <Label htmlFor="reason" className="text-lg font-semibold block mb-3">
          Return Reason
        </Label>
        <Select
          value={reason}
          onValueChange={(value) => setReason(value as ReturnReason)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(RETURN_REASON_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Condition Notes */}
      <div>
        <Label htmlFor="condition" className="text-lg font-semibold block mb-3">
          Condition Notes (Optional)
        </Label>
        <Textarea
          id="condition"
          placeholder="Describe the condition of the items (e.g., unworn with tags attached)..."
          value={conditionNotes}
          onChange={(e) => setConditionNotes(e.target.value)}
          rows={4}
        />
        <p className="text-sm text-muted-foreground mt-2">
          Items must be unworn, unwashed, and have original tags attached for full refund.
        </p>
      </div>

      {/* Refund Summary */}
      {selectedItems.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Refund Summary</h4>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Items selected:</span>
            <span className="font-medium">{selectedItems.length}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-muted-foreground">Estimated refund:</span>
            <span className="font-bold text-lg">${refundAmount.toFixed(2)}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Full refund (100% of item price). No restocking fees.
          </p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || selectedItems.length === 0}
          className="flex-1"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Return Request'
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push(`/account/orders/${order.id}`)}
          disabled={isSubmitting}
          size="lg"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
