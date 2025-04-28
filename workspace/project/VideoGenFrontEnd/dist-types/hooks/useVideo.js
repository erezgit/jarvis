import { useState, useCallback } from 'react';
import { useToast } from './useToast';
import { useProjects } from '@/core/hooks/projects';
export function useVideo() {
    const { data: projects, isLoading: projectsLoading, error: projectsError } = useProjects();
    const [uploadProgress, setUploadProgress] = useState(0);
    const [status, setStatus] = useState('idle');
    const { showToast } = useToast();
    // Extract completed videos from all projects
    const videos = projects?.flatMap((project) => (project.videos || [])
        .filter((video) => video.url) // Only include videos with URLs
        .map((video) => ({
        id: video.id,
        url: video.url,
        status: 'completed',
        createdAt: new Date().toISOString(), // Use current time since project doesn't have per-video timestamps
        duration: 0, // Duration not available in project video data
        prompt: project.prompt, // Include the project's prompt
    }))) || [];
    const generateVideo = useCallback(async (options) => {
        setStatus('uploading');
        setUploadProgress(0);
        try {
            // Create FormData for file upload
            const formData = new FormData();
            options.images.forEach((image, index) => {
                formData.append(`image_${index}`, image);
            });
            if (options.music) {
                formData.append('music', options.music);
            }
            formData.append('duration', options.duration.toString());
            formData.append('transition', options.transition);
            // Use XMLHttpRequest for progress tracking
            const data = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const progress = Math.round((event.loaded * 100) / event.total);
                        setUploadProgress(progress);
                    }
                });
                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(JSON.parse(xhr.responseText));
                    }
                    else {
                        reject(new Error('Failed to generate video'));
                    }
                });
                xhr.addEventListener('error', () => {
                    reject(new Error('Network error occurred'));
                });
                xhr.open('POST', '/api/videos/generate');
                xhr.setRequestHeader('Accept', 'application/json');
                xhr.send(formData);
            });
            // Start polling for video status
            const videoId = data.videoId;
            let processingComplete = false;
            while (!processingComplete) {
                const statusResponse = await fetch(`/api/videos/${videoId}/status`);
                const statusData = await statusResponse.json();
                if (statusData.status === 'completed') {
                    processingComplete = true;
                    setStatus('completed');
                    showToast('Video generated successfully!', 'success');
                }
                else if (statusData.status === 'error') {
                    throw new Error(statusData.error || 'Video generation failed');
                }
                else {
                    // Wait before next poll
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                }
            }
        }
        catch (err) {
            setStatus('error');
            showToast(err instanceof Error ? err.message : 'Failed to generate video', 'error');
        }
    }, [showToast]);
    return {
        videos,
        loading: projectsLoading,
        error: projectsError,
        generateVideo,
        uploadProgress,
        status,
    };
}
