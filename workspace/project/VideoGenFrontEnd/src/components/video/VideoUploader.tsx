import * as React from 'react';
import { useCallback, useState, useRef } from 'react';
import { useVideoGeneration } from '@/core/hooks/video/useVideoGeneration';
import { useToast } from '@/hooks/useToast';
import type { VideoGenerationInput } from '@/core/services/videos/generation/types';
import { useImageUpload } from '@/core/hooks/images';
import type { ImageUploadResult } from '@/core/services/images';
import { videoService } from '@/core/services/videos';

interface VideoUploaderProps {
  maxFiles?: number;
  allowedTypes?: string[];
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  maxFiles = 10,
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [transitionType, setTransitionType] = useState<'fade' | 'slide' | 'zoom'>('fade');
  const [duration, setDuration] = useState(3);
  const { uploadImage, isUploading, error: uploadError, result } = useImageUpload();
  const {
    handleGenerate,
    isGenerating,
    error: generationError,
    setPrompt,
  } = useVideoGeneration({
    imageUrl: result?.imageUrl,
    onInsufficientCredits: () => {
      console.log('[VideoUploader] Redirecting to Credits page due to insufficient credits');
      if (typeof window !== 'undefined') {
        window.location.href = '/credits';
      }
    },
  });
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = event.target.files;
      if (!fileList) return;

      const files = Array.from(fileList) as File[];
      const invalidFiles = files.filter((file: File) => !allowedTypes.includes(file.type));

      if (invalidFiles.length > 0) {
        showToast('Please select only image files', 'error');
        return;
      }

      if (files.length > maxFiles) {
        showToast(`Please select up to ${maxFiles} files`, 'error');
        return;
      }

      setSelectedFiles(files);
    },
    [maxFiles, allowedTypes, showToast],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Log file details before upload
      console.log('Uploading file:', {
        name: selectedFiles[0].name,
        type: selectedFiles[0].type,
        size: selectedFiles[0].size,
      });

      // Upload the image first with a projectId and metadata
      await uploadImage(selectedFiles[0], {
        projectId: 'default-project', // Use a default project ID or get it from props/context
        metadata: {
          transitionType,
          duration,
        },
      });

      // Only proceed if we have a successful image upload result
      if (result && result.imageUrl) {
        console.log('Image uploaded successfully:', result);

        // Generate a new video with the uploaded image
        const response = await videoService.generateVideo({
          imageUrl: result.imageUrl,
          prompt: `Generate video with ${transitionType} transition, duration: ${duration}s`,
          projectId: 'default-project',
        });

        if (response.error) {
          throw new Error(`Video generation failed: ${response.error.message}`);
        }

        // Set the prompt for video generation
        if (response.data) {
          console.log('Video generation started:', response.data);
          // Set the prompt for the video generation hook
          setPrompt(`Generate video with ${transitionType} transition, duration: ${duration}s`);
          // Then trigger generation
          handleGenerate();
        }

        showToast('Video generation started successfully', 'success');
        setSelectedFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error('Image upload completed but no URL was returned');
      }
    } catch (error: unknown) {
      console.error('Error uploading image:', error);
      if (error instanceof Error) {
        setError(error.message);
        showToast(error.message, 'error');
      } else {
        showToast('An error occurred while processing your request', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const fileList = event.dataTransfer.files;
      const files = Array.from(fileList) as File[];
      const invalidFiles = files.filter((file: File) => !allowedTypes.includes(file.type));

      if (invalidFiles.length > 0) {
        showToast('Please drop only image files', 'error');
        return;
      }

      if (files.length > maxFiles) {
        showToast(`Please drop up to ${maxFiles} files`, 'error');
        return;
      }

      setSelectedFiles(files);
    },
    [maxFiles, allowedTypes, showToast],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedTypes.join(',')}
          onChange={handleFileSelect}
          multiple={maxFiles > 1}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-sm text-gray-600 hover:text-gray-800"
          disabled={isUploading || isGenerating || isSubmitting}
        >
          Click to upload or drag and drop
        </button>
        {selectedFiles.length > 0 && (
          <p className="mt-2 text-sm text-gray-500">{selectedFiles.length} file(s) selected</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="transition" className="block text-sm font-medium text-gray-700">
            Transition Type
          </label>
          <select
            id="transition"
            value={transitionType}
            onChange={(e) => setTransitionType(e.target.value as 'fade' | 'slide' | 'zoom')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            disabled={isUploading || isGenerating || isSubmitting}
          >
            <option value="fade">Fade</option>
            <option value="slide">Slide</option>
            <option value="zoom">Zoom</option>
          </select>
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
            Duration (seconds)
          </label>
          <input
            type="number"
            id="duration"
            min="1"
            max="10"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            disabled={isUploading || isGenerating || isSubmitting}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isUploading || isGenerating || selectedFiles.length === 0 || isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
      >
        {isUploading ? 'Uploading...' : isGenerating ? 'Generating Video...' : 'Generate Video'}
      </button>
    </form>
  );
};
