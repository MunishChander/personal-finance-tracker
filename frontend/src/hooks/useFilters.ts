/**
 * useFilters Hook
 * Manages filter state and applies filters to asset array
 */

import { useState, useMemo, useCallback } from 'react';
import { Asset, AssetFilters, AssetType } from '@personal-finance-tracker/shared';

export interface UseFiltersReturn {
  filters: AssetFilters;
  filteredAssets: Asset[];
  setAssetTypeFilter: (type: AssetType | null) => void;
  setBankFilter: (bank: string | null) => void;
  clearFilters: () => void;
}

/**
 * Custom hook for managing asset filters
 * Provides filter state management and filtered asset list
 */
export function useFilters(assets: Asset[]): UseFiltersReturn {
  const [filters, setFilters] = useState<AssetFilters>({
    assetType: null,
    bankName: null,
  });

  /**
   * Set asset type filter
   */
  const setAssetTypeFilter = useCallback((type: AssetType | null) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      assetType: type,
    }));
  }, []);

  /**
   * Set bank name filter
   */
  const setBankFilter = useCallback((bank: string | null) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      bankName: bank,
    }));
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters({
      assetType: null,
      bankName: null,
    });
  }, []);

  /**
   * Apply filters to asset array
   * Memoized to avoid unnecessary recalculations
   */
  const filteredAssets = useMemo(() => {
    let result = assets;

    // Apply asset type filter
    if (filters.assetType) {
      result = result.filter((asset) => asset.type === filters.assetType);
    }

    // Apply bank name filter
    if (filters.bankName) {
      result = result.filter(
        (asset) =>
          asset.bankName.toLowerCase() === filters.bankName!.toLowerCase()
      );
    }

    return result;
  }, [assets, filters]);

  return {
    filters,
    filteredAssets,
    setAssetTypeFilter,
    setBankFilter,
    clearFilters,
  };
}
