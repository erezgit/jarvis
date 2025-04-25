export const STORAGE_CONFIG = {
  buckets: {
    images: {
      name: 'images',
      public: true,
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    },
    videos: {
      name: 'videos',
      public: true,
      maxSize: 100 * 1024 * 1024, // 100MB
      allowedTypes: ['video/mp4', 'video/webm']
    }
  },
  paths: {
    images: {
      project: (userId: string, projectId: string, fileName: string) => 
        `${userId}/${projectId}/${fileName}`,
      profile: (userId: string, fileName: string) =>
        `${userId}/profile/${fileName}`
    },
    videos: {
      project: (userId: string, projectId: string, fileName: string) =>
        `${userId}/${projectId}/${fileName}`,
      generation: (userId: string, generationId: string, fileName: string) =>
        `${userId}/${generationId}/${fileName}`
    }
  },
  validation: {
    validatePath: (path: string): boolean => {
      const parts = path.split('/');
      return parts.length === 3 && parts.every(Boolean);
    }
  }
}; 