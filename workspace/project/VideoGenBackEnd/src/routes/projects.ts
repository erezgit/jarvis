import { Router } from 'express';
import { container } from 'tsyringe';
import { validateSession } from '../middleware/session';
import { TYPES } from '../lib/types';
import { ProjectService } from '../services/project/service';
import { AppError } from '../errors/base';
import { ErrorCode, HttpStatus, ErrorSeverity } from '../types/errors';
import { GenerationStatus } from '../services/video/types';
import type { ApiResponse, ErrorResponse } from '../types';
import type { Project, Generation, ProjectState, VideoListResponse } from '../services/project/types';

const router = Router();

// Get service instance from container
const projectService = container.resolve<ProjectService>(TYPES.ProjectService);

// Convert error to API error response
const toErrorResponse = (error: Error): ErrorResponse => ({
  code: error instanceof AppError ? error.code : ErrorCode.SERVICE_OPERATION_FAILED,
  message: error.message
});

// Routes
router.use(validateSession);

/**
 * Health check endpoint
 */
router.get('/health', async (req, res, next) => {
  try {
    const result = await projectService.checkDatabaseConnection();
    
    const response: ApiResponse = {
      success: result.success,
      error: result.error ? toErrorResponse(result.error) : undefined
    };

    res.status(result.success ? HttpStatus.OK : HttpStatus.INTERNAL_SERVER_ERROR)
       .json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * Get all projects for the authenticated user
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await projectService.getProjectsForUser(req.user!.id);
    
    const response: ApiResponse<Project[]> = {
      success: result.success,
      data: result.data,
      error: result.error ? toErrorResponse(result.error) : undefined
    };

    res.status(result.success ? HttpStatus.OK : HttpStatus.INTERNAL_SERVER_ERROR)
       .json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * Get a single project by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const result = await projectService.getProject(
      req.params.id,
      req.user!.id,
      req.user!.role
    );

    const response: ApiResponse<Project> = {
      success: result.success,
      data: result.data,
      error: result.error ? toErrorResponse(result.error) : undefined
    };

    res.status(result.success ? HttpStatus.OK : HttpStatus.INTERNAL_SERVER_ERROR)
       .json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * Update project state
 */
router.patch('/:id/state', async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !Object.values(GenerationStatus).includes(status)) {
      throw new AppError(
        HttpStatus.BAD_REQUEST,
        ErrorCode.INVALID_INPUT,
        'Invalid status value',
        ErrorSeverity.WARNING
      );
    }

    const result = await projectService.updateProjectState(
      req.params.id,
      req.user!.id,
      req.user!.role,
      { status }
    );

    const response: ApiResponse<Project> = {
      success: result.success,
      data: result.data,
      error: result.error ? toErrorResponse(result.error) : undefined
    };

    res.status(result.success ? HttpStatus.OK : HttpStatus.INTERNAL_SERVER_ERROR)
       .json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * Get project state
 */
router.get('/:id/state', async (req, res, next) => {
  try {
    const result = await projectService.getProjectState(
      req.params.id,
      req.user!.id,
      req.user!.role
    );

    const response: ApiResponse<ProjectState> = {
      success: result.success,
      data: result.data,
      error: result.error ? toErrorResponse(result.error) : undefined
    };

    res.status(result.success ? HttpStatus.OK : HttpStatus.INTERNAL_SERVER_ERROR)
       .json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * Get all videos for a project
 */
router.get('/:id/videos', async (req, res, next) => {
  try {
    const result = await projectService.getProjectVideos(req.params.id);
    
    const response: ApiResponse<VideoListResponse[]> = {
      success: result.success,
      data: result.data,
      error: result.error ? toErrorResponse(result.error) : undefined
    };

    res.status(result.success ? HttpStatus.OK : HttpStatus.INTERNAL_SERVER_ERROR)
       .json(response);
  } catch (error) {
    next(error);
  }
});

export default router; 
