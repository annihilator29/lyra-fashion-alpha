/**
 * Craftsmanship Editor Form Component
 * 
 * Admin interface for editing product craftsmanship content.
 * Provides structured form fields for materials, construction, and quality sections.
 * 
 * @module components/admin/craftsmanship-form
 */

'use client';

import { useState } from 'react';
import { saveCraftsmanshipContent } from '@/app/actions/craftsmanship';
import type { CraftsmanshipContent } from '@/lib/craftsmanship/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle2, Loader2, Save } from 'lucide-react';

interface CraftsmanshipEditorFormProps {
  productId: string;
  initialData?: CraftsmanshipContent | null;
  productName?: string;
}

/**
 * Initial empty form data structure
 */
const initialFormData: CraftsmanshipContent = {
  materials: {
    fabric: '',
    origin: '',
    weight: '',
    certifications: []
  },
  construction: {
    stitching: [''],
    finishing: [''],
    quality_checks: []
  },
  quality_checks: ['']
};

/**
 * Normalize craftsmanship content to the new structure
 * Handles migration from old flat structure to new nested structure
 */
function normalizeCraftsmanshipData(data: unknown): CraftsmanshipContent {
  // If data is null/undefined, return initial data
  if (!data) {
    return initialFormData;
  }

  const content = data as Record<string, unknown>;

  // Check if it's the new structure (construction has stitching property)
  if (content.construction && typeof content.construction === 'object' && 
      'stitching' in (content.construction as Record<string, unknown>)) {
    return data as CraftsmanshipContent;
  }

  // Old structure: construction was a flat string[]
  // Convert to new structure
  const oldConstruction = content.construction;
  const newConstruction = Array.isArray(oldConstruction) 
    ? { stitching: [...oldConstruction], finishing: [], quality_checks: [] }
    : { stitching: [''], finishing: [''], quality_checks: [] };

  // Old structure: materials was flat object
  const oldMaterials = content.materials as Record<string, unknown> | undefined;
  const newMaterials = {
    fabric: (oldMaterials?.fabric as string) || '',
    origin: (oldMaterials?.origin as string) || '',
    weight: '',
    certifications: (oldMaterials?.certifications as string[]) || []
  };

  // Old structure: quality_checks was flat array
  const oldQualityChecks = content.quality_checks;
  const newQualityChecks = Array.isArray(oldQualityChecks) ? [...oldQualityChecks] : [];

  return {
    materials: newMaterials,
    construction: newConstruction,
    quality_checks: newQualityChecks,
    care_instructions: (content.care_instructions as string) || '',
    factory_story_link: (content.factory_story_link as string) || ''
  };
}

export function CraftsmanshipEditorForm({
  productId,
  initialData,
  productName
}: CraftsmanshipEditorFormProps) {
  const normalizedData = normalizeCraftsmanshipData(initialData);
  const [formData, setFormData] = useState<CraftsmanshipContent>(normalizedData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Handle text input changes
  const handleTextChange = (
    section: keyof CraftsmanshipContent,
    field: string,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as object),
        [field]: value
      }
    }));
  };

  // Handle array field changes (stitching, finishing, quality_checks)
  const handleArrayChange = (
    section: 'construction' | 'quality_checks',
    field: string,
    index: number,
    value: string
  ) => {
    setFormData(prev => {
      const sectionData = prev[section] as unknown as Record<string, unknown[]>;
      const newArray = [...sectionData[field]];
      newArray[index] = value;
      
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [field]: newArray
        }
      };
    });
  };

  // Add new item to array
  const addArrayItem = (
    section: 'construction' | 'quality_checks',
    field: string,
    defaultValue: string = ''
  ) => {
    setFormData(prev => {
      const sectionData = prev[section] as unknown as Record<string, unknown[]>;
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [field]: [...sectionData[field], defaultValue]
        }
      };
    });
  };

  // Remove item from array
  const removeArrayItem = (
    section: 'construction' | 'quality_checks',
    field: string,
    index: number
  ) => {
    setFormData(prev => {
      const sectionData = prev[section] as unknown as Record<string, unknown[]>;
      const newArray = [...sectionData[field]];
      newArray.splice(index, 1);
      
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [field]: newArray
        }
      };
    });
  };

  // Handle certifications array
  const handleCertificationsChange = (index: number, value: string) => {
    setFormData(prev => {
      const newCerts = [...(prev.materials.certifications || [])];
      newCerts[index] = value;
      return {
        ...prev,
        materials: {
          ...prev.materials,
          certifications: newCerts
        }
      };
    });
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      materials: {
        ...prev.materials,
        certifications: [...(prev.materials.certifications || []), '']
      }
    }));
  };

  const removeCertification = (index: number) => {
    setFormData(prev => {
      const newCerts = [...(prev.materials.certifications || [])];
      newCerts.splice(index, 1);
      return {
        ...prev,
        materials: {
          ...prev.materials,
          certifications: newCerts
        }
      };
    });
  };

  // Save form data
  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    setErrorMessage('');

    // Clean up empty array items before saving
    const cleanedData: CraftsmanshipContent = {
      ...formData,
      construction: {
        stitching: formData.construction.stitching.filter(s => s.trim()),
        finishing: formData.construction.finishing.filter(f => f.trim()),
        quality_checks: formData.construction.quality_checks?.filter(q => q.trim()) || []
      },
      quality_checks: formData.quality_checks.filter(q => q.trim()),
      materials: {
        ...formData.materials,
        certifications: formData.materials.certifications?.filter(c => c.trim()) || []
      }
    };

    console.log('Saving craftsmanship data:', JSON.stringify(cleanedData, null, 2));
    const result = await saveCraftsmanshipContent(productId, cleanedData);
    console.log('Save result:', result);

    if (result.success) {
      setSaveStatus('success');
    } else {
      setSaveStatus('error');
      // Show detailed error message
      const errorDetails = result.error;
      console.log('Error details:', errorDetails); // Debug log
      
      if (errorDetails.code === 'VALIDATION_ERROR' && 'details' in errorDetails) {
        const details = errorDetails.details as { issues: { path: (string | number | symbol)[]; message: string }[] };
        console.log('Validation details:', details); // Debug log
        
        // Extract validation issues
        let errorMessages = 'Validation failed';
        if (details.issues && Array.isArray(details.issues) && details.issues.length > 0) {
          errorMessages = details.issues.map(issue => {
            const path = issue.path.join('.');
            return `${path}: ${issue.message}`;
          }).join(', ');
        }
        
        setErrorMessage(errorMessages);
      } else {
        setErrorMessage(`${errorDetails.code}: ${'message' in errorDetails && errorDetails.message ? errorDetails.message : 'Access denied - admin permissions required'}`);
      }
    }

    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Status messages */}
      {saveStatus === 'success' && (
        <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-md">
          <CheckCircle2 className="w-5 h-5" />
          <span>Craftsmanship content saved successfully!</span>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-md">
          <AlertCircle className="w-5 h-5" />
          <span>Error saving craftsmanship content: {errorMessage}</span>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
        <Tabs defaultValue="materials" className="space-y-6">
          <TabsList>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="construction">Construction</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
            <TabsTrigger value="additional">Additional</TabsTrigger>
          </TabsList>

          {/* Materials Tab */}
          <TabsContent value="materials">
            <Card>
              <CardHeader>
                <CardTitle>Materials Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fabric">Fabric Description *</Label>
                  <Textarea
                    id="fabric"
                    value={formData.materials.fabric}
                    onChange={(e) => handleTextChange('materials', 'fabric', e.target.value)}
                    placeholder="e.g., 100% organic cotton"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="origin">Origin *</Label>
                  <Input
                    id="origin"
                    value={formData.materials.origin}
                    onChange={(e) => handleTextChange('materials', 'origin', e.target.value)}
                    placeholder="e.g., Nepal"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="weight">Weight (optional)</Label>
                  <Input
                    id="weight"
                    value={formData.materials.weight || ''}
                    onChange={(e) => handleTextChange('materials', 'weight', e.target.value)}
                    placeholder="e.g., GSM 180"
                  />
                </div>

                <div>
                  <Label>Certifications (optional)</Label>
                  {formData.materials.certifications?.map((cert, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        value={cert}
                        onChange={(e) => handleCertificationsChange(index, e.target.value)}
                        placeholder="e.g., GOTS Certified"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCertification(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCertification}
                  >
                    Add Certification
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Construction Tab */}
          <TabsContent value="construction">
            <Card>
              <CardHeader>
                <CardTitle>Construction Techniques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Stitching Techniques *</Label>
                  {formData.construction.stitching.map((stitch, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        value={stitch}
                        onChange={(e) => handleArrayChange('construction', 'stitching', index, e.target.value)}
                        placeholder="e.g., French seams"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('construction', 'stitching', index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('construction', 'stitching')}
                  >
                    Add Stitching Technique
                  </Button>
                </div>

                <div>
                  <Label>Finishing Techniques *</Label>
                  {formData.construction.finishing.map((finish, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        value={finish}
                        onChange={(e) => handleArrayChange('construction', 'finishing', index, e.target.value)}
                        placeholder="e.g., Hand-finished hems"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('construction', 'finishing', index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('construction', 'finishing')}
                  >
                    Add Finishing Technique
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quality Tab */}
          <TabsContent value="quality">
            <Card>
              <CardHeader>
                <CardTitle>Quality Checks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Quality Assurance Steps *</Label>
                  {formData.quality_checks.map((check, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        value={check}
                        onChange={(e) => handleArrayChange('quality_checks', '', index, e.target.value)}
                        placeholder="e.g., Pre-production fabric inspection"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('quality_checks', '', index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('quality_checks', '')}
                  >
                    Add Quality Check
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Additional Tab */}
          <TabsContent value="additional">
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="factory_story_link">Factory Story Link (optional)</Label>
                  <Input
                    id="factory_story_link"
                    type="url"
                    value={formData.factory_story_link || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, factory_story_link: e.target.value }))}
                    placeholder="e.g., /blog/our-organic-cotton-journey"
                  />
                </div>

                <div>
                  <Label htmlFor="care_instructions">Care Instructions (optional)</Label>
                  <Textarea
                    id="care_instructions"
                    value={formData.care_instructions || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, care_instructions: e.target.value }))}
                    placeholder="e.g., Machine wash cold, tumble dry low"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save button */}
        <div className="mt-6 flex justify-end">
          <Button
            type="submit"
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Craftsmanship
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
