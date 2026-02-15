import React from 'react';
import { AssetFilters, AssetType } from '@personal-finance-tracker/shared';
import './FilterPanel.css';

interface FilterPanelProps {
  filters: AssetFilters;
  onFilterChange: (filters: AssetFilters) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
}) => {
  const handleAssetTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterChange({
      ...filters,
      assetType: value === '' ? null : (value as AssetType),
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      assetType: null,
      bankName: null,
    });
  };

  const hasActiveFilters = filters.assetType !== null;

  return (
    <div className="filter-panel">
      <h3 className="filter-title">Filters</h3>
      
      <div className="filter-controls">
        {/* Asset Type Filter */}
        <div className="filter-group">
          <label htmlFor="assetTypeFilter" className="filter-label">
            Asset Type
          </label>
          <select
            id="assetTypeFilter"
            className="filter-input"
            value={filters.assetType || ''}
            onChange={handleAssetTypeChange}
          >
            <option value="">All Types</option>
            <option value="fixed-deposit">Fixed Deposit</option>
            <option value="savings-account">Savings Account</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        <div className="filter-group filter-actions">
          <button
            type="button"
            className="btn btn-clear"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
