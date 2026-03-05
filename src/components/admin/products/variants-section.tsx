/**
 * Variants Section - Size/Color Matrix with Inventory
 * Story 7.2: Product Management Interface
 * Phase 5: Variant Manager Component
 */

'use client';

import React, { useCallback, useState } from 'react';
import { useFormContext, useFieldArray, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { HexColorPicker } from 'react-colorful';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

// Icons
import { Plus, Trash2, Edit, Palette, AlertCircle } from 'lucide-react';

// Types
import type { ProductFormData } from './product-form';

// Size presets
const SIZE_PRESETS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const CUSTOM_SIZE = 'Custom';

export function VariantsSection() {
  const { control, watch, setValue, getValues } = useFormContext<ProductFormData>();
  const [colorPickerOpen, setColorPickerOpen] = useState<string | null>(null);
  const [addVariantDialogOpen, setAddVariantDialogOpen] = useState(false);
  const [newVariant, setNewVariant] = useState<{
    size: string;
    customSize: string;
    color: string;
    colorHex: string;
  }>({
    size: 'S',
    customSize: '',
    color: '',
    colorHex: '#000000',
  });
  const [customSizeInput, setCustomSizeInput] = useState(false);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  });

  const variants = watch('variants');
  const basePrice = watch('price');
  const productSlug = watch('slug');
  const productName = watch('name');

  // Generate SKU from pattern: {PRODUCT-BASE-SKU}-{SIZE}-{COLOR}
  // Uses product name/slug to create a base SKU prefix
  const generateSKU = useCallback(
    (size: string, color: string, index: number) => {
      // Create base SKU from product name (first 3 chars of each word, uppercase)
      const basePrefix = productName
        ? productName
            .toUpperCase()
            .replace(/[^A-Z0-9\s]/g, '')
            .split(/\s+/)
            .map(word => word.substring(0, 3))
            .join('')
            .substring(0, 6)
        : productSlug
          ? productSlug.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 6)
          : 'PROD';
      
      // Clean size and color for SKU
      const sizeCode = size.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const colorCode = color.toUpperCase().replace(/[^A-Z0-9]/g, '');
      
      return `${basePrefix}-${sizeCode}-${colorCode}`;
    },
    [productSlug, productName]
  );

  // Add new variant
  const handleAddVariant = useCallback(() => {
    if (!newVariant.color) {
      toast.error('Color is required');
      return;
    }

    const finalSize = customSizeInput && newVariant.customSize 
      ? newVariant.customSize 
      : newVariant.size;

    if (!finalSize) {
      toast.error('Size is required');
      return;
    }

    append({
      sku: generateSKU(finalSize, newVariant.color, fields.length),
      size: finalSize,
      color: newVariant.color,
      colorHex: newVariant.colorHex,
      priceModifier: 0,
      inventory: 0,
      isOutOfStock: false,
    });

    setAddVariantDialogOpen(false);
    setNewVariant({
      size: 'S',
      customSize: '',
      color: '',
      colorHex: '#000000',
    });
    setCustomSizeInput(false);
    toast.success('Variant added');
  }, [newVariant, customSizeInput, generateSKU, fields.length, append]);

  // Remove variant
  const handleRemoveVariant = useCallback(
    (index: number) => {
      if (fields.length <= 1) {
        toast.error('At least one variant is required');
        return;
      }
      remove(index);
      toast.success('Variant removed');
    },
    [fields.length, remove]
  );

  // Auto-generate all size/color combinations
  const handleGenerateAllVariants = useCallback(() => {
    const sizes = SIZE_PRESETS;
    const existingColors = Array.from(new Set(variants.map((v) => v.color)));

    if (existingColors.length === 0) {
      toast.error('Please add at least one color first');
      return;
    }

    const newVariants: any[] = [];
    sizes.forEach((size) => {
      existingColors.forEach((color) => {
        const exists = variants.some(
          (v) => v.size === size && v.color === color
        );
        if (!exists) {
          newVariants.push({
            sku: generateSKU(size, color, variants.length + newVariants.length),
            size,
            color,
            colorHex: variants.find((v) => v.color === color)?.colorHex || '#000000',
            priceModifier: 0,
            inventory: 0,
            isOutOfStock: false,
          });
        }
      });
    });

    if (newVariants.length === 0) {
      toast.info('All variants already exist');
      return;
    }

    newVariants.forEach((variant) => append(variant));
    toast.success(`Added ${newVariants.length} variants`);
  }, [variants, generateSKU, append]);

  // Bulk update inventory
  const handleBulkUpdateInventory = useCallback(
    (quantity: number) => {
      const updatedVariants = variants.map((v) => ({
        ...v,
        inventory: quantity,
      }));
      setValue('variants', updatedVariants);
      toast.success(`Updated inventory for all variants to ${quantity}`);
    },
    [variants, setValue]
  );

  // Bulk update price modifier
  const handleBulkUpdatePrice = useCallback(
    (modifier: number) => {
      const updatedVariants = variants.map((v) => ({
        ...v,
        priceModifier: modifier,
      }));
      setValue('variants', updatedVariants);
      toast.success(`Updated price modifier for all variants`);
    },
    [variants, setValue]
  );

  return (
    <div className="space-y-6">
      {/* Quick Add Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium">Quick Add Variants</h3>
              <p className="text-sm text-muted-foreground">
                Generate all size combinations for existing colors
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateAllVariants}
              >
                <Plus className="h-4 w-4 mr-2" />
                Generate All Sizes
              </Button>
              <Dialog open={addVariantDialogOpen} onOpenChange={setAddVariantDialogOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variant
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Variant</DialogTitle>
                    <DialogDescription>
                      Add a new size and color combination
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="size">Size</Label>
                      <Select
                        value={customSizeInput ? CUSTOM_SIZE : newVariant.size}
                        onValueChange={(value) => {
                          if (value === CUSTOM_SIZE) {
                            setCustomSizeInput(true);
                          } else {
                            setCustomSizeInput(false);
                            setNewVariant({ ...newVariant, size: value });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SIZE_PRESETS.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                          <SelectItem value={CUSTOM_SIZE}>Custom...</SelectItem>
                        </SelectContent>
                      </Select>
                      {customSizeInput && (
                        <Input
                          placeholder="Enter custom size (e.g., 28W, Petite, Tall)"
                          value={newVariant.customSize}
                          onChange={(e) => setNewVariant({ ...newVariant, customSize: e.target.value })}
                          className="mt-2"
                        />
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="color">Color Name</Label>
                      <Input
                        id="color"
                        value={newVariant.color}
                        onChange={(e) =>
                          setNewVariant({ ...newVariant, color: e.target.value })
                        }
                        placeholder="e.g., Red, Navy, Black"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="colorHex">Color Hex Code</Label>
                      <div className="flex gap-2">
                        <div className="relative">
                          <div
                            className="w-10 h-10 rounded border cursor-pointer"
                            style={{ backgroundColor: newVariant.colorHex }}
                            onClick={() =>
                              setColorPickerOpen(
                                colorPickerOpen ? null : 'new'
                              )
                            }
                          />
                          {colorPickerOpen === 'new' && (
                            <div className="absolute bottom-full left-0 mb-2 z-10">
                              <HexColorPicker
                                color={newVariant.colorHex}
                                onChange={(color) =>
                                  setNewVariant({ ...newVariant, colorHex: color })
                                }
                              />
                            </div>
                          )}
                        </div>
                        <Input
                          id="colorHex"
                          value={newVariant.colorHex}
                          onChange={(e) =>
                            setNewVariant({
                              ...newVariant,
                              colorHex: e.target.value,
                            })
                          }
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAddVariantDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="button" onClick={handleAddVariant}>
                      Add Variant
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="flex gap-2 mb-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const quantity = prompt('Enter inventory quantity for all variants:');
                if (quantity && !isNaN(parseInt(quantity))) {
                  handleBulkUpdateInventory(parseInt(quantity));
                }
              }}
            >
              Set All Inventory
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const modifier = prompt('Enter price modifier in cents (e.g., 500 for +$5):');
                if (modifier && !isNaN(parseInt(modifier))) {
                  handleBulkUpdatePrice(parseInt(modifier));
                }
              }}
            >
              Set All Price Modifier
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Variants Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">SKU</TableHead>
              <TableHead className="w-[100px]">Size</TableHead>
              <TableHead className="w-[150px]">Color</TableHead>
              <TableHead className="w-[120px]">Price</TableHead>
              <TableHead className="w-[120px]">Inventory</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field, index) => {
              const variant = variants[index];
              const finalPrice = basePrice + (variant.priceModifier || 0);

              return (
                <TableRow key={field.id}>
                  <TableCell>
                    <Controller
                      control={control}
                      name={`variants.${index}.sku`}
                      render={({ field }) => (
                        <Input {...field} className="w-32 text-xs font-mono" />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      control={control}
                      name={`variants.${index}.size`}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SIZE_PRESETS.map((size) => (
                              <SelectItem key={size} value={size}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Controller
                        control={control}
                        name={`variants.${index}.color`}
                        render={({ field }) => (
                          <Input {...field} className="w-32" />
                        )}
                      />
                      <Controller
                        control={control}
                        name={`variants.${index}.colorHex`}
                        render={({ field }) => (
                          <div
                            className="w-6 h-6 rounded border cursor-pointer"
                            style={{ backgroundColor: field.value }}
                            onClick={() =>
                              setColorPickerOpen(
                                colorPickerOpen === `variant-${index}` ? null : `variant-${index}`
                              )
                            }
                          />
                        )}
                      />
                      {colorPickerOpen === `variant-${index}` && (
                        <div className="absolute z-10">
                          <Controller
                            control={control}
                            name={`variants.${index}.colorHex`}
                            render={({ field }) => (
                              <HexColorPicker
                                color={field.value}
                                onChange={field.onChange}
                              />
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        ${(finalPrice / 100).toFixed(2)}
                      </div>
                      <Controller
                        control={control}
                        name={`variants.${index}.priceModifier`}
                        render={({ field }) => (
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            className="w-24 text-xs"
                            placeholder="Modifier"
                          />
                        )}
                      />
                      <p className="text-xs text-muted-foreground">
                        {variant.priceModifier && variant.priceModifier > 0
                          ? `+${(variant.priceModifier / 100).toFixed(2)}`
                          : variant.priceModifier && variant.priceModifier < 0
                          ? `-${(Math.abs(variant.priceModifier) / 100).toFixed(2)}`
                          : 'Base price'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Controller
                      control={control}
                      name={`variants.${index}.inventory`}
                      render={({ field }) => (
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          className="w-24"
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Controller
                        control={control}
                        name={`variants.${index}.isOutOfStock`}
                        render={({ field }) => (
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                      <Label className="text-sm">Out of stock</Label>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveVariant(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Validation */}
      {fields.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-amber-600">
          <AlertCircle className="h-4 w-4" />
          <span>At least one variant is required</span>
        </div>
      )}

      {/* Info */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• SKU is auto-generated but can be customized</p>
        <p>• Price modifier is added to the base price (in cents)</p>
        <p>• Mark variants as "Out of stock" to hide from storefront</p>
        <p>• Use bulk actions to quickly set inventory and prices</p>
      </div>
    </div>
  );
}
