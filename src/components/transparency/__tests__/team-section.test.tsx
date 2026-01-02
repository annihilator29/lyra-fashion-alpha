import { render, screen } from '@testing-library/react';
import { TeamSection } from '../team-section';

describe('TeamSection', () => {
  const mockMembers = [
    {
      name: 'Priya Sharma',
      role: 'Head Artisan',
      bio: '15 years of experience in traditional textile craftsmanship',
      photo: '/images/team-1.jpg',
    },
    {
      name: 'Rajesh Kumar',
      role: 'Quality Assurance Lead',
      bio: 'Ensures every piece meets our exacting standards',
    },
  ];

  it('renders team section title', () => {
    render(<TeamSection members={mockMembers} />);

    expect(screen.getByText('Meet Our Artisans')).toBeInTheDocument();
  });

  it('renders team section description', () => {
    render(<TeamSection members={mockMembers} />);

    expect(
      screen.getByText('The skilled craftspeople behind every garment we create')
    ).toBeInTheDocument();
  });

  it('renders all team members', () => {
    render(<TeamSection members={mockMembers} />);

    expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
    expect(screen.getByText('Rajesh Kumar')).toBeInTheDocument();
  });

  it('renders member roles', () => {
    render(<TeamSection members={mockMembers} />);

    expect(screen.getByText('Head Artisan')).toBeInTheDocument();
    expect(screen.getByText('Quality Assurance Lead')).toBeInTheDocument();
  });

  it('renders member bios when provided', () => {
    render(<TeamSection members={mockMembers} />);

    expect(
      screen.getByText('15 years of experience in traditional textile craftsmanship')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Ensures every piece meets our exacting standards')
    ).toBeInTheDocument();
  });

  it('renders member photos when provided', () => {
    render(<TeamSection members={mockMembers} />);

    const images = screen.getAllByAltText(/Priya|Rajesh/);
    expect(images.length).toBeGreaterThan(0);
  });

  it('renders placeholder icon when no photo provided', () => {
    const membersWithoutPhoto = [
      {
        name: 'Test Member',
        role: 'Test Role',
        bio: 'Test bio',
      },
    ];

    const { container } = render(<TeamSection members={membersWithoutPhoto} />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders with default members when none provided', () => {
    render(<TeamSection />);

    expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
    expect(screen.getByText('Rajesh Kumar')).toBeInTheDocument();
  });
});
