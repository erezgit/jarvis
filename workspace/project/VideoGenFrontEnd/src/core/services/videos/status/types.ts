/**
 * Possible status values for a video generation
 * As defined by the backend team in Service 2.2
 */
export type VideoStatus =
  | 'pending' // Initial state when created
  | 'queued' // Request is queued for processing
  | 'preparing' // System is preparing to generate the video
  | 'generating' // Video is being generated
  | 'processing' // Video is being processed post-generation
  | 'completed' // Video generation is complete (terminal state)
  | 'failed'; // Video generation failed (terminal state)

/**
 * Response format from the video status endpoint
 * As defined by the backend team in Service 2.2
 */
export interface VideoStatusResponse {
  /**
   * Current status of the video generation
   */
  status: VideoStatus;

  /**
   * URL to the generated video, null if not yet completed
   */
  videoUrl: string | null;

  /**
   * Error message if the generation failed, null otherwise
   */
  error: string | null;

  /**
   * Additional metadata about the video generation
   */
  metadata?: {
    /**
     * When the video generation was created
     */
    createdAt: string;

    /**
     * ID of the job in the Runway system
     */
    runwayJobId: string;

    /**
     * Any additional metadata provided by the backend
     */
    [key: string]: unknown;
  };
}
