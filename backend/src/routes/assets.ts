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
  getStockPrice,
  refreshMutualFundNavs,
  searchMutualFundSchemes,
  getMutualFundNav,
  getMarketIndices,
} from '../controllers/assetsController';

const router = Router();

// Equity-specific endpoints (must come before :id route)
router.get('/equities/prices', refreshEquityPrices);
router.get('/equities/search', searchStockSymbols);
router.get('/equities/:symbol/price', getStockPrice);

// Mutual fund-specific endpoints
router.get('/mutualfunds/nav', refreshMutualFundNavs);
router.get('/mutualfunds/search', searchMutualFundSchemes);
router.get('/mutualfunds/:schemeCode/nav', getMutualFundNav);

// Stats endpoint must come before :id to avoid route conflicts
router.get('/stats', getAssetStats);

// Market indices endpoint
router.get('/market-indices', getMarketIndices);

// CRUD endpoints
router.post('/', createAsset);
router.get('/', getAllAssets);
router.get('/:id', getAssetById);
router.put('/:id', updateAsset);
router.delete('/:id', deleteAsset);

export default router;
