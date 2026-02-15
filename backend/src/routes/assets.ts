/**
 * Assets Routes
 * Defines all routes for asset management
 */

import { Router } from 'express';
import {
  createAsset,
  getAllAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
  getAssetStats,
  refreshEquityPrices,
  searchStockSymbols,
} from '../controllers/assetsController';

const router = Router();

// Stats endpoint must come before :id to avoid route conflicts
router.get('/stats', getAssetStats);

// Equity-specific endpoints
router.get('/equities/prices', refreshEquityPrices);
router.get('/equities/search', searchStockSymbols);

// CRUD endpoints
router.post('/', createAsset);
router.get('/', getAllAssets);
router.get('/:id', getAssetById);
router.put('/:id', updateAsset);
router.delete('/:id', deleteAsset);

export default router;
