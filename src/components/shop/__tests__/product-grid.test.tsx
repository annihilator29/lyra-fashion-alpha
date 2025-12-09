import { render, screen } from '@testing-library/react';
import { ProductGrid, ProductGridSkeleton } from '../product-grid';
import type { Product } from '@/types/database.types';
import React from 'react';

// Mock ProductCard component  
jest.mock('../product-card', () => ({
    ProductCard: ({ product }: { product: Product }) => (
        <div data-testid={`product-card-${product.id}`}>
            <span>{product.name}</span>
            <span>${product.price}</span>
        </div>
    ),
}));

// Mock ProductCardSkeleton component
jest.mock('../product-card-skeleton', () => ({
    ProductCardSkeleton: () => (
        <div data-testid="product-card-skeleton">Loading...</div>
    ),
}));

const mockProducts: Product[] = [
    {
        id: '1',
        name: 'Test Dress 1',
        slug: 'test-dress-1',
        description: 'A beautiful test dress',
        price: 149.99,
        images: ['https://example.com/image1.jpg'],
        category: 'dresses',
        craftsmanship_content: null,
        transparency_data: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
    },
    {
        id: '2',
        name: 'Test Dress 2',
        slug: 'test-dress-2',
        description: 'Another beautiful test dress',
        price: 199.99,
        images: ['https://example.com/image2.jpg'],
        category: 'dresses',
        craftsmanship_content: null,
        transparency_data: null,
        created_at: '2025-01-02T00:00:00Z',
        updated_at: '2025-01-02T00:00:00Z',
    },
];

describe('ProductGrid', () => {
    it('renders products in a grid', () => {
        render(<ProductGrid products={mockProducts} />);

        expect(screen.getByTestId('product-card-1')).toBeInTheDocument();
        expect(screen.getByTestId('product-card-2')).toBeInTheDocument();
    });

    it('displays empty state when no products', () => {
        render(<ProductGrid products={[]} />);

        expect(screen.getByText('No products found')).toBeInTheDocument();
        expect(screen.getByText(/Try adjusting your filters/)).toBeInTheDocument();
    });

    it('shows search emoji in empty state', () => {
        render(<ProductGrid products={[]} />);

        expect(screen.getByText('🔍')).toBeInTheDocument();
    });
});

describe('ProductGridSkeleton', () => {
    it('renders default number of skeleton cards', () => {
        render(<ProductGridSkeleton />);

        const skeletons = screen.getAllByTestId('product-card-skeleton');
        expect(skeletons).toHaveLength(8); // Default count
    });

    it('renders custom number of skeleton cards', () => {
        render(<ProductGridSkeleton count={4} />);

        const skeletons = screen.getAllByTestId('product-card-skeleton');
        expect(skeletons).toHaveLength(4);
    });
});
