import { render, screen, fireEvent } from '@testing-library/react';
import { ImageGallery } from '../image-gallery';
import React from 'react';

// Mock Next.js Image component
jest.mock('next/image', () => ({
    __esModule: true,
    default: ({ src, alt, fill, priority, ...props }: { src: string; alt: string; fill?: boolean; priority?: boolean;[key: string]: unknown }) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} data-fill={fill} data-priority={priority} {...props} />
    ),
}));

describe('ImageGallery', () => {
    const mockImages = [
        '/images/product-1.jpg',
        '/images/product-2.jpg',
        '/images/product-3.jpg',
    ];
    const mockProductName = 'Test Product';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders main image correctly', () => {
        render(<ImageGallery images={mockImages} productName={mockProductName} />);

        const mainImage = screen.getByAltText(`${mockProductName} - main image`);
        expect(mainImage).toBeInTheDocument();
        expect(mainImage).toHaveAttribute('src', mockImages[0]);
    });

    it('renders thumbnails for multiple images', () => {
        render(<ImageGallery images={mockImages} productName={mockProductName} />);

        // Should have 3 thumbnails
        mockImages.forEach((_, index) => {
            const thumbnail = screen.getByAltText(`${mockProductName} - thumbnail ${index + 1}`);
            expect(thumbnail).toBeInTheDocument();
        });
    });

    it('does not render thumbnails for single image', () => {
        render(<ImageGallery images={['/single-image.jpg']} productName={mockProductName} />);

        // Should not find any thumbnails
        expect(screen.queryByAltText(`${mockProductName} - thumbnail 1`)).not.toBeInTheDocument();
    });

    it('updates main image when thumbnail is clicked', () => {
        render(<ImageGallery images={mockImages} productName={mockProductName} />);

        // Click second thumbnail
        const secondThumbnailButton = screen.getByRole('button', {
            name: `View image 2 of ${mockImages.length}`,
        });
        fireEvent.click(secondThumbnailButton);

        // Main image should now show the second image
        const mainImage = screen.getByAltText(`${mockProductName} - main image`);
        expect(mainImage).toHaveAttribute('src', mockImages[1]);
    });

    it('calls onImageChange when thumbnail is clicked', () => {
        const mockOnImageChange = jest.fn();
        render(
            <ImageGallery
                images={mockImages}
                productName={mockProductName}
                onImageChange={mockOnImageChange}
            />
        );

        // Click third thumbnail
        const thirdThumbnailButton = screen.getByRole('button', {
            name: `View image 3 of ${mockImages.length}`,
        });
        fireEvent.click(thirdThumbnailButton);

        expect(mockOnImageChange).toHaveBeenCalledWith(mockImages[2]);
    });

    it('navigates images with arrow buttons', () => {
        render(<ImageGallery images={mockImages} productName={mockProductName} />);

        const mainImage = screen.getByAltText(`${mockProductName} - main image`);
        expect(mainImage).toHaveAttribute('src', mockImages[0]);

        // Click next arrow
        const nextButton = screen.getByRole('button', { name: 'Next image' });
        fireEvent.click(nextButton);
        expect(mainImage).toHaveAttribute('src', mockImages[1]);

        // Click previous arrow
        const prevButton = screen.getByRole('button', { name: 'Previous image' });
        fireEvent.click(prevButton);
        expect(mainImage).toHaveAttribute('src', mockImages[0]);
    });

    it('wraps around when navigating past first/last image', () => {
        render(<ImageGallery images={mockImages} productName={mockProductName} />);

        // Click previous from first image - should go to last
        const prevButton = screen.getByRole('button', { name: 'Previous image' });
        fireEvent.click(prevButton);
        const mainImage = screen.getByAltText(`${mockProductName} - main image`);
        expect(mainImage).toHaveAttribute('src', mockImages[2]);
    });

    it('displays image counter with correct numbers', () => {
        render(<ImageGallery images={mockImages} productName={mockProductName} />);

        expect(screen.getByText('1 / 3')).toBeInTheDocument();

        // Navigate to second image
        const nextButton = screen.getByRole('button', { name: 'Next image' });
        fireEvent.click(nextButton);
        expect(screen.getByText('2 / 3')).toBeInTheDocument();
    });

    it('shows zoom indicator when not zoomed', () => {
        render(<ImageGallery images={mockImages} productName={mockProductName} />);

        expect(screen.getByText('Zoom')).toBeInTheDocument();
    });

    it('handles placeholder for empty images array', () => {
        render(<ImageGallery images={[]} productName={mockProductName} />);

        const mainImage = screen.getByAltText(`${mockProductName} - main image`);
        expect(mainImage).toHaveAttribute('src', '/placeholder-product.jpg');
    });

    it('has accessible region with label', () => {
        render(<ImageGallery images={mockImages} productName={mockProductName} />);

        expect(screen.getByRole('region', { name: 'Product image gallery' })).toBeInTheDocument();
    });
});
