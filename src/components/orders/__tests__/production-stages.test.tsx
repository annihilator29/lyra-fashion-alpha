import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProductionStages } from '../production-stages';
import { ProductionStages as ProductionStagesType } from '@/types/order';

// Mock the getCraftsmanshipMessage function
jest.mock('@/lib/orders/craftsmanship-messages', () => ({
  getCraftsmanshipMessage: jest.fn(() => 'Test craftsmanship message')
}));

// Mock the cn utility
jest.mock('@/lib/utils', () => ({
  cn: (...inputs: (string | undefined | null | false)[]) => inputs.filter(Boolean).join(' ')
}));

describe('ProductionStages', () => {
  const createStages = (overrides: Partial<ProductionStagesType> = {}): ProductionStagesType => ({
    cutting: { status: 'not_started' },
    sewing: { status: 'not_started' },
    finishing: { status: 'not_started' },
    qc: { status: 'not_started' },
    ...overrides
  });

  describe('Initial State - All Not Started', () => {
    it('renders all four stages with not_started status', () => {
      const stages = createStages();
      render(<ProductionStages stages={stages} />);
      
      // Use getAllByText since component renders both desktop and mobile layouts
      expect(screen.getAllByText('Cutting').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Sewing').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Finishing').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Quality Check').length).toBeGreaterThanOrEqual(1);
    });

    it('displays not started status indicators', () => {
      const stages = createStages();
      render(<ProductionStages stages={stages} />);
      
      const notStartedIndicators = screen.getAllByText(/not started|pending/i);
      expect(notStartedIndicators.length).toBeGreaterThanOrEqual(4);
    });

    it('does not show craftsmanship message when no stage is in progress', () => {
      const stages = createStages();
      render(<ProductionStages stages={stages} />);
      
      // The amber box with quote marks contains the craftsmanship message
      // Should not be present when no stage is in progress
      expect(screen.queryByText(/test craftsmanship message/i)).not.toBeInTheDocument();
    });
  });

  describe('Cutting Stage States', () => {
    it('shows cutting as in progress', () => {
      const stages = createStages({
        cutting: { status: 'in_progress', started_at: '2026-02-01T10:00:00Z' }
      });
      render(<ProductionStages stages={stages} />);
      
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('shows cutting as completed with timestamp', () => {
      const stages = createStages({
        cutting: { status: 'completed', started_at: '2026-02-01T10:00:00Z', completed_at: '2026-02-01T14:00:00Z' }
      });
      render(<ProductionStages stages={stages} />);
      
      const completedTexts = screen.getAllByText(/completed|done/i);
      expect(completedTexts.length).toBeGreaterThanOrEqual(1);
    });

    it('displays started timestamp for in-progress cutting', () => {
      const startedAt = '2026-02-01T10:00:00Z';
      const stages = createStages({
        cutting: { status: 'in_progress', started_at: startedAt }
      });
      render(<ProductionStages stages={stages} />);
      
      // Should show timestamp - use getAllByText since both layouts show it
      const startedElements = screen.getAllByText(/started:/i);
      expect(startedElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Sequential Progression', () => {
    it('shows cutting completed, sewing in progress', () => {
      const stages = createStages({
        cutting: { status: 'completed', started_at: '2026-02-01T08:00:00Z', completed_at: '2026-02-01T12:00:00Z' },
        sewing: { status: 'in_progress', started_at: '2026-02-01T13:00:00Z' }
      });
      render(<ProductionStages stages={stages} />);
      
      // Should show Sewing stage
      expect(screen.getAllByText('Sewing').length).toBeGreaterThanOrEqual(1);
      // Should show both completed and in progress states
      const completedTexts = screen.getAllByText(/completed|done/i);
      expect(completedTexts.length).toBeGreaterThanOrEqual(1);
    });

    it('shows all stages completed', () => {
      const stages = createStages({
        cutting: { status: 'completed', started_at: '2026-02-01T08:00:00Z', completed_at: '2026-02-01T10:00:00Z' },
        sewing: { status: 'completed', started_at: '2026-02-01T11:00:00Z', completed_at: '2026-02-01T14:00:00Z' },
        finishing: { status: 'completed', started_at: '2026-02-01T15:00:00Z', completed_at: '2026-02-01T17:00:00Z' },
        qc: { status: 'completed', started_at: '2026-02-01T18:00:00Z', completed_at: '2026-02-01T20:00:00Z' }
      });
      render(<ProductionStages stages={stages} />);
      
      const completedIndicators = screen.getAllByText(/completed|done/i);
      expect(completedIndicators.length).toBeGreaterThanOrEqual(4);
    });

    it('shows halfway through production - cutting and sewing completed, finishing in progress', () => {
      const stages = createStages({
        cutting: { status: 'completed', started_at: '2026-02-01T08:00:00Z', completed_at: '2026-02-01T12:00:00Z' },
        sewing: { status: 'completed', started_at: '2026-02-01T13:00:00Z', completed_at: '2026-02-01T16:00:00Z' },
        finishing: { status: 'in_progress', started_at: '2026-02-01T17:00:00Z' }
      });
      render(<ProductionStages stages={stages} />);
      
      expect(screen.getAllByText('Finishing').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Quality Check').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Craftsmanship Message', () => {
    it('shows craftsmanship message when showCraftsmanshipMessage is true and stage is in progress', () => {
      const stages = createStages({
        sewing: { status: 'in_progress', started_at: '2026-02-01T10:00:00Z' }
      });
      render(<ProductionStages stages={stages} showCraftsmanshipMessage={true} />);
      
      expect(screen.getByText(/test craftsmanship message/i)).toBeInTheDocument();
    });

    it('hides craftsmanship message when showCraftsmanshipMessage is false', () => {
      const stages = createStages({
        sewing: { status: 'in_progress', started_at: '2026-02-01T10:00:00Z' }
      });
      render(<ProductionStages stages={stages} showCraftsmanshipMessage={false} />);
      
      expect(screen.queryByText(/test craftsmanship message/i)).not.toBeInTheDocument();
    });
  });

  describe('Responsive Layout', () => {
    it('renders horizontal layout on desktop (hidden on mobile)', () => {
      const stages = createStages();
      const { container } = render(<ProductionStages stages={stages} />);
      
      // Desktop layout should have hidden class on mobile
      const desktopLayout = container.querySelector('.hidden.md\\:flex');
      expect(desktopLayout).toBeInTheDocument();
    });

    it('renders vertical layout on mobile (hidden on desktop)', () => {
      const stages = createStages();
      const { container } = render(<ProductionStages stages={stages} />);
      
      // Mobile layout should have md:hidden class
      const mobileLayout = container.querySelector('.md\\:hidden');
      expect(mobileLayout).toBeInTheDocument();
    });
  });

  describe('Stage Configurations', () => {
    it('renders correct stage labels', () => {
      const stages = createStages();
      render(<ProductionStages stages={stages} />);
      
      expect(screen.getAllByText('Precision fabric cutting').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Expert craftsmanship').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Final touches & details').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Rigorous inspection').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles null timestamps gracefully', () => {
      const stages = createStages({
        cutting: { status: 'in_progress' } // no started_at
      });
      render(<ProductionStages stages={stages} />);
      
      // Should render without crashing
      expect(screen.getAllByText('Cutting').length).toBeGreaterThanOrEqual(1);
    });

    it('handles undefined timestamps gracefully', () => {
      const stages: ProductionStagesType = {
        cutting: { status: 'completed', started_at: undefined, completed_at: undefined },
        sewing: { status: 'not_started' },
        finishing: { status: 'not_started' },
        qc: { status: 'not_started' }
      };
      render(<ProductionStages stages={stages} />);
      
      // Should render without crashing
      expect(screen.getAllByText('Cutting').length).toBeGreaterThanOrEqual(1);
    });

    it('applies custom className', () => {
      const stages = createStages();
      const { container } = render(<ProductionStages stages={stages} className="custom-class" />);
      
      // Should include custom class
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('handles completed stages without timestamps', () => {
      const stages = createStages({
        cutting: { status: 'completed' } // no timestamps
      });
      render(<ProductionStages stages={stages} />);
      
      // Should render without crashing
      expect(screen.getAllByText('Cutting').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Production Progress', () => {
    it('displays production progress heading', () => {
      const stages = createStages();
      render(<ProductionStages stages={stages} />);
      
      expect(screen.getByRole('heading', { name: /production progress/i })).toBeInTheDocument();
    });
  });
});
