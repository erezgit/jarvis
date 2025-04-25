import type { Category } from '../types';

/**
 * Mock data for prompt categories and options
 * This will be used until the backend API is available
 */
export const mockCategories: Category[] = [
  {
    id: 'environment',
    name: 'Environment',
    options: [
      {
        id: 'env-1',
        text: 'Office',
        category: 'environment',
        imageUrl: 'https://picsum.photos/seed/env1/200',
      },
      {
        id: 'env-2',
        text: 'Outdoor',
        category: 'environment',
        imageUrl: 'https://picsum.photos/seed/env2/200',
      },
      {
        id: 'env-3',
        text: 'Studio',
        category: 'environment',
        imageUrl: 'https://picsum.photos/seed/env3/200',
      },
      {
        id: 'env-4',
        text: 'Urban',
        category: 'environment',
        imageUrl: 'https://picsum.photos/seed/env4/200',
      },
      {
        id: 'env-5',
        text: 'Nature',
        category: 'environment',
        imageUrl: 'https://picsum.photos/seed/env5/200',
      },
    ],
  },
  {
    id: 'product',
    name: 'Product',
    options: [
      {
        id: 'prod-1',
        text: 'Close-up',
        category: 'product',
        imageUrl: 'https://picsum.photos/seed/prod1/200',
      },
      {
        id: 'prod-2',
        text: 'Floating',
        category: 'product',
        imageUrl: 'https://picsum.photos/seed/prod2/200',
      },
      {
        id: 'prod-3',
        text: 'Minimal',
        category: 'product',
        imageUrl: 'https://picsum.photos/seed/prod3/200',
      },
      {
        id: 'prod-4',
        text: 'Showcase',
        category: 'product',
        imageUrl: 'https://picsum.photos/seed/prod4/200',
      },
      {
        id: 'prod-5',
        text: 'Display',
        category: 'product',
        imageUrl: 'https://picsum.photos/seed/prod5/200',
      },
    ],
  },
  {
    id: 'dynamic',
    name: 'Dynamic',
    options: [
      {
        id: 'dyn-1',
        text: 'Floating',
        category: 'dynamic',
        imageUrl: 'https://picsum.photos/seed/dyn1/200',
      },
      {
        id: 'dyn-2',
        text: 'Spin',
        category: 'dynamic',
        imageUrl: 'https://picsum.photos/seed/dyn2/200',
      },
      {
        id: 'dyn-3',
        text: 'Zoom',
        category: 'dynamic',
        imageUrl: 'https://picsum.photos/seed/dyn3/200',
      },
      {
        id: 'dyn-4',
        text: 'Fade',
        category: 'dynamic',
        imageUrl: 'https://picsum.photos/seed/dyn4/200',
      },
      {
        id: 'dyn-5',
        text: 'Slide',
        category: 'dynamic',
        imageUrl: 'https://picsum.photos/seed/dyn5/200',
      },
    ],
  },
];

/**
 * Helper function to simulate API delay
 */
export const mockDelay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms));
