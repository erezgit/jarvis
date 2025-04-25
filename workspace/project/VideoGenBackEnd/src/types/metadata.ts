/**
 * Base metadata interface for all types of metadata
 * This serves as the foundation for all metadata types in the system
 */
export interface BaseMetadata {
  /**
   * User ID associated with the metadata
   */
  userId: string;
  
  /**
   * Type of the metadata (e.g., 'image', 'video', 'project')
   */
  type: string;
  
  /**
   * Size of the associated file in bytes
   */
  size: number;
  
  /**
   * Path to the file in storage
   */
  path?: string;
  
  /**
   * Additional properties can be added as needed
   */
  [key: string]: unknown;
} 