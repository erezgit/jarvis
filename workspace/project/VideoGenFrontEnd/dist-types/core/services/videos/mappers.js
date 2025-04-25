/**
 * Maps a VideoGeneration object from the API to the standardized Video type
 * This ensures consistent property naming across the application
 *
 * @param generation The VideoGeneration object from the API
 * @returns A standardized Video object
 */
export function mapGenerationToVideo(generation) {
    console.log('[mapGenerationToVideo] Input:', JSON.stringify({
        id: generation.id,
        status: generation.status,
        videoUrl: generation.videoUrl, // Log the actual videoUrl
        hasVideoUrl: !!generation.videoUrl,
        hasMetadata: !!generation.metadata,
    }));
    // Create a safe video object from generation data
    const video = {
        id: generation.id,
        url: generation.videoUrl, // Map videoUrl to url
        status: generation.status,
        prompt: generation.prompt,
        createdAt: generation.createdAt || new Date().toISOString(),
        metadata: {
            // Only include properties that exist in the metadata
            ...(generation.metadata || {}),
        },
    };
    console.log('[mapGenerationToVideo] Output:', JSON.stringify({
        id: video.id,
        status: video.status,
        url: video.url, // Log the actual url
        hasUrl: !!video.url,
        hasMetadata: !!video.metadata,
    }));
    return video;
}
/**
 * Maps an array of VideoGeneration objects to Video objects
 *
 * @param generations Array of VideoGeneration objects
 * @returns Array of standardized Video objects
 */
export function mapGenerationsToVideos(generations) {
    console.log(`[mapGenerationsToVideos] Mapping ${generations.length} generations to videos`);
    return generations.map(mapGenerationToVideo);
}
/**
 * Maps a Video object to a VideoGeneration object
 * This is less commonly needed but included for completeness
 *
 * @param video The Video object
 * @returns A VideoGeneration object
 */
export function mapVideoToGeneration(video) {
    return {
        id: video.id,
        videoUrl: video.url, // Map url to videoUrl
        status: video.status,
        prompt: video.prompt,
        createdAt: video.createdAt,
        metadata: video.metadata,
    };
}
/**
 * Safely merges metadata from a source object into a target metadata object
 *
 * @param target The target metadata object to update
 * @param source The source object containing new metadata
 * @returns Updated metadata object
 */
export function mergeVideoMetadata(target, source) {
    if (!target && !source) {
        return {};
    }
    return {
        ...(target || {}),
        ...(source || {}),
    };
}
