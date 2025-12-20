'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/cart-store';
import { checkStock } from '@/lib/supabase/inventory';
import type { Database } from '@/types/database.types';

type Product = Database['public']['Tables']['products']['Row'];

interface AddToCartButtonProps {
  product: Product;
  selectedSize: string | null;
  selectedColor: string | null;
  onCartOpen?: () => void;
}

export function AddToCartButton({
  product,
  selectedSize,
  selectedColor,
  onCartOpen,
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = async () => {
    setIsLoading(true);

    // Validate variant selection
    if (!selectedSize || !selectedColor) {
      toast.error('Please select size and color');
      setIsLoading(false);
      return;
    }

    try {
      // Check stock before adding to cart
      const { inStock, quantity } = await checkStock(
        product.id,
        selectedSize,
        selectedColor
      );

      if (!inStock) {
        toast.error('This item is currently out of stock');
        setIsLoading(false);
        return;
      }

      // Add to cart
      addItem(product, { size: selectedSize, color: selectedColor });

      // Show success toast
      toast.success('Added to cart', {
        description: `${product.name} - ${selectedSize}, ${selectedColor}`,
        action: onCartOpen
          ? {
              label: 'View Cart',
              onClick: onCartOpen,
            }
          : undefined,
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
      toast.error('Failed to add to cart. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isLoading || !selectedSize || !selectedColor}
      className="w-full"
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Adding...
        </>
      ) : (
        'Add to Cart'
      )}
    </Button>
  );
}
