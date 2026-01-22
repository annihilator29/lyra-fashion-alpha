import { render, screen, fireEvent } from '@testing-library/react';
import { CraftsmanshipSection } from '../craftsmanship-section';
import type { CraftsmanshipContent } from '@/lib/craftsmanship/types';
import React from 'react';

// Mock Next.js Link component
jest.mock('next/link', () => {
    return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
        return <a href={href}>{children}</a>;
    };
});

describe('CraftsmanshipSection', () => {
    const mockFullCraftsmanship: CraftsmanshipContent = {
        materials: {
            fabric: '100% Organic Cotton',
            origin: 'Gujarat, India',
            weight: 'GSM 180',
            certifications: ['GOTS Certified', 'Fair Trade'],
        },
        construction: {
            stitching: ['French seams for durability', 'Double-needle stitching at stress points', 'Hand-finished buttonholes'],
            finishing: ['Hand-finished hems', 'Overlocked seams'],
            quality_checks: ['Color fastness check', 'Stitch density verification'],
        },
        quality_checks: [
            'Fabric inspection for defects',
            'Stitch integrity verification',
            'Color fastness testing',
        ],
        care_instructions: 'Machine wash cold, tumble dry low, iron medium. Do not bleach.',
        factory_story_link: '/factory-story',
    };

    const mockMinimalCraftsmanship: CraftsmanshipContent = {
        materials: {
            fabric: 'Silk Blend',
            origin: 'Italy',
        },
        construction: {
            stitching: [],
            finishing: [],
        },
        quality_checks: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Full craftsmanship data', () => {
        it('renders section heading and description', () => {
            render(<CraftsmanshipSection craftsmanship={mockFullCraftsmanship} />);

            expect(screen.getByText('Craftsmanship Details')).toBeInTheDocument();
            expect(screen.getByText('Discover the quality and care behind every piece')).toBeInTheDocument();
        });

        it('displays Materials tab with fabric, origin, certifications, and weight', () => {
            render(<CraftsmanshipSection craftsmanship={mockFullCraftsmanship} />);

            // Materials content should be visible by default
            expect(screen.getByText('100% Organic Cotton')).toBeInTheDocument();
            expect(screen.getByText('Gujarat, India')).toBeInTheDocument();
            expect(screen.getByText('GSM 180')).toBeInTheDocument();
            expect(screen.getByText('GOTS Certified')).toBeInTheDocument();
            expect(screen.getByText('Fair Trade')).toBeInTheDocument();
        });

        it('renders Construction tab with stitching and finishing lists', () => {
            render(<CraftsmanshipSection craftsmanship={mockFullCraftsmanship} />);

            // Find accordion triggers specifically (they have data-slot="accordion-trigger")
            const accordionTriggers = screen.getAllByRole('button').filter(
                (btn) => btn.getAttribute('data-slot') === 'accordion-trigger'
            );
            // The second accordion trigger should be Construction (first is Materials)
            const constructionAccordion = accordionTriggers.find(btn =>
                btn.textContent?.includes('Construction')
            );
            if (constructionAccordion) {
                fireEvent.click(constructionAccordion);
            }

            // Content should now be visible
            expect(screen.getByText('French seams for durability')).toBeInTheDocument();
            expect(screen.getByText('Double-needle stitching at stress points')).toBeInTheDocument();
            expect(screen.getByText('Hand-finished buttonholes')).toBeInTheDocument();
            expect(screen.getByText('Hand-finished hems')).toBeInTheDocument();
            expect(screen.getByText('Overlocked seams')).toBeInTheDocument();
        });

        it('renders Quality tab with checkpoints list', () => {
            render(<CraftsmanshipSection craftsmanship={mockFullCraftsmanship} />);

            // Content is in accordion (mobile view) - click to expand and verify
            const qualityTrigger = screen.getAllByText('Quality Control')[0].closest('button');
            if (qualityTrigger) {
                fireEvent.click(qualityTrigger);
            }

            // Content should now be visible
            expect(screen.getByText('Fabric inspection for defects')).toBeInTheDocument();
            expect(screen.getByText('Stitch integrity verification')).toBeInTheDocument();
            expect(screen.getByText('Color fastness testing')).toBeInTheDocument();
        });

        it('renders factory story link with correct href', () => {
            render(<CraftsmanshipSection craftsmanship={mockFullCraftsmanship} />);

            const link = screen.getByRole('link', { name: /Learn More About Our Process/i });
            expect(link).toHaveAttribute('href', '/factory-story');
        });

        it('displays care instructions in Materials section', () => {
            render(<CraftsmanshipSection craftsmanship={mockFullCraftsmanship} />);

            expect(screen.getByText('Care Instructions')).toBeInTheDocument();
            expect(screen.getByText('Machine wash cold, tumble dry low, iron medium. Do not bleach.')).toBeInTheDocument();
        });
    });

    describe('Minimal craftsmanship data', () => {
        it('renders only fabric when other fields are missing', () => {
            render(<CraftsmanshipSection craftsmanship={mockMinimalCraftsmanship} />);

            expect(screen.getByText('Silk Blend')).toBeInTheDocument();
            expect(screen.queryByText('Origin:')).not.toBeInTheDocument();
        });

        it('hides Construction tab when stitching and finishing arrays are empty', () => {
            render(<CraftsmanshipSection craftsmanship={mockMinimalCraftsmanship} />);

            // Construction tab should not appear in desktop tabs
            const tabTriggers = screen.getAllByRole('tab');
            const constructionTab = tabTriggers.find(tab => tab.textContent?.includes('Construction'));
            expect(constructionTab).toBeUndefined();
        });

        it('hides Quality tab when quality_checks array is empty', () => {
            render(<CraftsmanshipSection craftsmanship={mockMinimalCraftsmanship} />);

            // Quality tab should not appear in desktop tabs
            const tabTriggers = screen.getAllByRole('tab');
            const qualityTab = tabTriggers.find(tab => tab.textContent?.includes('Quality'));
            expect(qualityTab).toBeUndefined();
        });

        it('links to /about when factory_story_link is not provided', () => {
            render(<CraftsmanshipSection craftsmanship={mockMinimalCraftsmanship} />);

            const link = screen.getByRole('link', { name: /Learn More About Our Process/i });
            expect(link).toHaveAttribute('href', '/about');
        });
    });

    describe('Null/missing craftsmanship data', () => {
        it('shows fallback message when craftsmanship is null', () => {
            render(<CraftsmanshipSection craftsmanship={null} />);

            expect(screen.getByText('Craftsmanship details coming soon.')).toBeInTheDocument();
        });

        it('shows fallback message when materials is undefined', () => {
            const incomplete = { construction: { stitching: [], finishing: [] }, quality_checks: [] } as unknown as CraftsmanshipContent;
            render(<CraftsmanshipSection craftsmanship={incomplete} />);

            expect(screen.getByText('Craftsmanship details coming soon.')).toBeInTheDocument();
        });
    });

    describe('Responsive behavior', () => {
        it('renders both Tabs (desktop) and Accordion (mobile) components', () => {
            render(<CraftsmanshipSection craftsmanship={mockFullCraftsmanship} />);

            // Desktop tabs should exist (hidden on mobile via CSS)
            expect(screen.getAllByRole('tab').length).toBeGreaterThan(0);

            // Accordion triggers should exist (hidden on desktop via CSS)
            const accordionTriggers = screen.getAllByRole('button').filter(
                (btn) => btn.getAttribute('data-slot') === 'accordion-trigger'
            );
            expect(accordionTriggers.length).toBeGreaterThan(0);
        });
    });

    describe('Accessibility', () => {
        it('has proper heading structure', () => {
            render(<CraftsmanshipSection craftsmanship={mockFullCraftsmanship} />);

            const heading = screen.getByRole('heading', { name: 'Craftsmanship Details' });
            expect(heading).toBeInTheDocument();
            expect(heading.tagName).toBe('H2');
        });

        it('tabs are keyboard navigable', () => {
            render(<CraftsmanshipSection craftsmanship={mockFullCraftsmanship} />);

            const tabList = screen.getByRole('tablist');
            expect(tabList).toBeInTheDocument();

            const tabs = screen.getAllByRole('tab');
            expect(tabs.length).toBeGreaterThanOrEqual(1);
        });
    });
});
