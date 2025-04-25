import { Router } from 'express';
import { container } from 'tsyringe';
import { DiscoveryService } from '../services/discovery/service';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../lib/server/logger';
import { TYPES } from '../lib/types';

const router = Router();

// Get the discovery service from the container
const discoveryService = container.resolve<DiscoveryService>(TYPES.DiscoveryService);

/**
 * Get all discovery items
 * This is the only endpoint needed for the Discovery page
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await discoveryService.getDiscoveries();
    
    if (result.success) {
      return res.status(200).json(result.data);
    } else {
      logger.error('Failed to fetch discovery items', { error: result.error });
      return res.status(500).json({ error: result.error });
    }
  } catch (error) {
    logger.error('Unexpected error in discovery items endpoint', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 