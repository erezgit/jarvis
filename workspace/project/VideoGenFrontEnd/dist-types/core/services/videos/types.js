/**
 * Type guard to check if an object is a VideoGeneration
 */
export function isVideoGeneration(obj) {
    return obj !== null && typeof obj === 'object' && 'videoUrl' in obj;
}
/**
 * Type guard to check if an object is a Video
 */
export function isVideo(obj) {
    return obj !== null && typeof obj === 'object' && 'url' in obj;
}
