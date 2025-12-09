import { render, screen, fireEvent } from '@testing-library/react';
import { FilterSidebar } from '../filter-sidebar';
import type { ProductFilters } from '@/types/product';
import React from 'react';

// Mock the UI components
jest.mock('@/components/ui/sheet', () => ({
    Sheet: ({ children }: { children: React.ReactNode }) => <div data-testid="sheet">{children}</div>,
    SheetContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    SheetHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    SheetTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    SheetTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui/checkbox', () => ({
    Checkbox: ({ id, checked, onCheckedChange }: { id: string; checked: boolean; onCheckedChange: () => void }) => (
        <input
            type="checkbox"
            id={id}
            data-testid={id}
            checked={checked}
            onChange={onCheckedChange}
        />
    ),
}));

jest.mock('@/components/ui/label', () => ({
    Label: ({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) => (
        <label htmlFor={htmlFor}>{children}</label>
    ),
}));

jest.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, ...props }: { children: React.ReactNode; onClick?: () => void }) => (
        <button onClick={onClick} {...props}>{children}</button>
    ),
}));

jest.mock('@/components/ui/input', () => ({
    Input: ({ value, onChange, placeholder, ...props }: { value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string }) => (
        <input
            value={value ?? ''}
            onChange={onChange}
            placeholder={placeholder}
            data-testid={`input-${placeholder?.toLowerCase()}`}
            {...props}
        />
    ),
}));

describe('FilterSidebar', () => {
    const mockOnFiltersChange = jest.fn();
    const defaultFilters: ProductFilters = {};

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders filter section headings', () => {
        render(
            <FilterSidebar
                filters={defaultFilters}
                onFiltersChange={mockOnFiltersChange}
            />
        );

        // Check for filter section headings (they appear multiple times in desktop/mobile)
        expect(screen.getAllByText('Size').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Color').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Price Range').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Availability').length).toBeGreaterThanOrEqual(1);
    });

    it('renders size checkboxes', () => {
        render(
            <FilterSidebar
                filters={defaultFilters}
                onFiltersChange={mockOnFiltersChange}
            />
        );

        // Multiple size checkboxes exist (in mobile and desktop views)
        expect(screen.getAllByTestId('size-XS').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByTestId('size-M').length).toBeGreaterThanOrEqual(1);
    });

    it('calls onFiltersChange when size is toggled', () => {
        render(
            <FilterSidebar
                filters={defaultFilters}
                onFiltersChange={mockOnFiltersChange}
            />
        );

        const sizeCheckboxes = screen.getAllByTestId('size-M');
        fireEvent.click(sizeCheckboxes[0]);

        expect(mockOnFiltersChange).toHaveBeenCalledWith({
            sizes: ['M'],
        });
    });

    it('shows clear all filters button when filters are active', () => {
        const activeFilters: ProductFilters = {
            sizes: ['M'],
            priceMin: 50,
        };

        render(
            <FilterSidebar
                filters={activeFilters}
                onFiltersChange={mockOnFiltersChange}
            />
        );

        expect(screen.getAllByText('Clear all filters').length).toBeGreaterThanOrEqual(1);
    });

    it('clears all filters when clear button is clicked', () => {
        const activeFilters: ProductFilters = {
            sizes: ['M', 'L'],
            colors: ['black'],
            priceMin: 50,
            priceMax: 200,
            inStock: true,
        };

        render(
            <FilterSidebar
                filters={activeFilters}
                onFiltersChange={mockOnFiltersChange}
            />
        );

        const clearButtons = screen.getAllByText('Clear all filters');
        fireEvent.click(clearButtons[0]);

        expect(mockOnFiltersChange).toHaveBeenCalledWith({});
    });

    it('does not show clear button when no filters are active', () => {
        render(
            <FilterSidebar
                filters={defaultFilters}
                onFiltersChange={mockOnFiltersChange}
            />
        );

        expect(screen.queryByText('Clear all filters')).not.toBeInTheDocument();
    });

    it('toggles in stock filter', () => {
        render(
            <FilterSidebar
                filters={defaultFilters}
                onFiltersChange={mockOnFiltersChange}
            />
        );

        const inStockCheckboxes = screen.getAllByTestId('in-stock');
        fireEvent.click(inStockCheckboxes[0]);

        expect(mockOnFiltersChange).toHaveBeenCalledWith({
            inStock: true,
        });
    });
});
