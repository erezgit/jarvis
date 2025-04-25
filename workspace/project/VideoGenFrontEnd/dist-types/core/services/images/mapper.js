export class ImageMapper {
    static toUploadResult(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid upload result data');
        }
        const result = data;
        // Handle the nested response structure
        // The backend returns: { success: true, data: { success: true, projectId: "...", imageUrl: "..." } }
        if (result.data && typeof result.data === 'object') {
            const innerData = result.data;
            return {
                imageUrl: innerData.imageUrl || innerData.image_url || '',
                projectId: innerData.projectId || innerData.project_id || '',
            };
        }
        // Fallback to the old structure for backward compatibility
        return {
            imageUrl: result.imageUrl || result.image_url || '',
            projectId: result.projectId || result.project_id || '',
        };
    }
    static toStatusResponse(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid status response data');
        }
        const status = data;
        return {
            status: status.status,
            imageUrl: status.imageUrl || status.image_url,
            error: status.error,
        };
    }
    static toError(error) {
        if (error instanceof Error) {
            return {
                message: error.message,
                status: 500,
            };
        }
        if (typeof error === 'string') {
            return {
                message: error,
                status: 500,
            };
        }
        return {
            message: 'Unknown error occurred',
            status: 500,
        };
    }
}
