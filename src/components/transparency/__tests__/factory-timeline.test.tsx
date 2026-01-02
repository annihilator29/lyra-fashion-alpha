import { render, screen } from '@testing-library/react';
import { FactoryTimeline } from '../factory-timeline';

describe('FactoryTimeline', () => {
  const mockStages = [
    { stage: 'Design', description: 'Initial design and pattern creation' },
    { stage: 'Cutting', description: 'Precision cutting of fabric pieces' },
    { stage: 'Sewing', description: 'Expert assembly by skilled artisans' },
    { stage: 'Finishing', description: 'Quality control and final touches' },
  ];

  it('renders all timeline stages', () => {
    render(<FactoryTimeline stages={mockStages} />);

    expect(screen.getAllByText('Design')).toHaveLength(2); // Mobile + desktop
    expect(screen.getAllByText('Cutting')).toHaveLength(2);
    expect(screen.getAllByText('Sewing')).toHaveLength(2);
    expect(screen.getAllByText('Finishing')).toHaveLength(2);
  });

  it('renders stage descriptions', () => {
    render(<FactoryTimeline stages={mockStages} />);

    expect(screen.getAllByText('Initial design and pattern creation')).toHaveLength(2);
    expect(screen.getAllByText('Precision cutting of fabric pieces')).toHaveLength(2);
    expect(screen.getAllByText('Expert assembly by skilled artisans')).toHaveLength(2);
    expect(screen.getAllByText('Quality control and final touches')).toHaveLength(2);
  });

  it('renders timeline with correct structure', () => {
    const { container } = render(<FactoryTimeline stages={mockStages} />);

    const timelineContainer = container.querySelector('[data-testid="timeline"]');
    expect(timelineContainer).toBeInTheDocument();
  });
});
