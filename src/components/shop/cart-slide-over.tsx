'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, AlertTriangle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export function CartSlideOver() {
  const { items, subtotal, updateQuantity, removeItem, isOpen, setIsOpen } = useCartStore();
  const [isMobile, setIsMobile] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, 'deleted' | 'price_changed'>>({});

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isOpen || items.length === 0) return;

    const validateCartItems = async () => {
      const supabase = createClient();
      const newErrors: Record<string, 'deleted' | 'price_changed'> = {};

      const productIds = Array.from(new Set(items.map((item) => item.productId)));

      const { data: dbProducts, error } = await supabase
        .from('products')
        .select('id, price')
        .in('id', productIds);

      if (error) {
        console.error('Error validating cart products:', error);
        return;
      }

      const dbProductMap = new Map(dbProducts?.map((p) => [p.id, p.price]));

      items.forEach((item) => {
        if (!dbProductMap.has(item.productId)) {
          newErrors[item.id] = 'deleted';
        } else if (dbProductMap.get(item.productId) !== item.price) {
          newErrors[item.id] = 'price_changed';
        }
      });

      setValidationErrors(newErrors);
    };

    validateCartItems();
  }, [isOpen, items]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="right"
        data-testid="cart-sheet-content"
        className={cn(
          'gap-0 p-0 sm:max-w-md w-full',
          isMobile && 'h-full w-full max-w-full'
        )}
      >
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle className="flex items-center justify-between">
            <span>Your Cart ({items.length})</span>
            {/* SheetContent has a built-in close button, but we can keep this for custom placement if needed, 
                though typically Sheet's default close is fine. Keeping it for consistency with previous design. */}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center h-full">
            <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">Your cart is empty</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Add items to get started
            </p>
            <Button onClick={() => setIsOpen(false)}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 border-b pb-4 last:border-0"
                  >
                    <Link
                      href={`/products/${item.slug}`}
                      className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted"
                      onClick={() => setIsOpen(false)}
                    >
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </Link>

                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <Link
                          href={`/products/${item.slug}`}
                          className="font-medium hover:underline"
                          onClick={() => setIsOpen(false)}
                        >
                          {item.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {item.variant.size} / {item.variant.color}
                        </p>
                        <p className="mt-1 font-semibold">
                          {formatPrice(item.price)}
                        </p>
                        {validationErrors[item.id] === 'deleted' && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-destructive">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span>This product is no longer available</span>
                          </div>
                        )}
                        {validationErrors[item.id] === 'price_changed' && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-600">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span>Price has changed since added to cart</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>

                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>

                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t bg-background pt-4 pb-6 px-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="space-y-2">
                  <Button
                    asChild
                    className="w-full"
                    size="lg"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href="/checkout">Proceed to Checkout</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsOpen(false)}
                  >
                     <Link href="/cart">View Cart</Link>
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
