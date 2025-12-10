import { render, screen, fireEvent } from '@testing-library/react';
import { VariantSelector } from '../variant-selector';
import type { ProductVariantRow } from '@/types/product';
import React from 'react';

describe('VariantSelector', () => {
    const mockVariants: ProductVariantRow[] = [
        {
            id: '1',
            product_id: 'product-1',
            sku: 'PROD-S-BLACK',
            size: 'S',
            color: 'Black',
            color_hex: '#000000',
            price_modifier: 0,
            image_url: null,
            stock_quantity: 10,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
        },
        {
            id: '2',
            product_id: 'product-1',
            sku: 'PROD-M-BLACK',
            size: 'M',
            color: 'Black',
            color_hex: '#000000',
            price_modifier: 0,
            image_url: null,
            stock_quantity: 5,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
        },
        {
            id: '3',
            product_id: 'product-1',
            sku: 'PROD-S-WHITE',
            size: 'S',
            color: 'White',
            color_hex: '#FFFFFF',
            price_modifier: 5,
            image_url: '/images/white-variant.jpg',
            stock_quantity: 0,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
        },
        {
            id: '4',
            product_id: 'product-1',
            sku: 'PROD-M-WHITE',
            size: 'M',
            color: 'White',
            color_hex: '#FFFFFF',
            price_modifier: 5,
            image_url: '/images/white-variant.jpg',
            stock_quantity: 3,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
        },
    ];

    const mockBasePrice = 100;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders size selector with available sizes', () => {
        render(<VariantSelector variants={mockVariants} basePrice={mockBasePrice} />);

        // Should show Size heading
        expect(screen.getByText('Size')).toBeInTheDocument();

        // Should show S and M buttons
        expect(screen.getByRole('radio', { name: 'S' })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: 'M' })).toBeInTheDocument();
    });

    it('renders color selector with color swatches', () => {
        render(<VariantSelector variants={mockVariants} basePrice={mockBasePrice} />);

        // Should show Color heading
        expect(screen.getByText('Color')).toBeInTheDocument();

        // Should show Black and White options
        expect(screen.getByRole('radio', { name: 'Black' })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: 'White' })).toBeInTheDocument();
    });

    it('updates selected size when size button clicked', () => {
        render(<VariantSelector variants={mockVariants} basePrice={mockBasePrice} />);

        const sizeButton = screen.getByRole('radio', { name: 'S' });
        fireEvent.click(sizeButton);

        // Should show selected size
        expect(screen.getByText('Selected: S')).toBeInTheDocument();
    });

    it('updates selected color when color button clicked', () => {
        render(<VariantSelector variants={mockVariants} basePrice={mockBasePrice} />);

        const colorButton = screen.getByRole('radio', { name: 'Black' });
        fireEvent.click(colorButton);

        // Should show selected color
        expect(screen.getByText('Selected: Black')).toBeInTheDocument();
    });

    it('shows stock quantity when variant is selected', () => {
        render(<VariantSelector variants={mockVariants} basePrice={mockBasePrice} />);

        // Select S and Black
        fireEvent.click(screen.getByRole('radio', { name: 'S' }));
        fireEvent.click(screen.getByRole('radio', { name: 'Black' }));

        // Should show "In Stock"
        expect(screen.getByText('In Stock')).toBeInTheDocument();
    });

    it('shows low stock warning when stock is 5 or less', () => {
        render(<VariantSelector variants={mockVariants} basePrice={mockBasePrice} />);

        // Select M and Black (stock_quantity = 5)
        fireEvent.click(screen.getByRole('radio', { name: 'M' }));
        fireEvent.click(screen.getByRole('radio', { name: 'Black' }));

        // Should show low stock warning
        expect(screen.getByText('Only 5 left in stock')).toBeInTheDocument();
    });

    it('disables size option when variant is out of stock for selected color', () => {
        render(<VariantSelector variants={mockVariants} basePrice={mockBasePrice} />);

        // Select White color first
        fireEvent.click(screen.getByRole('radio', { name: 'White' }));

        // S button should be disabled because S + White has stock_quantity = 0
        const sizeS = screen.getByRole('radio', { name: 'S' });
        expect(sizeS).toHaveAttribute('aria-disabled', 'true');
        expect(sizeS).toBeDisabled();
    });

    it('displays price with modifier when variant has price_modifier', () => {
        render(<VariantSelector variants={mockVariants} basePrice={mockBasePrice} />);

        // Select M and White (price_modifier = 5)
        fireEvent.click(screen.getByRole('radio', { name: 'M' }));
        fireEvent.click(screen.getByRole('radio', { name: 'White' }));

        // Should show $105.00 (100 + 5)
        expect(screen.getByText('$105.00')).toBeInTheDocument();
        // Should show modifier note (text may be split across nodes)
        expect(screen.getByText(/\+5\.00/)).toBeInTheDocument();
    });

    it('calls onVariantChange when variant is selected', () => {
        const mockOnVariantChange = jest.fn();
        render(
            <VariantSelector
                variants={mockVariants}
                basePrice={mockBasePrice}
                onVariantChange={mockOnVariantChange}
            />
        );

        // Select S and Black
        fireEvent.click(screen.getByRole('radio', { name: 'S' }));
        fireEvent.click(screen.getByRole('radio', { name: 'Black' }));

        // onVariantChange should be called with the selected variant
        expect(mockOnVariantChange).toHaveBeenCalled();
        const lastCall = mockOnVariantChange.mock.calls[mockOnVariantChange.mock.calls.length - 1];
        expect(lastCall[0]).toMatchObject({
            size: 'S',
            color: 'Black',
        });
    });

    it('calls onImageChange when variant has specific image_url', () => {
        const mockOnImageChange = jest.fn();
        render(
            <VariantSelector
                variants={mockVariants}
                basePrice={mockBasePrice}
                onImageChange={mockOnImageChange}
            />
        );

        // Select M and White (has image_url)
        fireEvent.click(screen.getByRole('radio', { name: 'M' }));
        fireEvent.click(screen.getByRole('radio', { name: 'White' }));

        // onImageChange should be called with the variant's image_url
        expect(mockOnImageChange).toHaveBeenCalledWith('/images/white-variant.jpg');
    });

    it('shows message when no variants provided', () => {
        render(<VariantSelector variants={[]} basePrice={mockBasePrice} />);

        expect(
            screen.getByText('This product has a single variant. Add to cart to purchase.')
        ).toBeInTheDocument();
    });

    it('displays SKU for selected variant', () => {
        render(<VariantSelector variants={mockVariants} basePrice={mockBasePrice} />);

        // Select S and Black
        fireEvent.click(screen.getByRole('radio', { name: 'S' }));
        fireEvent.click(screen.getByRole('radio', { name: 'Black' }));

        // Should show SKU
        expect(screen.getByText('SKU: PROD-S-BLACK')).toBeInTheDocument();
    });

    it('shows prompt to select both size and color', () => {
        render(<VariantSelector variants={mockVariants} basePrice={mockBasePrice} />);

        // Initially should show prompt
        expect(screen.getByText('Select size and color to see availability')).toBeInTheDocument();

        // Select only size
        fireEvent.click(screen.getByRole('radio', { name: 'S' }));

        // Still should show prompt since color is not selected
        expect(screen.getByText('Select size and color to see availability')).toBeInTheDocument();
    });
});
