'use client';

import { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface ImageGalleryProps {
    images: string[];
    productName: string;
    className?: string;
    onImageChange?: (imageUrl: string) => void;
}

/**
 * ImageGallery Component
 *
 * Multi-image gallery with thumbnail navigation and zoom functionality.
 * Follows "Organic Modern" design aesthetic.
 *
 * @example
 * ```tsx
 * <ImageGallery images={product.images} productName={product.name} />
 * ```
 */
export function ImageGallery({
    images,
    productName,
    className,
    onImageChange,
}: ImageGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isZoomed, setIsZoomed] = useState(false);
    const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

    // Handle empty or missing images - use useMemo for stable reference
    const displayImages = useMemo(() => {
        return images?.length > 0 ? images : ['/placeholder-product.jpg'];
    }, [images]);

    const currentImage = displayImages[selectedIndex];
    const hasMultipleImages = displayImages.length > 1;

    const handleThumbnailClick = useCallback(
        (index: number) => {
            setSelectedIndex(index);
            onImageChange?.(displayImages[index]);
        },
        [displayImages, onImageChange]
    );

    const handlePrevious = useCallback(() => {
        const newIndex = selectedIndex === 0 ? displayImages.length - 1 : selectedIndex - 1;
        setSelectedIndex(newIndex);
        onImageChange?.(displayImages[newIndex]);
    }, [selectedIndex, displayImages, onImageChange]);

    const handleNext = useCallback(() => {
        const newIndex = selectedIndex === displayImages.length - 1 ? 0 : selectedIndex + 1;
        setSelectedIndex(newIndex);
        onImageChange?.(displayImages[newIndex]);
    }, [selectedIndex, displayImages, onImageChange]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                handlePrevious();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                handleNext();
            }
        },
        [handlePrevious, handleNext]
    );

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!isZoomed) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPosition({ x, y });
    }, [isZoomed]);

    const toggleZoom = useCallback(() => {
        setIsZoomed((prev) => !prev);
    }, []);

    return (
        <div
            className={cn('flex flex-col gap-4 lg:flex-row lg:gap-6', className)}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="region"
            aria-label="Product image gallery"
        >
            {/* Thumbnails - Left side on desktop, bottom on mobile */}
            {hasMultipleImages && (
                <div className="order-2 flex gap-2 overflow-x-auto lg:order-1 lg:flex-col lg:overflow-y-auto lg:max-h-[600px]">
                    {displayImages.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => handleThumbnailClick(index)}
                            className={cn(
                                'relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all duration-200',
                                'hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                                selectedIndex === index
                                    ? 'border-primary shadow-md'
                                    : 'border-transparent'
                            )}
                            aria-label={`View image ${index + 1} of ${displayImages.length}`}
                            aria-pressed={selectedIndex === index}
                        >
                            <Image
                                src={image}
                                alt={`${productName} - thumbnail ${index + 1}`}
                                fill
                                sizes="64px"
                                className="object-cover"
                                loading="lazy"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Main Image */}
            <div className="relative order-1 flex-1 lg:order-2">
                <div
                    className={cn(
                        'relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-muted cursor-zoom-in',
                        isZoomed && 'cursor-zoom-out'
                    )}
                    onClick={toggleZoom}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setIsZoomed(false)}
                    role="button"
                    aria-label={isZoomed ? 'Click to zoom out' : 'Click to zoom in'}
                >
                    <Image
                        src={currentImage}
                        alt={`${productName} - main image`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className={cn(
                            'object-cover transition-transform duration-300',
                            isZoomed && 'scale-150'
                        )}
                        style={
                            isZoomed
                                ? {
                                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                }
                                : undefined
                        }
                        priority
                    />

                    {/* Zoom indicator */}
                    {!isZoomed && (
                        <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-background/80 px-3 py-1 text-sm text-muted-foreground backdrop-blur-sm">
                            <ZoomIn className="h-4 w-4" />
                            <span>Zoom</span>
                        </div>
                    )}
                </div>

                {/* Navigation arrows */}
                {hasMultipleImages && (
                    <>
                        <button
                            onClick={handlePrevious}
                            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-md backdrop-blur-sm transition-all hover:bg-background hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-md backdrop-blur-sm transition-all hover:bg-background hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            aria-label="Next image"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </>
                )}

                {/* Image counter */}
                {hasMultipleImages && (
                    <div className="absolute bottom-4 left-4 rounded-full bg-background/80 px-3 py-1 text-sm text-muted-foreground backdrop-blur-sm">
                        {selectedIndex + 1} / {displayImages.length}
                    </div>
                )}
            </div>
        </div>
    );
}
