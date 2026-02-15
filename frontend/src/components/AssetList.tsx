import React, { useState, useMemo } from 'react';
import { Asset, FixedDeposit } from '@personal-finance-tracker/shared';
import { AssetCard } from './AssetCard';
import './AssetList.css';

interface AssetListProps {
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onDelete: (assetId: string) => void;
}

type SortOption = 'none' | 'maturity-asc' | 'maturity-desc';

export const AssetList: React.FC<AssetListProps> = ({ assets, onEdit, onDelete }) => {
  const [sortBy, setSortBy] = useState<SortOption>('none');

  const sortedAssets = useMemo(() => {
    if (sortBy === 'none') {
      return assets;
    }

    const assetsCopy = [...assets];

    if (sortBy === 'maturity-asc' || sortBy === 'maturity-desc') {
      // Separate FDs and non-FDs
      const fixedDeposits = assetsCopy.filter(
        (asset): asset is FixedDeposit => asset.type === 'fixed-deposit'
      );
      const otherAssets = assetsCopy.filter(
        (asset) => asset.type !== 'fixed-deposit'
      );

      // Sort FDs by maturity date
      fixedDeposits.sort((a, b) => {
        const dateA = new Date(a.maturityDate).getTime();
        const dateB = new Date(b.maturityDate).getTime();
        return sortBy === 'maturity-asc' ? dateA - dateB : dateB - dateA;
      });

      // Return sorted FDs followed by other assets
      return [...fixedDeposits, ...otherAssets];
    }

    return assetsCopy;
  }, [assets, sortBy]);

  if (assets.length === 0) {
    return (
      <div className="asset-list-empty">
        <div className="empty-state">
          <svg
            className="empty-state-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="empty-state-title">No assets yet</h3>
          <p className="empty-state-message">
            Start tracking your finances by adding your first asset.
          </p>
        </div>
      </div>
    );
  }

  const hasFixedDeposits = assets.some((asset) => asset.type === 'fixed-deposit');

  return (
    <div className="asset-list-container">
      {hasFixedDeposits && (
        <div className="asset-list-controls">
          <label htmlFor="sort-select" className="sort-label">
            Sort by:
          </label>
          <select
            id="sort-select"
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="none">Default</option>
            <option value="maturity-asc">Maturity Date (Earliest First)</option>
            <option value="maturity-desc">Maturity Date (Latest First)</option>
          </select>
        </div>
      )}

      <div className="asset-list-grid">
        {sortedAssets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            onEdit={() => onEdit(asset)}
            onDelete={() => onDelete(asset.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default AssetList;
