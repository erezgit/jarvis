/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { cn } from '@/lib/utils';
import { useImageUpload } from '@/core/hooks/images';
import { Button } from '@/components/ui/button';
import { ImageIcon, Loader2 } from 'lucide-react';
import type { DragEvent } from 'react';
import type { ImageUploadResult } from '@/core/services/images';
import { useState, useEffect } from 'react';

interface ImageUploadProps {
  onSuccess: (result: ImageUploadResult) => void;
  onUploadComplete?: (url: string) => void;
  existingImageUrl?: string;
  className?: string;
}

export function ImageUpload({
  onSuccess,
  onUploadComplete,
  existingImageUrl,
  className,
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { uploadImage, isUploading, progress, error, result } = useImageUpload({
    onSuccess,
    onProgress: (progress) => {
      console.log('=== IMAGE UPLOAD PROGRESS ===', {
        progress,
        timestamp: new Date().toISOString(),
      });
    },
    onError: (error) => {
      console.error('=== IMAGE UPLOAD ERROR ===', {
        error,
        timestamp: new Date().toISOString(),
      });
    },
  });

  // Update display URL when result changes
  useEffect(() => {
    if (result?.imageUrl) {
      onUploadComplete?.(result.imageUrl);
    }
  }, [result, onUploadComplete]);

  // Create a preview immediately when a file is selected
  const createPreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle file input change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Show preview immediately
      createPreview(file);

      // Start upload
      await uploadImage(file, {
        projectId: 'default-project',
        metadata: {
          source: 'file-input',
          timestamp: new Date().toISOString(),
        },
      });
    }
  };

  // Handle drag events
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file) {
      // Show preview immediately
      createPreview(file);

      // Start upload
      await uploadImage(file, {
        projectId: 'default-project',
        metadata: {
          source: 'drag-and-drop',
          timestamp: new Date().toISOString(),
        },
      });
    }
  };

  // Determine which URL to display (priority: preview during upload, result after upload, existing)
  const displayUrl = isUploading && previewUrl ? previewUrl : result?.imageUrl || existingImageUrl;

  // Dark gray background color for placeholder and during upload
  const placeholderBgColor = 'bg-neutral-900';

  // Background color for when image is uploaded and displayed
  const uploadedBgColor = 'bg-background'; // This should match the container underneath

  return (
    <div className={cn('space-y-4', className)}>
      <div
        className={cn(
          'relative flex items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed transition-colors overflow-hidden',
          !displayUrl && placeholderBgColor,
          displayUrl && !isUploading && uploadedBgColor,
          isUploading && placeholderBgColor,
          displayUrl && 'border-none',
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
      >
        {/* Loading overlay */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/80 backdrop-blur-sm z-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-white" />
              <p className="text-sm text-gray-300">Uploading... {progress}%</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-destructive/10 z-20">
            <div className="text-center text-destructive">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Preview or placeholder */}
        {displayUrl ? (
          <div className="absolute inset-0 w-full h-full">
            {/* Background container - changes based on upload state */}
            <div
              className={cn('absolute inset-0', isUploading ? placeholderBgColor : uploadedBgColor)}
            ></div>

            {/* Image container */}
            <div
              className={cn(
                'absolute inset-0 flex items-center justify-center',
                isUploading && 'filter blur-sm opacity-70 z-10',
                !isUploading && 'z-10',
              )}
            >
              <img
                src={displayUrl}
                alt="Upload preview"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        ) : (
          <div className="text-center">
            <ImageIcon className="w-6 h-6 mx-auto mb-2 text-gray-400" />
            <label htmlFor="image-upload">
              <Button
                size="sm"
                className="relative bg-neutral-800 text-white hover:bg-neutral-700 shadow-none"
                asChild
              >
                <span>
                  Choose File
                  <input
                    id="image-upload"
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </span>
              </Button>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
