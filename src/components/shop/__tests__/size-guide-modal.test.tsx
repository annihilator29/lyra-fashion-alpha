import { render, screen } from '@testing-library/react';
import { SizeGuideModal } from '../size-guide-modal';
import React from 'react';

// Mock the UI components
jest.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, className, ...props }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
        <button onClick={onClick} className={className} {...props}>
            {children}
        </button>
    ),
}));

jest.mock('@/components/ui/dialog', () => ({
    Dialog: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog">{children}</div>,
    DialogContent: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="dialog-content">{children}</div>
    ),
    DialogDescription: ({ children }: { children: React.ReactNode }) => (
        <p data-testid="dialog-description">{children}</p>
    ),
    DialogHeader: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="dialog-header">{children}</div>
    ),
    DialogTitle: ({ children }: { children: React.ReactNode }) => (
        <h2 data-testid="dialog-title">{children}</h2>
    ),
    DialogTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
        <div data-testid="dialog-trigger" data-aschild={asChild}>
            {children}
        </div>
    ),
}));

describe('SizeGuideModal', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders size guide trigger button', () => {
        render(<SizeGuideModal category="dresses" />);

        // Size Guide appears in both button and title
        const sizeGuideTexts = screen.getAllByText('Size Guide');
        expect(sizeGuideTexts.length).toBeGreaterThanOrEqual(1);
    });

    it('displays modal title and description', () => {
        render(<SizeGuideModal category="dresses" />);

        expect(screen.getByTestId('dialog-title')).toHaveTextContent('Size Guide');
        expect(screen.getByTestId('dialog-description')).toHaveTextContent(
            'Find your perfect fit with our measurement guide for dresses.'
        );
    });

    it('shows measurement table for dresses category', () => {
        render(<SizeGuideModal category="dresses" />);

        // Should show all measurement columns for dresses
        expect(screen.getByText('Size')).toBeInTheDocument();
        expect(screen.getByText('Bust')).toBeInTheDocument();
        expect(screen.getByText('Waist')).toBeInTheDocument();
        expect(screen.getByText('Hip')).toBeInTheDocument();
        expect(screen.getByText('Length')).toBeInTheDocument();

        // Should show size rows
        expect(screen.getByText('XS')).toBeInTheDocument();
        expect(screen.getByText('S')).toBeInTheDocument();
        expect(screen.getByText('M')).toBeInTheDocument();
        expect(screen.getByText('L')).toBeInTheDocument();
        expect(screen.getByText('XL')).toBeInTheDocument();
    });

    it('shows measurement table for tops category', () => {
        render(<SizeGuideModal category="tops" />);

        // Description should mention tops
        expect(screen.getByTestId('dialog-description')).toHaveTextContent(
            'Find your perfect fit with our measurement guide for tops.'
        );

        // Should show measurement columns
        expect(screen.getByText('Size')).toBeInTheDocument();
        expect(screen.getByText('Bust')).toBeInTheDocument();
    });

    it('shows measurement table for bottoms category', () => {
        render(<SizeGuideModal category="bottoms" />);

        // Description should mention bottoms
        expect(screen.getByTestId('dialog-description')).toHaveTextContent(
            'Find your perfect fit with our measurement guide for bottoms.'
        );
    });

    it('shows measurement table for outerwear category', () => {
        render(<SizeGuideModal category="outerwear" />);

        // Description should mention outerwear
        expect(screen.getByTestId('dialog-description')).toHaveTextContent(
            'Find your perfect fit with our measurement guide for outerwear.'
        );
    });

    it('shows measurement table for accessories category', () => {
        render(<SizeGuideModal category="accessories" />);

        // Should show "One Size" row
        expect(screen.getByText('One Size')).toBeInTheDocument();
    });

    it('displays How to Measure section', () => {
        render(<SizeGuideModal category="dresses" />);

        expect(screen.getByText('How to Measure')).toBeInTheDocument();
        expect(screen.getByText(/Measure around the fullest part of your bust/)).toBeInTheDocument();
        expect(screen.getByText(/Measure around your natural waistline/)).toBeInTheDocument();
        expect(screen.getByText(/Measure around the fullest part of your hips/)).toBeInTheDocument();
        expect(screen.getByText(/Measure from the highest point of your shoulder/)).toBeInTheDocument();
    });

    it('displays sizing tip', () => {
        render(<SizeGuideModal category="dresses" />);

        expect(screen.getByText(/If you're between sizes/)).toBeInTheDocument();
        expect(screen.getByText(/we recommend sizing up/)).toBeInTheDocument();
    });

    it('falls back to dresses for unknown category', () => {
        render(<SizeGuideModal category="unknown-category" />);

        // Should still show size guide with dresses measurements (fallback)
        expect(screen.getByText('XS')).toBeInTheDocument();
        expect(screen.getByText('S')).toBeInTheDocument();
        expect(screen.getByText('M')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
        render(<SizeGuideModal category="dresses" className="custom-class" />);

        const trigger = screen.getByTestId('dialog-trigger');
        const button = trigger.querySelector('button');
        expect(button).toHaveClass('custom-class');
    });
});
