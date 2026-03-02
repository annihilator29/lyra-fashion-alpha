/**
 * Connection Status Component
 * Story 7.1c: Admin Dashboard - Real-Time Features
 * AC4: Real-Time Fallback Strategy - Connection Status Indicator
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { RefreshCw, Wifi, WifiOff, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ConnectionStatus = 'connected' | 'polling' | 'disconnected';

interface ConnectionStatusProps {
  status: ConnectionStatus;
  onRefresh?: () => void;
  lastUpdated?: Date | null;
}

const STATUS_CONFIG = {
  connected: {
    color: 'bg-green-500',
    icon: Wifi,
    label: 'Live updates',
    description: 'Real-time connection active',
  },
  polling: {
    color: 'bg-yellow-500',
    icon: Activity,
    label: 'Checking for updates...',
    description: 'Polling for updates every 30 seconds',
  },
  disconnected: {
    color: 'bg-red-500',
    icon: WifiOff,
    label: 'Manual refresh required',
    description: 'Connection lost. Click refresh to update.',
  },
};

export function ConnectionStatus({
  status,
  onRefresh,
  lastUpdated,
}: ConnectionStatusProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  const formattedLastUpdated = lastUpdated
    ? new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      }).format(lastUpdated)
    : null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex items-center gap-2 rounded-full border px-3 py-1.5',
                status === 'connected' && 'border-green-200 bg-green-50',
                status === 'polling' && 'border-yellow-200 bg-yellow-50',
                status === 'disconnected' && 'border-red-200 bg-red-50'
              )}
              data-testid="connection-status"
              data-status={status}
            >
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  config.color,
                  status === 'polling' && 'animate-pulse'
                )}
                data-testid="connection-dot"
              />
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                {config.label}
              </span>
            </div>

            {status === 'disconnected' && onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="h-7 gap-1 px-2 text-xs"
                data-testid="refresh-button"
              >
                <RefreshCw className="h-3 w-3" />
                Refresh
              </Button>
            )}

            {formattedLastUpdated && status !== 'connected' && (
              <span className="text-xs text-muted-foreground">
                Last updated: {formattedLastUpdated}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-sm">{config.description}</p>
          {formattedLastUpdated && (
            <p className="text-xs text-muted-foreground">
              Last sync: {formattedLastUpdated}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
