import { useState, useCallback, useRef, useEffect } from 'react';
import { VideoStatusService } from '@/core/services/videos/status/service';
import type { VideoStatus, VideoStatusResponse } from '@/core/services/videos/status/types';

export interface UseVideoStatusPollingOptions {
  /**
   * Interval between polling attempts in milliseconds
   * @default 5000 (5 seconds)
   */
  pollingInterval?: number;

  /**
   * Maximum time to poll in milliseconds before giving up
   * @default 120000 (2 minutes)
   */
  pollingTimeout?: number;

  /**
   * Maximum number of polling attempts
   * @default 60
   */
  maxAttempts?: number;

  /**
   * Callback when video generation is complete
   */
  onComplete?: (data: VideoStatusResponse) => void;

  /**
   * Callback when an error occurs
   */
  onError?: (error: Error) => void;

  /**
   * Callback when status is updated (even if not complete)
   */
  onStatusUpdate?: (data: VideoStatusResponse) => void;

  /**
   * Callback when video generation is complete
   */
  onVideoComplete?: (video: {
    id: string;
    url: string;
    status: VideoStatus;
    prompt?: string;
    createdAt?: string;
  }) => void;
}

export interface UseVideoStatusPollingReturn {
  /**
   * Start polling for a generation
   */
  startPolling: (generationId: string) => void;

  /**
   * Stop polling
   */
  stopPolling: () => void;

  /**
   * Manually check status once
   */
  checkStatusOnce: (generationId: string) => Promise<VideoStatusResponse | null>;

  /**
   * Whether polling is currently active
   */
  isPolling: boolean;

  /**
   * Current status if available
   */
  status: VideoStatus | null;

  /**
   * Error if one occurred
   */
  error: Error | null;
}

/**
 * Hook for polling video generation status
 */
export function useVideoStatusPolling(
  options: UseVideoStatusPollingOptions = {},
): UseVideoStatusPollingReturn {
  // Get service instance
  const videoStatusService = VideoStatusService.getInstance();

  // Set up state
  const [isPolling, setIsPolling] = useState(false);
  const [status, setStatus] = useState<VideoStatus | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Set up refs for polling
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const attemptCountRef = useRef(0);
  const currentGenerationIdRef = useRef<string | null>(null);

  // Configure options with defaults
  const pollingInterval = options.pollingInterval || 5000; // 5 seconds
  const pollingTimeout = options.pollingTimeout || 120000; // 2 minutes
  const maxAttempts = options.maxAttempts || 60; // 60 attempts max

  /**
   * Determine if a status is terminal (completed or failed)
   */
  const isTerminalStatus = useCallback((checkStatus: VideoStatus): boolean => {
    // IMPORTANT: Only 'completed' and 'failed' are terminal states
    // 'processing' is NOT a terminal state and should continue polling
    return checkStatus === 'completed' || checkStatus === 'failed';
  }, []);

  /**
   * Clean up polling resources
   */
  const cleanupPolling = useCallback(() => {
    console.log('[useVideoStatusPolling] Cleaning up polling resources');

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }

    setIsPolling(false);
    attemptCountRef.current = 0;
    currentGenerationIdRef.current = null;
  }, []);

  /**
   * Check status once
   */
  const checkStatusOnce = useCallback(
    async (generationId: string): Promise<VideoStatusResponse | null> => {
      try {
        console.log(`[useVideoStatusPolling] Checking status for generation: ${generationId}`);
        const result = await videoStatusService.checkStatus(generationId);

        if (result.error) {
          console.error('[useVideoStatusPolling] Error checking status:', result.error);
          setError(new Error(result.error.message || 'Error checking video status'));
          return null;
        }

        if (!result.data) {
          console.error('[useVideoStatusPolling] No data returned from status check');
          setError(new Error('No data returned from status check'));
          return null;
        }

        console.log(`[useVideoStatusPolling] Status check result:`, result.data);

        // Update status
        setStatus(result.data.status);

        // Call status update callback
        options.onStatusUpdate?.(result.data);

        // If terminal status, call complete callback
        if (isTerminalStatus(result.data.status)) {
          console.log(`[useVideoStatusPolling] Terminal status detected: ${result.data.status}`);

          // Create a video object from the result
          if (options.onVideoComplete) {
            const video = {
              id: generationId,
              url: result.data.videoUrl || '',
              status: result.data.status as VideoStatus,
              prompt: 'Video from status endpoint',
              createdAt: new Date().toISOString(),
            };

            console.log('[useVideoStatusPolling] Created video object for UI update:', video);

            // Call onVideoComplete callback for direct UI update
            options.onVideoComplete(video);
          }

          options.onComplete?.(result.data);
        }

        return result.data;
      } catch (err) {
        console.error('[useVideoStatusPolling] Error in checkStatusOnce:', err);
        const error = err instanceof Error ? err : new Error('Unknown error checking video status');
        setError(error);
        options.onError?.(error);
        return null;
      }
    },
    [videoStatusService, isTerminalStatus, options],
  );

  /**
   * Start polling for a generation
   */
  const startPolling = useCallback(
    (generationId: string) => {
      // Clean up any existing polling
      cleanupPolling();

      console.log(`[useVideoStatusPolling] Starting polling for generation: ${generationId}`);

      // Set current generation ID
      currentGenerationIdRef.current = generationId;

      // Set polling state
      setIsPolling(true);
      setError(null);

      // Define polling function
      const pollStatus = async () => {
        // Increment attempt count
        attemptCountRef.current += 1;

        console.log(
          `[useVideoStatusPolling] Polling attempt ${attemptCountRef.current} for generation: ${generationId}`,
        );

        // Check if we've exceeded max attempts
        if (attemptCountRef.current > maxAttempts) {
          console.warn(
            `[useVideoStatusPolling] Max attempts (${maxAttempts}) reached, stopping polling`,
          );
          cleanupPolling();
          setError(new Error(`Max polling attempts (${maxAttempts}) reached`));
          options.onError?.(new Error(`Max polling attempts (${maxAttempts}) reached`));
          return;
        }

        // Check status
        const data = await checkStatusOnce(generationId);

        // If no data or error, continue polling
        if (!data) {
          console.warn('[useVideoStatusPolling] No data returned, continuing polling');
          return;
        }

        // If terminal status, stop polling
        if (isTerminalStatus(data.status)) {
          console.log(
            `[useVideoStatusPolling] Terminal status detected (${data.status}), stopping polling`,
          );
          cleanupPolling();
        }
      };

      // Start polling
      pollingIntervalRef.current = setInterval(pollStatus, pollingInterval);

      // Set timeout
      pollingTimeoutRef.current = setTimeout(() => {
        console.warn(
          `[useVideoStatusPolling] Polling timeout (${pollingTimeout}ms) reached, stopping polling`,
        );
        cleanupPolling();
        setError(new Error(`Polling timeout (${pollingTimeout}ms) reached`));
        options.onError?.(new Error(`Polling timeout (${pollingTimeout}ms) reached`));
      }, pollingTimeout);

      // Do initial poll immediately
      pollStatus();
    },
    [
      cleanupPolling,
      checkStatusOnce,
      isTerminalStatus,
      maxAttempts,
      options,
      pollingInterval,
      pollingTimeout,
    ],
  );

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    console.log('[useVideoStatusPolling] Manually stopping polling');
    cleanupPolling();
  }, [cleanupPolling]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      cleanupPolling();
    };
  }, [cleanupPolling]);

  return {
    startPolling,
    stopPolling,
    checkStatusOnce,
    isPolling,
    status,
    error,
  };
}
