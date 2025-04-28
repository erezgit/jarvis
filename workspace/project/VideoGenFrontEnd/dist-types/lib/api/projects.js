import { api, isApiError } from '@/lib/api';
/**
 * Fetches details for a specific project
 * @param projectId - The ID of the project to fetch
 * @returns Promise with project data or error
 */
export async function fetchProjectDetails(projectId) {
    console.log('=== FETCHING PROJECT DETAILS API CALL ===', {
        projectId,
        timestamp: new Date().toISOString(),
        endpoint: `/api/projects/${projectId}`,
    });
    try {
        const response = await api.get(`/api/projects/${projectId}`);
        if (isApiError(response)) {
            throw new Error(response.message);
        }
        // Log the raw response data to see exactly what we're getting
        console.log('=== RAW API RESPONSE DATA ===', {
            data: response.data,
            allResponseFields: Object.keys(response),
            allDataFields: Object.keys(response.data),
            timestamp: new Date().toISOString(),
        });
        // Check if we have the expected data structure
        const projectData = response.data;
        // Log the raw project data before normalization
        console.log('=== NORMALIZING PROJECT DATA ===', {
            rawData: projectData,
            hasGenerations: 'generations' in projectData,
            generationsType: projectData.generations ? typeof projectData.generations : 'undefined',
            timestamp: new Date().toISOString(),
        });
        // Return normalized data structure
        const normalizedData = {
            ...projectData,
            generations: Array.isArray(projectData.generations) ? projectData.generations : [],
        };
        console.log('=== NORMALIZED PROJECT DATA ===', {
            id: normalizedData.id,
            generationsCount: normalizedData.generations.length,
            timestamp: new Date().toISOString(),
        });
        return {
            data: normalizedData,
            error: null,
        };
    }
    catch (error) {
        console.error('[Project Details Error]:', {
            error,
            projectId,
            timestamp: new Date().toISOString(),
        });
        return {
            data: null,
            error: error instanceof Error ? error : new Error('Failed to fetch project details'),
        };
    }
}
/**
 * Validates a project ID format
 * @param projectId - The ID to validate
 * @returns boolean indicating if the ID is valid
 */
export function isValidProjectId(projectId) {
    // UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(projectId);
}
