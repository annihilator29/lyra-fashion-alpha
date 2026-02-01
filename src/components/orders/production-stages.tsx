'use client';

import React from 'react';
import { 
  Scissors, 
  PenTool, 
  Sparkles, 
  CheckCircle2,
  Clock,
  Circle
} from 'lucide-react';
import type { ProductionStages, ProductionStageName, ProductionStageStatus } from '@/types/order';
import { getCraftsmanshipMessage } from '@/lib/orders/craftsmanship-messages';
import { cn } from '@/lib/utils';

interface ProductionStageCardProps {
  stage: ProductionStageName;
  data: { status: ProductionStageStatus; started_at?: string; completed_at?: string };
  isCurrent: boolean;
  isCompleted: boolean;
  isPending: boolean;
  isLast: boolean;
}

const stageConfig: Record<ProductionStageName, { label: string; icon: React.ReactNode; description: string }> = {
  cutting: {
    label: 'Cutting',
    icon: <Scissors className="w-5 h-5" />,
    description: 'Precision fabric cutting'
  },
  sewing: {
    label: 'Sewing',
    icon: <PenTool className="w-5 h-5" />,
    description: 'Expert craftsmanship'
  },
  finishing: {
    label: 'Finishing',
    icon: <Sparkles className="w-5 h-5" />,
    description: 'Final touches & details'
  },
  qc: {
    label: 'Quality Check',
    icon: <CheckCircle2 className="w-5 h-5" />,
    description: 'Rigorous inspection'
  }
};

function ProductionStageCard({ 
  stage, 
  data, 
  isCurrent, 
  isCompleted, 
  isPending,
  isLast 
}: ProductionStageCardProps) {
  const config = stageConfig[stage];
  
  const statusIcons = {
    'not_started': <Circle className="w-5 h-5 text-gray-400" />,
    'in_progress': <Clock className="w-5 h-5 text-blue-500 animate-pulse" />,
    'completed': <CheckCircle2 className="w-5 h-5 text-green-500" />
  };

  return (
    <div className={cn(
      "relative flex flex-col items-center",
      !isLast && "flex-1"
    )}>
      {/* Connector line */}
      {!isLast && (
        <div className={cn(
          "absolute top-6 left-[calc(50%+24px)] right-[calc(-50%+24px)] h-0.5",
          isCompleted ? "bg-green-500" : "bg-gray-200"
        )} />
      )}
      
      {/* Stage circle */}
      <div className={cn(
        "relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300",
        isCompleted && "bg-green-500 border-green-500 text-white",
        isCurrent && "bg-blue-500 border-blue-500 text-white ring-4 ring-blue-100",
        isPending && "bg-white border-gray-300 text-gray-400"
      )}>
        {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : config.icon}
      </div>
      
      {/* Stage info */}
      <div className="mt-3 text-center">
        <h4 className={cn(
          "font-semibold text-sm",
          isCurrent && "text-blue-700",
          isCompleted && "text-green-700",
          isPending && "text-gray-500"
        )}>
          {config.label}
        </h4>
        <p className="text-xs text-gray-500 mt-1">{config.description}</p>
        
        {/* Status indicator */}
        <div className="flex items-center justify-center gap-1 mt-2">
          {statusIcons[data.status]}
          <span className={cn(
            "text-xs font-medium",
            data.status === 'completed' && "text-green-600",
            data.status === 'in_progress' && "text-blue-600",
            data.status === 'not_started' && "text-gray-500"
          )}>
            {data.status === 'not_started' ? 'Not Started' : 
             data.status === 'in_progress' ? 'In Progress' : 'Completed'}
          </span>
        </div>
        
        {/* Timestamps */}
        {data.started_at && (
          <p className="text-xs text-gray-400 mt-1">
            Started: {new Date(data.started_at).toLocaleDateString()}
          </p>
        )}
        {data.completed_at && (
          <p className="text-xs text-green-600 mt-1">
            Completed: {new Date(data.completed_at).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}

interface ProductionStagesProps {
  stages: ProductionStages;
  showCraftsmanshipMessage?: boolean;
  className?: string;
}

export function ProductionStages({ 
  stages, 
  showCraftsmanshipMessage = true,
  className 
}: ProductionStagesProps) {
  const stageOrder: ProductionStageName[] = ['cutting', 'sewing', 'finishing', 'qc'];
  
  // Type assertion for indexing
  const stagesMap = stages as Record<ProductionStageName, { status: ProductionStageStatus; started_at?: string; completed_at?: string }>;
  
  // Find current stage index
  const currentStageIndex = stageOrder.findIndex(
    stage => stagesMap[stage]?.status === 'in_progress'
  );
  
  // If no in_progress stage, find last completed
  const effectiveCurrentIndex = currentStageIndex !== -1 
    ? currentStageIndex 
    : stageOrder.findIndex(stage => stagesMap[stage]?.status === 'not_started') - 1;
  
  // Get current stage for craftsmanship message
  const currentStage = currentStageIndex !== -1 
    ? stageOrder[currentStageIndex] 
    : null;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Production Pipeline */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Production Progress</h3>
        
        {/* Desktop: Horizontal layout */}
        <div className="hidden md:flex items-start justify-between">
          {stageOrder.map((stage, index) => (
            <ProductionStageCard
              key={stage}
              stage={stage}
              data={stagesMap[stage]}
              isCurrent={index === currentStageIndex}
              isCompleted={index < effectiveCurrentIndex || stagesMap[stage]?.status === 'completed'}
              isPending={index > effectiveCurrentIndex && stagesMap[stage]?.status !== 'completed'}
              isLast={index === stageOrder.length - 1}
            />
          ))}
        </div>
        
        {/* Mobile: Vertical layout */}
        <div className="md:hidden space-y-4">
          {stageOrder.map((stage, index) => {
            const config = stageConfig[stage];
            const isCurrent = index === currentStageIndex;
            const isCompleted = index < effectiveCurrentIndex || stagesMap[stage]?.status === 'completed';
            
            return (
              <div 
                key={stage}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-lg border",
                  isCurrent && "border-blue-300 bg-blue-50",
                  isCompleted && "border-green-300 bg-green-50",
                  !isCurrent && !isCompleted && "border-gray-200"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  isCompleted && "bg-green-500 text-white",
                  isCurrent && "bg-blue-500 text-white",
                  !isCurrent && !isCompleted && "bg-gray-100 text-gray-400"
                )}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : config.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{config.label}</h4>
                  <p className="text-xs text-gray-500">{config.description}</p>
                  {stagesMap[stage]?.started_at && (
                    <p className="text-xs text-gray-400 mt-1">
                      {stagesMap[stage]?.completed_at ? 'Completed' : 'Started'}: {' '}
                      {new Date(stagesMap[stage]?.completed_at || stagesMap[stage].started_at || '').toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className={cn(
                    "text-xs font-medium px-2 py-1 rounded-full",
                    stagesMap[stage]?.status === 'completed' && "bg-green-100 text-green-700",
                    stagesMap[stage]?.status === 'in_progress' && "bg-blue-100 text-blue-700",
                    stagesMap[stage]?.status === 'not_started' && "bg-gray-100 text-gray-500"
                  )}>
                    {stagesMap[stage]?.status === 'not_started' ? 'Pending' : 
                     stagesMap[stage]?.status === 'in_progress' ? 'Active' : 'Done'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Craftsmanship Message */}
      {showCraftsmanshipMessage && currentStage && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-800 text-sm italic">
            &ldquo;{getCraftsmanshipMessage(currentStage)}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
