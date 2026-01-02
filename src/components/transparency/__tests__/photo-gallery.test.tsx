import { render, screen } from '@testing-library/react';
import { PhotoGallery } from '../photo-gallery';

describe('PhotoGallery', () => {
  const mockImages = [
    { src: '/image1.jpg', alt: 'Test image 1', caption: 'Caption 1' },
    { src: '/image2.jpg', alt: 'Test image 2', caption: 'Caption 2' },
    { src: '/image3.jpg', alt: 'Test image 3', caption: 'Caption 3' },
  ];

  it('renders all images in gallery', () => {
    render(<PhotoGallery images={mockImages} />);

    expect(screen.getByAltText('Test image 1')).toBeInTheDocument();
    expect(screen.getByAltText('Test image 2')).toBeInTheDocument();
    expect(screen.getByAltText('Test image 3')).toBeInTheDocument();
  });

  it('renders captions when provided', () => {
    render(<PhotoGallery images={mockImages} />);

    expect(screen.getByText('Caption 1')).toBeInTheDocument();
    expect(screen.getByText('Caption 2')).toBeInTheDocument();
    expect(screen.getByText('Caption 3')).toBeInTheDocument();
  });

  it('uses grid layout for responsive design', () => {
    const { container } = render(<PhotoGallery images={mockImages} />);

    const grid = container.querySelector('[data-testid="photo-gallery"]');
    expect(grid).toBeInTheDocument();
    expect(grid?.className).toContain('grid');
  });

  it('handles empty images array', () => {
    render(<PhotoGallery images={[]} />);

    const gallery = screen.queryByTestId('photo-gallery');
    expect(gallery).toBeInTheDocument();
  });
});
