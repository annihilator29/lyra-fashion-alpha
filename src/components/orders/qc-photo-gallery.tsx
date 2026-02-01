'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, ZoomIn, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QCPhotoGalleryProps {
  photoUrl: string;
  orderNumber?: string;
  className?: string;
}

export function QCPhotoGallery({ photoUrl, orderNumber, className }: QCPhotoGalleryProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Graceful degradation if photo fails to load
  if (imageError) {
    return (
      <div className={cn("bg-gray-50 border border-gray-200 rounded-lg p-6 text-center", className)}>
        <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">QC photo unavailable</p>
      </div>
    );
  }

  return (
    <>
      <div className={cn("bg-white rounded-lg border border-gray-200 overflow-hidden", className)}>
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Quality Check Photo</h3>
          <p className="text-sm text-gray-500 mt-1">
            Your finished item before shipping
          </p>
        </div>
        
        <div className="relative aspect-[4/3] bg-gray-100 group cursor-pointer" onClick={() => setIsLightboxOpen(true)}>
          <Image
            src={photoUrl}
            alt={`Quality check photo for order ${orderNumber || ''}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 800px"
            onError={() => setImageError(true)}
          />
          
          {/* Overlay with zoom icon */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3 shadow-lg">
              <ZoomIn className="w-6 h-6 text-gray-700" />
            </div>
          </div>
          
          {/* Click hint */}
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            Click to enlarge
          </div>
        </div>
        
        <div className="p-4 bg-gray-50">
          <p className="text-sm text-gray-600">
            This photo shows your garment after passing our quality inspection. 
            We take pride in showcasing the craftsmanship quality up close.
          </p>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
            onClick={() => setIsLightboxOpen(false)}
          >
            <X className="w-8 h-8" />
          </button>
          
          <div 
            className="relative max-w-5xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photoUrl}
              alt={`Quality check photo for order ${orderNumber || ''} - Full size`}
              width={1200}
              height={900}
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              onError={() => {
                setImageError(true);
                setIsLightboxOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Placeholder component when no QC photo is available
 * Implements graceful degradation per AC-4
 */
export function QCPhotoPlaceholder({ className }: { className?: string }) {
  return (
    <div className={cn("bg-gray-50 border border-gray-200 border-dashed rounded-lg p-8 text-center", className)}>
      <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-700 mb-2">Quality Check Photo</h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto">
        A photo of your finished garment will be available here once it completes quality inspection.
      </p>
    </div>
  );
}
