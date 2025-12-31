'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/utils'; // Assuming cn is in utils

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCartStore();

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-muted/30 p-12 rounded-full mb-6">
          <ShoppingBag className="h-16 w-16 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8 text-lg max-w-md text-center">
          Looks like you haven&apos;t added anything to your cart yet. Explore our collection to find your next favorite look.
        </p>
        <Button asChild size="lg">
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 space-y-8">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row gap-6 py-6 border-b last:border-0 last:pb-0 first:pt-0">
                  {/* Product Image */}
                  <div className="relative h-24 w-24 sm:h-32 sm:w-32 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                      <Link href={`/products/${item.category}/${item.slug}`}>
                          <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                      </Link>
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between items-start gap-4">
                          <div>
                              <h3 className="font-semibold text-lg">
                                  <Link href={`/products/${item.category}/${item.slug}`} className="hover:underline">
                                      {item.name}
                                  </Link>
                              </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {item.variant.size} / {item.variant.color}
                        </p>
                      </div>
                      <p className="font-semibold text-lg">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>

                    <div className="flex justify-between items-end mt-4">
                      <div className="flex items-center gap-3">
                         <span className='text-sm text-muted-foreground mr-1 hidden sm:inline-block'>Qty:</span>
                        <div className="flex items-center border rounded-md">
                            <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-none rounded-l-md"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            >
                            <Minus className="h-3 w-3" />
                            <span className="sr-only">Decrease quantity</span>
                            </Button>
                            <span className="w-10 text-center text-sm font-medium">
                            {item.quantity}
                            </span>
                            <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-none rounded-r-md"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            >
                            <Plus className="h-3 w-3" />
                            <span className="sr-only">Increase quantity</span>
                            </Button>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 -mr-2"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        <span className="sr-only sm:not-sr-only">Remove</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="rounded-xl border bg-card shadow-sm sticky top-24 p-6 space-y-6">
            <h2 className="text-xl font-semibold">Order Summary</h2>
            
            <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-muted-foreground italic">Calculated at checkout</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="text-muted-foreground italic">Calculated at checkout</span>
                </div>
            </div>

            <div className="border-t pt-4">
                <div className="flex justify-between text-base font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(subtotal)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Shipping and taxes calculated at checkout.
                </p>
            </div>

            <Button asChild size="lg" className="w-full text-base">
                <Link href="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
             <div className="text-center">
                <Link href="/products" className="text-sm text-muted-foreground hover:underline hover:text-foreground transition-colors">
                    or Continue Shopping
                </Link>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
