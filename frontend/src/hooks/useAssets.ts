/**
 * useAssets Hook
 * Manages asset state and CRUD operations with the backend API
 */

import { useState, useEffect, useCallback } from 'react';
import { Asset, AssetInput } from '@personal-finance-tracker/shared';
import {
  getAssets,
  createAsset,
  updateAsset as updateAssetApi,
  deleteAsset as deleteAssetApi,
  refreshEquityPrices as refreshEquityPricesApi,
  refreshMutualFundNavs as refreshMutualFundNavsApi,
  ApiError,
} from '../services/api';

export interface UseAssetsReturn {
  assets: Asset[];
  loading: boolean;
  error: string | null;
  addAsset: (asset: AssetInput) => Promise<void>;
  updateAsset: (id: string, asset: AssetInput) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  refreshAssets: () => Promise<void>;
  refreshEquityPrices: () => Promise<void>;
  refreshMutualFundNavs: () => Promise<void>;
}

/**
 * Custom hook for managing assets
 * Provides CRUD operations and state management for assets
 */
export function useAssets(): UseAssetsReturn {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all assets from the API
   */
  const refreshAssets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedAssets = await getAssets();
      setAssets(fetchedAssets);
    } catch (err) {
      const errorMessage =
        err instanceof ApiError ? err.message : 'Failed to fetch assets';
      setError(errorMessage);
      console.error('Error fetching assets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load assets on mount
   */
  useEffect(() => {
    refreshAssets();
  }, [refreshAssets]);

  /**
   * Add a new asset
   */
  const addAsset = useCallback(
    async (assetInput: AssetInput): Promise<void> => {
      try {
        setError(null);
        const newAsset = await createAsset(assetInput);
        setAssets((prevAssets) => [...prevAssets, newAsset]);
      } catch (err) {
        const errorMessage =
          err instanceof ApiError ? err.message : 'Failed to add asset';
        setError(errorMessage);
        console.error('Error adding asset:', err);
        throw err; // Re-throw to allow caller to handle
      }
    },
    []
  );

  /**
   * Update an existing asset
   */
  const updateAsset = useCallback(
    async (id: string, assetInput: AssetInput): Promise<void> => {
      try {
        setError(null);
        const updatedAsset = await updateAssetApi(id, assetInput);
        setAssets((prevAssets) =>
          prevAssets.map((asset) => (asset.id === id ? updatedAsset : asset))
        );
      } catch (err) {
        const errorMessage =
          err instanceof ApiError ? err.message : 'Failed to update asset';
        setError(errorMessage);
        console.error('Error updating asset:', err);
        throw err; // Re-throw to allow caller to handle
      }
    },
    []
  );

  /**
   * Delete an asset
   */
  const deleteAsset = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await deleteAssetApi(id);
      setAssets((prevAssets) => prevAssets.filter((asset) => asset.id !== id));
    } catch (err) {
      const errorMessage =
        err instanceof ApiError ? err.message : 'Failed to delete asset';
      setError(errorMessage);
      console.error('Error deleting asset:', err);
      throw err; // Re-throw to allow caller to handle
    }
  }, []);

  /**
   * Refresh equity prices from Yahoo Finance
   */
  const refreshEquityPrices = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      const updatedEquities = await refreshEquityPricesApi();
      
      // Update only equity assets with new prices
      setAssets((prevAssets) =>
        prevAssets.map((asset) => {
          if (asset.type === 'equity') {
            const updatedEquity = updatedEquities.find((eq) => eq.id === asset.id);
            return updatedEquity || asset;
          }
          return asset;
        })
      );
    } catch (err) {
      const errorMessage =
        err instanceof ApiError ? err.message : 'Failed to refresh equity prices';
      setError(errorMessage);
      console.error('Error refreshing equity prices:', err);
      throw err; // Re-throw to allow caller to handle
    }
  }, []);

  /**
   * Refresh mutual fund NAVs from MFApi
   */
  const refreshMutualFundNavs = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      const updatedMutualFunds = await refreshMutualFundNavsApi();
      
      // Update only mutual fund assets with new NAVs
      setAssets((prevAssets) =>
        prevAssets.map((asset) => {
          if (asset.type === 'mutual-fund') {
            const updatedMF = updatedMutualFunds.find((mf) => mf.id === asset.id);
            return updatedMF || asset;
          }
          return asset;
        })
      );
    } catch (err) {
      const errorMessage =
        err instanceof ApiError ? err.message : 'Failed to refresh mutual fund NAVs';
      setError(errorMessage);
      console.error('Error refreshing mutual fund NAVs:', err);
      throw err; // Re-throw to allow caller to handle
    }
  }, []);

  return {
    assets,
    loading,
    error,
    addAsset,
    updateAsset,
    deleteAsset,
    refreshAssets,
    refreshEquityPrices,
    refreshMutualFundNavs,
  };
}
