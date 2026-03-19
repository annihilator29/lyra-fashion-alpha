/**
 * Connection Status Hook
 * Story 7.1c: Admin Dashboard - Real-Time Features
 * AC4: Real-Time Fallback Strategy
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

export type ConnectionStatus = 'connected' | 'polling' | 'disconnected';

interface UseConnectionStatusReturn {
  status: ConnectionStatus;
  lastConnectedAt: Date | null;
  retryCount: number;
  checkConnection: () => Promise<boolean>;
}

const POLLING_INTERVAL = 30000; // 30 seconds
const RETRY_INTERVAL = 60000; // 60 seconds
const MAX_RETRIES_BEFORE_DISCONNECTED = 5;

/**
 * Hook to monitor Supabase Realtime connection status
 * Automatically handles fallback to polling when realtime is unavailable
 */
export function useConnectionStatus(): UseConnectionStatusReturn {
  const [status, setStatus] = useState<ConnectionStatus>('polling');
  const [lastConnectedAt, setLastConnectedAt] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const retryCountRef = useRef(0);

  // Keep ref in sync with state
  useEffect(() => {
    retryCountRef.current = retryCount;
  }, [retryCount]);

  /**
   * Check if Supabase connection is working
   */
  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('orders').select('id').limit(1);

      if (error) {
        console.log('[Connection] Database check failed:', error.message);
        return false;
      }

      return true;
    } catch (err) {
      console.log('[Connection] Connection check error:', err);
      return false;
    }
  }, []);

  /**
   * Attempt to establish realtime connection
   */
  const attemptRealtimeConnection = useCallback(() => {
    const supabase = createClient();

    // Create channel and store reference for cleanup
    let channelRef: ReturnType<typeof supabase.channel> | null = null;

    const cleanup = () => {
      if (channelRef) {
        const ref = channelRef;
        channelRef = null;
        supabase.removeChannel(ref);
      }
    };

    channelRef = supabase
      .channel('connection-test')
      .on('system', {}, (payload) => {
        if (payload.type === 'connected') {
          setStatus('connected');
          setLastConnectedAt(new Date());
          setRetryCount(0);
        }
      })
      .subscribe((subscriptionStatus) => {
        if (subscriptionStatus === 'SUBSCRIBED') {
          setStatus('connected');
          setLastConnectedAt(new Date());
          setRetryCount(0);
        } else if (
          subscriptionStatus === 'CLOSED' ||
          subscriptionStatus === 'CHANNEL_ERROR' ||
          subscriptionStatus === 'TIMED_OUT'
        ) {
          const newRetryCount = retryCountRef.current + 1;
          setRetryCount(newRetryCount);

          if (newRetryCount >= MAX_RETRIES_BEFORE_DISCONNECTED) {
            setStatus('disconnected');
          } else {
            setStatus('polling');
          }
        }

        // Clean up test channel
        cleanup();
      });
  }, []);

  useEffect(() => {
    let isMounted = true;
    let checkInterval: NodeJS.Timeout | null = null;
    let retryInterval: NodeJS.Timeout | null = null;

    const performCheck = async () => {
      if (!isMounted) return;

      const isConnected = await checkConnection();

      if (!isMounted) return;

      if (isConnected) {
        // Try to upgrade to realtime
        if (status !== 'connected') {
          attemptRealtimeConnection();
        }
      } else {
        const newRetryCount = retryCountRef.current + 1;
        setRetryCount(newRetryCount);

        if (newRetryCount >= MAX_RETRIES_BEFORE_DISCONNECTED) {
          setStatus('disconnected');
        } else {
          setStatus('polling');
        }
      }
    };

    // Initial check
    performCheck();

    // Set up polling interval for connection checks
    checkInterval = setInterval(performCheck, POLLING_INTERVAL);

    // Set up retry interval for attempting realtime reconnection
    retryInterval = setInterval(() => {
      if (status !== 'connected' && isMounted) {
        attemptRealtimeConnection();
      }
    }, RETRY_INTERVAL);

    return () => {
      isMounted = false;
      if (checkInterval) clearInterval(checkInterval);
      if (retryInterval) clearInterval(retryInterval);
    };
  }, [checkConnection, attemptRealtimeConnection, status]);

  return {
    status,
    lastConnectedAt,
    retryCount,
    checkConnection,
  };
}

export default useConnectionStatus;
