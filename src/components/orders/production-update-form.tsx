'use client';

import React, { useState } from 'react';
import { Scissors, PenTool, Sparkles, CheckCircle2, Upload } from 'lucide-react';
import { ProductionStageName, ProductionStageStatus, ProductionStages } from '@/types/order';
import { 
  updateProductionStageAction, 
  updateProductionCompletionEstimateAction, 
  uploadQCPhotoAction 
} from '@/app/actions/production';
import { cn } from '@/lib/utils';

interface ProductionStageUpdateFormProps {
  orderId: string;
  currentStages: ProductionStages | null;
  currentEstimate?: string;
  qcPhotoUrl?: string;
}

const stageConfig: Record<ProductionStageName, { label: string; icon: React.ReactNode; color: string }> = {
  cutting: {
    label: 'Cutting',
    icon: <Scissors className="w-5 h-5" />,
    color: 'bg-blue-500'
  },
  sewing: {
    label: 'Sewing',
    icon: <PenTool className="w-5 h-5" />,
    color: 'bg-indigo-500'
  },
  finishing: {
    label: 'Finishing',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'bg-purple-500'
  },
  qc: {
    label: 'Quality Check',
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: 'bg-green-500'
  }
};

const stageOrder: ProductionStageName[] = ['cutting', 'sewing', 'finishing', 'qc'];

export function ProductionStageUpdateForm({
  orderId,
  currentStages,
  currentEstimate,
  qcPhotoUrl
}: ProductionStageUpdateFormProps) {
  const [stages, setStages] = useState<ProductionStages>(currentStages || {
    cutting: { status: 'not_started' },
    sewing: { status: 'not_started' },
    finishing: { status: 'not_started' },
    qc: { status: 'not_started' }
  });
  const [completionEstimate, setCompletionEstimate] = useState(currentEstimate || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);
  const [qcFile, setQcFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleStageUpdate = async (stage: ProductionStageName, newStatus: ProductionStageStatus) => {
    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      const result = await updateProductionStageAction(orderId, { stage, status: newStatus });
      
      if (result.success) {
        setStages(prev => {
          const prevMap = prev as Record<ProductionStageName, typeof prev.cutting>;
          return {
            ...prev,
            [stage]: {
              ...prevMap[stage],
              status: newStatus,
              ...(newStatus === 'in_progress' && { started_at: new Date().toISOString() }),
              ...(newStatus === 'completed' && { completed_at: new Date().toISOString() })
            }
          };
        });
        setUpdateSuccess(`${stageConfig[stage].label} marked as ${newStatus.replace('_', ' ')}`);
      } else {
        setUpdateError(result.error || 'Failed to update stage');
      }
    } catch {
      setUpdateError('An unexpected error occurred');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEstimateUpdate = async () => {
    if (!completionEstimate) return;
    
    setIsUpdating(true);
    setUpdateError(null);
    
    try {
      const result = await updateProductionCompletionEstimateAction(orderId, completionEstimate);
      
      if (result.success) {
        setUpdateSuccess('Completion estimate updated');
      } else {
        setUpdateError(result.error || 'Failed to update estimate');
      }
    } catch {
      setUpdateError('An unexpected error occurred');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQCPhotoUpload = async () => {
    if (!qcFile) return;
    
    setIsUploading(true);
    setUpdateError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', qcFile);
      
      const result = await uploadQCPhotoAction(orderId, formData);
      
      if (result.success) {
        setUpdateSuccess('QC photo uploaded successfully');
        setQcFile(null);
      } else {
        setUpdateError(result.error || 'Failed to upload photo');
      }
    } catch {
      setUpdateError('An unexpected error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  const stagesMap = stages as Record<ProductionStageName, typeof stages.cutting>;
  
  const getStageActions = (stage: ProductionStageName) => {
    const currentStatus = stagesMap[stage].status;
    const stageIndex = stageOrder.indexOf(stage);
    
    // Check if all previous stages are completed
    const canStart = stageIndex === 0 || stageOrder.slice(0, stageIndex).every(
      s => stagesMap[s].status === 'completed'
    );
    
    return {
      canStart: canStart && currentStatus === 'not_started',
      canComplete: currentStatus === 'in_progress',
      isCompleted: currentStatus === 'completed'
    };
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <h2 className="text-lg font-semibold">Update Production Status</h2>

      {/* Error/Success Messages */}
      {updateError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {updateError}
        </div>
      )}
      {updateSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {updateSuccess}
        </div>
      )}

      {/* Stage Controls */}
      <div className="space-y-4">
        {stageOrder.map((stage, stageIndex) => {
          const config = stageConfig[stage];
          const stageData = stagesMap[stage];
          const actions = getStageActions(stage);

          return (
            <div 
              key={stage} 
              className={cn(
                "border rounded-lg p-4 transition-colors",
                stageData.status === 'in_progress' && "border-blue-300 bg-blue-50",
                stageData.status === 'completed' && "border-green-300 bg-green-50",
                stageData.status === 'not_started' && "border-gray-200"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white", config.color)}>
                    {config.icon}
                  </div>
                  <div>
                    <h4 className="font-medium">{config.label}</h4>
                    <p className="text-sm text-gray-500">
                      {stageData.status === 'not_started' && 'Waiting to start'}
                      {stageData.status === 'in_progress' && stageData.started_at && 
                        `Started ${new Date(stageData.started_at).toLocaleDateString()}`}
                      {stageData.status === 'completed' && stageData.completed_at && 
                        `Completed ${new Date(stageData.completed_at).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  stageData.status === 'not_started' && "bg-gray-100 text-gray-600",
                  stageData.status === 'in_progress' && "bg-blue-100 text-blue-700",
                  stageData.status === 'completed' && "bg-green-100 text-green-700"
                )}>
                  {stageData.status === 'not_started' ? 'Not Started' :
                   stageData.status === 'in_progress' ? 'In Progress' : 'Completed'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {actions.canStart && (
                  <button
                    onClick={() => handleStageUpdate(stage, 'in_progress')}
                    disabled={isUpdating}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    Start {config.label}
                  </button>
                )}
                {actions.canComplete && (
                  <button
                    onClick={() => handleStageUpdate(stage, 'completed')}
                    disabled={isUpdating}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                  >
                    Complete {config.label}
                  </button>
                )}
                {actions.isCompleted && (
                  <span className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-md text-sm text-center">
                    ✓ Stage Complete
                  </span>
                )}
                {!actions.canStart && !actions.canComplete && !actions.isCompleted && stageIndex > 0 && (
                  <span className="flex-1 px-4 py-2 bg-gray-50 text-gray-400 rounded-md text-sm text-center">
                    Complete previous stage first
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Estimate */}
      <div className="border-t pt-6">
        <h3 className="font-medium mb-3">Production Completion Estimate</h3>
        <div className="flex gap-2">
          <input
            type="datetime-local"
            value={completionEstimate ? new Date(completionEstimate).toISOString().slice(0, 16) : ''}
            onChange={(e) => setCompletionEstimate(new Date(e.target.value).toISOString())}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <button
            onClick={handleEstimateUpdate}
            disabled={isUpdating || !completionEstimate}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            Update
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          This estimate will be displayed to the customer on their order status page.
        </p>
      </div>

      {/* QC Photo Upload */}
      <div className="border-t pt-6">
        <h3 className="font-medium mb-3">QC Photo (Optional)</h3>
        
        {qcPhotoUrl ? (
          <div className="mb-4">
            <p className="text-sm text-green-600 mb-2">✓ QC photo already uploaded</p>
            <img 
              src={qcPhotoUrl} 
              alt="QC Photo" 
              className="w-full max-w-xs rounded-lg border"
            />
          </div>
        ) : null}

        <div className="flex gap-2 items-start">
          <div className="flex-1">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setQcFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            <p className="text-xs text-gray-500 mt-2">
              Max 5MB. JPG, PNG, or WEBP. Shows customer the finished product before shipping.
            </p>
          </div>
          {qcFile && (
            <button
              onClick={handleQCPhotoUpload}
              disabled={isUploading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
