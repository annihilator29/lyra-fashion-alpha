/**
 * Media Section - Image Upload and Management
 * Story 7.2: Product Management Interface
 * Phase 4: Image Upload Component
 */

'use client';

import React, { useCallback, useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// Icons
import { Upload, X, Image as ImageIcon, GripVertical, Loader2, AlertCircle } from 'lucide-react';

// Types
import type { ProductFormData } from './product-form';
import { deleteProductImage } from '@/app/admin/products/actions';

// Sortable Image Item Component
function SortableImageItem({
  imageUrl,
  index,
  onRemove,
  isPrimary,
}: {
  imageUrl: string;
  index: number;
  onRemove: () => void;
  isPrimary: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: imageUrl });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
      {...attributes}
    >
      <div className={`relative aspect-square rounded-lg overflow-hidden border-2 ${isPrimary ? 'border-primary' : 'border-muted'}`}>
        <img
          src={imageUrl}
          alt={`Product image ${index + 1}`}
          className="w-full h-full object-cover"
        />
        
        {/* Primary badge */}
        {isPrimary && (
          <Badge className="absolute top-2 left-2 bg-primary">
            Primary
          </Badge>
        )}

        {/* Drag handle */}
        <div
          className="absolute top-2 right-2 p-1 bg-background/80 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Remove button */}
        <button
          type="button"
          onClick={onRemove}
          className="absolute bottom-2 right-2 p-1 bg-destructive text-destructive-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Image number */}
      <div className="absolute bottom-2 left-2 px-2 py-1 bg-background/80 rounded text-xs font-medium">
        #{index + 1}
      </div>
    </div>
  );
}

export function MediaSection() {
  const { control, setValue, watch } = useFormContext<ProductFormData>();
  const images = watch('images');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end (reordering)
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = images.findIndex((img) => img === active.id);
        const newIndex = images.findIndex((img) => img === over.id);
        const newImages = arrayMove(images, oldIndex, newIndex);
        setValue('images', newImages);
      }
    },
    [images, setValue]
  );

  // Handle file upload
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Validate file count
      if (images.length + acceptedFiles.length > 10) {
        toast.error('Maximum 10 images allowed');
        return;
      }

      setUploading(true);
      setUploadProgress(0);

      try {
        const formData = new FormData();
        acceptedFiles.forEach((file) => {
          formData.append('files', file);
        });

        // Call server action to upload images
        const response = await fetch('/api/admin/products/upload-images', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const result = await response.json();

        if (result.success) {
          const newImages = [...images, ...result.data.urls];
          setValue('images', newImages);
          toast.success(`Uploaded ${result.data.urls.length} image(s)`);
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to upload images');
      } finally {
        setUploading(false);
        setUploadProgress(100);
      }
    },
    [images, setValue]
  );

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 10 - images.length,
    multiple: true,
  });

  // Remove image (also deletes from storage)
  const handleRemoveImage = useCallback(
    async (index: number) => {
      const imageUrl = images[index];
      
      // First delete from storage
      try {
        const result = await deleteProductImage(imageUrl);
        if (!result.success) {
          console.error('Failed to delete image from storage:', result.error);
          // Continue with UI removal even if storage deletion fails
        }
      } catch (error) {
        console.error('Error deleting image from storage:', error);
        // Continue with UI removal
      }
      
      // Remove from form state
      const newImages = images.filter((_, i) => i !== index);
      setValue('images', newImages);
      toast.success('Image removed');
    },
    [images, setValue]
  );

  // Set primary image (move to first position)
  const handleSetPrimary = useCallback(
    (index: number) => {
      if (index === 0) return;
      const newImages = [images[index], ...images.filter((_, i) => i !== index)];
      setValue('images', newImages);
      toast.success('Primary image updated');
    },
    [images, setValue]
  );

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted hover:border-primary/50 hover:bg-muted/50'
          }
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">Uploading images...</p>
            <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
          </div>
        ) : isDragActive ? (
          <div className="space-y-2">
            <Upload className="h-8 w-8 mx-auto text-primary" />
            <p className="text-sm font-medium">Drop the images here...</p>
            <p className="text-xs text-muted-foreground">
              JPEG, PNG, or WebP (max 5MB each)
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm font-medium">
              Drag & drop images here, or click to select
            </p>
            <p className="text-xs text-muted-foreground">
              {10 - images.length} images remaining (max 10)
            </p>
            <p className="text-xs text-muted-foreground">
              JPEG, PNG, or WebP (max 5MB each)
            </p>
          </div>
        )}
      </div>

      {/* Validation Info */}
      {images.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-amber-600">
          <AlertCircle className="h-4 w-4" />
          <span>At least one product image is required</span>
        </div>
      )}

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              Product Images ({images.length}/10)
            </h3>
            <p className="text-xs text-muted-foreground">
              Drag to reorder • First image is primary
            </p>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={images}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {images.map((imageUrl, index) => (
                  <SortableImageItem
                    key={imageUrl}
                    imageUrl={imageUrl}
                    index={index}
                    onRemove={() => handleRemoveImage(index)}
                    isPrimary={index === 0}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Storage Info */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Images are stored in Supabase Storage</p>
        <p>• First image is used as the primary product image</p>
        <p>• Images are automatically optimized for web display</p>
      </div>
    </div>
  );
}
