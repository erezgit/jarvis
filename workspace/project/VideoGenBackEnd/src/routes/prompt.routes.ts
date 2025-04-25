import express from 'express';
import { PromptService } from '../services/prompt/service';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../lib/server/logger';

const router = express.Router();
const promptService = new PromptService();

/**
 * @route GET /api/prompts/components
 * @desc Get all prompt components grouped by category
 * @access Private
 */
router.get('/components', authenticateToken, async (req, res) => {
  try {
    const result = await promptService.getPromptComponents();
    
    if (result.success) {
      return res.status(200).json(result.data);
    } else {
      logger.error('Failed to fetch prompt components', { error: result.error });
      return res.status(500).json({ error: result.error });
    }
  } catch (error) {
    logger.error('Unexpected error in prompt components endpoint', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 