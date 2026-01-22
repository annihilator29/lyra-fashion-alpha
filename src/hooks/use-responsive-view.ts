/**
 * SSR-Safe Responsive View Hook
 * 
 * Detects viewport mode (mobile/desktop) without causing hydration mismatches.
 * Returns consistent 'desktop' during SSR to ensure consistent initial render.
 * 
 * @module hooks/use-responsive-view
 */

'use client';

import { useEffect, useState } from 'react';

/**
 * View mode based on viewport width
 */
export type ViewMode = 'mobile' | 'desktop';

/**
 * Configuration options for the responsive view hook
 */
export interface UseResponsiveViewOptions {
  /** Breakpoint in pixels for mobile detection (default: 768) */
  mobileBreakpoint?: number;
  /** Initial view mode during SSR (default: 'desktop') */
  initialMode?: ViewMode;
}

/**
 * Hook to detect responsive view mode
 * 
 * Prevents hydration mismatches by:
 * 1. Using a consistent initial value during SSR
 * 2. Only detecting actual viewport size after mount
 * 3. Using requestAnimationFrame for resize performance
 * 
 * @param options - Configuration options
 * @returns Current view mode ('mobile' or 'desktop')
 * 
 * @example
 * ```tsx
 * const viewMode = useResponsiveView({ mobileBreakpoint: 768 });
 * 
 * if (viewMode === 'mobile') {
 *   return <MobileLayout />;
 * }
 * return <DesktopLayout />;
 * ```
 */
export function useResponsiveView(
  options: UseResponsiveViewOptions = {}
): ViewMode {
  const {
    mobileBreakpoint = 768,
    initialMode = 'desktop'
  } = options;

  const [viewMode, setViewMode] = useState<ViewMode>(initialMode);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Mark component as mounted
    setHasMounted(true);

    /**
     * Check and set view mode based on current window width
     * Wrapped in try-catch for SSR safety
     */
    const checkViewMode = () => {
      if (typeof window !== 'undefined') {
        setViewMode(window.innerWidth < mobileBreakpoint ? 'mobile' : 'desktop');
      }
    };

    // Initial check
    checkViewMode();

    /**
     * Handle window resize with requestAnimationFrame for performance
     * Uses RAF to throttle resize events and prevent layout thrashing
     */
    let resizeTimeoutId: number | null = null;

    const handleResize = () => {
      // Cancel any pending resize check
      if (resizeTimeoutId) {
        cancelAnimationFrame(resizeTimeoutId);
      }

      // Schedule new check on next frame
      resizeTimeoutId = requestAnimationFrame(checkViewMode);
    };

    // Add resize listener
    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutId) {
        cancelAnimationFrame(resizeTimeoutId);
      }
    };
  }, [mobileBreakpoint]);

  // Return consistent value during SSR to prevent hydration mismatch
  return hasMounted ? viewMode : initialMode;
}

/**
 * Hook to check if device is mobile specifically
 * 
 * @param mobileBreakpoint - Breakpoint for mobile detection (default: 768)
 * @returns True if current viewport is mobile
 * 
 * @example
 * ```tsx
 * const isMobile = useIsMobile();
 * 
 * if (isMobile) {
 *   return <MobileNavigation />;
 * }
 * ```
 */
export function useIsMobile(mobileBreakpoint: number = 768): boolean {
  const viewMode = useResponsiveView({ mobileBreakpoint });
  return viewMode === 'mobile';
}

/**
 * Hook to check if device is desktop specifically
 * 
 * @param mobileBreakpoint - Breakpoint for mobile detection (default: 768)
 * @returns True if current viewport is desktop
 * 
 * @example
 * ```tsx
 * const isDesktop = useIsDesktop();
 * 
 * if (isDesktop) {
 *   return <DesktopNavigation />;
 * }
 * ```
 */
export function useIsDesktop(mobileBreakpoint: number = 768): boolean {
  const viewMode = useResponsiveView({ mobileBreakpoint });
  return viewMode === 'desktop';
}

/**
 * Breakpoint constants for common device sizes
 */
export const BREAKPOINTS = {
  /** Mobile phones */
  mobile: 768,
  /** Tablets */
  tablet: 1024,
  /** Small desktops/large tablets */
  desktop: 1280
} as const;

/**
 * Hook to detect specific breakpoint range
 * 
 * @param breakpoint - Breakpoint to check against
 * @returns View mode based on breakpoint
 * 
 * @example
 * ```tsx
 * const mode = useBreakpointView(BREAKPOINTS.tablet);
 * ```
 */
export function useBreakpointView(
  breakpoint: number = BREAKPOINTS.mobile
): ViewMode {
  return useResponsiveView({ mobileBreakpoint: breakpoint });
}
