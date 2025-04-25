import { appConfig } from './app';

/**
 * API Information Schema
 */
export interface ApiInfo {
  name: string;
  version: string;
  description: string;
  documentation: string;
  endpoints: {
    auth: string[];
    health: string[];
    projects: string[];
  };
}

/**
 * API Configuration
 * Provides centralized API information and documentation links
 */
export const apiConfig: ApiInfo = {
  name: appConfig.name,
  version: appConfig.version,
  description: 'Authentication service with Supabase integration',
  documentation: '/docs',
  endpoints: {
    auth: [
      '/auth/register',
      '/auth/login',
      '/auth/logout',
      '/auth/refresh',
      '/auth/me',
      '/auth/reset-password'
    ],
    health: [
      '/health'
    ],
    projects: [
      '/projects',
      '/projects/:id'
    ]
  }
};

/**
 * OpenAPI Configuration
 * Basic Swagger/OpenAPI configuration for API documentation
 */
export const openApiConfig = {
  openapi: '3.0.0',
  info: {
    title: apiConfig.name,
    version: apiConfig.version,
    description: apiConfig.description
  },
  servers: [
    {
      url: process.env.API_URL || `http://localhost:${process.env.PORT || '3000'}`,
      description: 'API Server'
    }
  ],
  security: [
    {
      bearerAuth: []
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'token'
      }
    }
  }
}; 