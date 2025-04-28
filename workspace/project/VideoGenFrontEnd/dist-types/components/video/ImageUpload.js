import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import { cn } from '@/lib/utils';
import { useImageUpload } from '@/core/hooks/images';
import { Button } from '@/components/ui/button';
import { ImageIcon, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
export function ImageUpload({ onSuccess, onUploadComplete, existingImageUrl, className, }) {
    const [previewUrl, setPreviewUrl] = useState(null);
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
    const createPreview = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewUrl(e.target?.result);
        };
        reader.readAsDataURL(file);
    };
    // Handle file input change
    const handleFileChange = async (e) => {
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
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const handleDrop = async (e) => {
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
    return (_jsx("div", { className: cn('space-y-4', className), children: _jsxs("div", { className: cn('relative flex items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed transition-colors overflow-hidden', !displayUrl && placeholderBgColor, displayUrl && !isUploading && uploadedBgColor, isUploading && placeholderBgColor, displayUrl && 'border-none'), onDrop: handleDrop, onDragOver: handleDragOver, onDragEnter: handleDragEnter, children: [isUploading && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-neutral-900/80 backdrop-blur-sm z-20", children: _jsxs("div", { className: "text-center", children: [_jsx(Loader2, { className: "w-8 h-8 animate-spin mx-auto mb-2 text-white" }), _jsxs("p", { className: "text-sm text-gray-300", children: ["Uploading... ", progress, "%"] })] }) })), error && (_jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-destructive/10 z-20", children: _jsx("div", { className: "text-center text-destructive", children: _jsx("p", { className: "text-sm", children: error }) }) })), displayUrl ? (_jsxs("div", { className: "absolute inset-0 w-full h-full", children: [_jsx("div", { className: cn('absolute inset-0', isUploading ? placeholderBgColor : uploadedBgColor) }), _jsx("div", { className: cn('absolute inset-0 flex items-center justify-center', isUploading && 'filter blur-sm opacity-70 z-10', !isUploading && 'z-10'), children: _jsx("img", { src: displayUrl, alt: "Upload preview", className: "max-w-full max-h-full object-contain" }) })] })) : (_jsxs("div", { className: "text-center", children: [_jsx(ImageIcon, { className: "w-6 h-6 mx-auto mb-2 text-gray-400" }), _jsx("label", { htmlFor: "image-upload", children: _jsx(Button, { size: "sm", className: "relative bg-neutral-800 text-white hover:bg-neutral-700 shadow-none", asChild: true, children: _jsxs("span", { children: ["Choose File", _jsx("input", { id: "image-upload", type: "file", className: "absolute inset-0 w-full h-full opacity-0 cursor-pointer", onChange: handleFileChange, accept: "image/*" })] }) }) })] }))] }) }));
}
