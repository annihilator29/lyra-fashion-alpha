'use client';

import { useCartStore } from '@/lib/cart-store';
import { TransparencyCard } from '@/components/shop/transparency-card';
import { FactoryBadge } from '@/components/shop/factory-badge';
import Image from 'next/image';

export default function CheckoutOrderSummary() {
  const { items, subtotal } = useCartStore();

  // MVP: Flat rates (will be dynamic in Story 3.4 with shipping API)
  const shippingCost = 10; // $10 flat rate
  const taxRate = 0.10; // 10% tax
  const tax = subtotal * taxRate;
  const total = subtotal + shippingCost + tax;

  // Factory-direct savings calculation
  const retailTotal = total * 1.67; // Retail price is 67% higher
  const savings = retailTotal - total;

  return (
    <div className="bg-gray-50 p-6 rounded-lg sticky top-4">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

      {/* Cart Items */}
      <div className="mb-6 max-h-60 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-gray-500">No items in cart</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center py-3 border-b border-gray-200 last:border-b-0">
              <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center mr-3">
               {item.imageUrl ? (
                 <Image 
                   src={item.imageUrl} 
                   alt={item.name} 
                   width={64}
                   height={64}
                   className="w-full h-full object-cover rounded-md"
                 />
               ) : (
                 <span className="text-gray-500 text-xs">No image</span>
               )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h4 className="font-medium text-sm">{item.name}</h4>
                  <span className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500">{item.quantity} × ${item.price.toFixed(2)}</p>
              </div>
              <FactoryBadge />
            </div>
          ))
        )}
      </div>

      {/* Totals */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>${shippingCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-2">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Factory-Direct Savings with TransparencyCard */}
      <TransparencyCard
        factoryPrice={total}
        retailPrice={retailTotal}
        savings={savings}
      />
    </div>
  );
}