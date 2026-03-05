/**
 * Craftsmanship Section
 * Product form - Rich content for quality and construction details
 */

'use client';

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';

// UI Components
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Icons
import { Plus, Trash2 } from 'lucide-react';

// Types
import type { ProductFormData } from './product-form';

export function CraftsmanshipSection() {
  const { control, watch, setValue } = useFormContext<ProductFormData>();
  const craftsmanshipContent = watch('craftsmanshipContent');

  const handleAddListItem = (
    field: 'construction' | 'qualityChecks' | 'careInstructions'
  ) => {
    const currentList = craftsmanshipContent?.[field] || [];
    setValue(`craftsmanshipContent.${field}`, [...currentList, '']);
  };

  const handleUpdateListItem = (
    field: 'construction' | 'qualityChecks' | 'careInstructions',
    index: number,
    value: string
  ) => {
    const currentList = craftsmanshipContent?.[field] || [];
    const newList = [...currentList];
    newList[index] = value;
    setValue(`craftsmanshipContent.${field}`, newList);
  };

  const handleRemoveListItem = (
    field: 'construction' | 'qualityChecks' | 'careInstructions',
    index: number
  ) => {
    const currentList = craftsmanshipContent?.[field] || [];
    const newList = currentList.filter((_, i) => i !== index);
    setValue(`craftsmanshipContent.${field}`, newList);
  };

  return (
    <div className="space-y-6">
      {/* Materials */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fabric">Fabric</Label>
          <Controller
            control={control}
            name="craftsmanshipContent.materials.fabric"
            render={({ field }) => (
              <Input
                {...field}
                id="fabric"
                placeholder="e.g., 100% Organic Silk"
              />
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="origin">Origin</Label>
          <Controller
            control={control}
            name="craftsmanshipContent.materials.origin"
            render={({ field }) => (
              <Input
                {...field}
                id="origin"
                placeholder="e.g., Made in Italy"
              />
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="composition">Composition</Label>
          <Controller
            control={control}
            name="craftsmanshipContent.materials.composition"
            render={({ field }) => (
              <Input
                {...field}
                id="composition"
                placeholder="e.g., Outer: 100% Silk, Lining: 100% Cotton"
              />
            )}
          />
        </div>
      </div>

      {/* Construction Details */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Label>Construction Details</Label>
              <p className="text-sm text-muted-foreground">
                Describe how the product is made
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddListItem('construction')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Detail
            </Button>
          </div>
          <div className="space-y-2">
            {craftsmanshipContent?.construction?.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(e) =>
                    handleUpdateListItem('construction', index, e.target.value)
                  }
                  placeholder={`Construction detail ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveListItem('construction', index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            {(!craftsmanshipContent?.construction ||
              craftsmanshipContent.construction.length === 0) && (
              <p className="text-sm text-muted-foreground italic">
                No construction details added yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quality Checks */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Label>Quality Checks</Label>
              <p className="text-sm text-muted-foreground">
                List quality control measures
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddListItem('qualityChecks')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Check
            </Button>
          </div>
          <div className="space-y-2">
            {craftsmanshipContent?.qualityChecks?.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(e) =>
                    handleUpdateListItem('qualityChecks', index, e.target.value)
                  }
                  placeholder={`Quality check ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveListItem('qualityChecks', index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            {(!craftsmanshipContent?.qualityChecks ||
              craftsmanshipContent.qualityChecks.length === 0) && (
              <p className="text-sm text-muted-foreground italic">
                No quality checks added yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Care Instructions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Label>Care Instructions</Label>
              <p className="text-sm text-muted-foreground">
                How to care for this product
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddListItem('careInstructions')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Instruction
            </Button>
          </div>
          <div className="space-y-2">
            {craftsmanshipContent?.careInstructions?.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(e) =>
                    handleUpdateListItem('careInstructions', index, e.target.value)
                  }
                  placeholder={`Care instruction ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveListItem('careInstructions', index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            {(!craftsmanshipContent?.careInstructions ||
              craftsmanshipContent.careInstructions.length === 0) && (
              <p className="text-sm text-muted-foreground italic">
                No care instructions added yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
