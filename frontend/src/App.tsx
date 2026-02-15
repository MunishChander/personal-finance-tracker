import { useState, useEffect } from 'react';
import { Asset, AssetInput } from '@personal-finance-tracker/shared';
import { useAssets } from './hooks/useAssets';
import { useFilters } from './hooks/useFilters';
import { Dashboard } from './components/Dashboard';
import { FilterPanel } from './components/FilterPanel';
import { AssetTabs } from './components/AssetTabs';
import { AssetForm } from './components/AssetForm';
import './App.css';

function App() {
  const { assets, loading, error, addAsset, updateAsset, deleteAsset, refreshAssets } = useAssets();
  const { filters, filteredAssets, setAssetTypeFilter, setBankFilter } = useFilters(assets);
  
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'light';
  });
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [deleteConfirmAsset, setDeleteConfirmAsset] = useState<Asset | null>(null);
  
  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Track if database is unavailable
  const isDatabaseUnavailable = error?.includes('Database unavailable') || error?.includes('Unable to reach');

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Handle retry connection
  const handleRetry = async () => {
    showToast('Retrying connection...', 'success');
    await refreshAssets();
  };

  // Handle add asset
  const handleAddAsset = async (assetInput: AssetInput) => {
    try {
      await addAsset(assetInput);
      setShowAddModal(false);
      showToast('Asset added successfully!', 'success');
    } catch (err) {
      showToast('Failed to add asset. Please try again.', 'error');
      throw err;
    }
  };

  // Handle edit asset
  const handleEditAsset = async (assetInput: AssetInput) => {
    if (!editingAsset) return;
    
    try {
      await updateAsset(editingAsset.id, assetInput);
      setEditingAsset(null);
      showToast('Asset updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to update asset. Please try again.', 'error');
      throw err;
    }
  };

  // Handle delete asset
  const handleDeleteAsset = async () => {
    if (!deleteConfirmAsset) return;
    
    try {
      await deleteAsset(deleteConfirmAsset.id);
      setDeleteConfirmAsset(null);
      showToast('Asset deleted successfully!', 'success');
    } catch (err) {
      showToast('Failed to delete asset. Please try again.', 'error');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
              <div className="logo-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" fillOpacity="0.9"/>
                  <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="logo-text">
                <h1>Personal Finance Tracker</h1>
                <p className="logo-subtitle">Manage your wealth with confidence</p>
              </div>
            </div>
          </div>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>
      
      <main className="app-main">
        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your assets...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="error-banner">
            <div className="error-content">
              <p>⚠️ {error}</p>
              {isDatabaseUnavailable && (
                <button 
                  className="btn btn-primary btn-retry"
                  onClick={handleRetry}
                >
                  🔄 Retry Connection
                </button>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        {!loading && (
          <>
            {/* Dashboard */}
            <Dashboard assets={assets} />

            {/* Add Asset Button */}
            <div className="action-bar">
              <button
                className="btn btn-primary btn-add-asset"
                onClick={() => setShowAddModal(true)}
              >
                + Add Asset
              </button>
            </div>

            {/* Filter Panel */}
            <FilterPanel
              filters={filters}
              onFilterChange={(newFilters) => {
                setAssetTypeFilter(newFilters.assetType);
                setBankFilter(newFilters.bankName);
              }}
            />

            {/* Asset Tabs with Table View */}
            <AssetTabs
              assets={filteredAssets}
              onEdit={(asset) => setEditingAsset(asset)}
              onDelete={(assetId) => {
                const asset = assets.find((a) => a.id === assetId);
                if (asset) setDeleteConfirmAsset(asset);
              }}
            />
          </>
        )}
      </main>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <AssetForm
              onSubmit={handleAddAsset}
              onCancel={() => setShowAddModal(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Asset Modal */}
      {editingAsset && (
        <div className="modal-overlay" onClick={() => setEditingAsset(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <AssetForm
              initialData={editingAsset}
              onSubmit={handleEditAsset}
              onCancel={() => setEditingAsset(null)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmAsset && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmAsset(null)}>
          <div className="modal-content modal-confirm" onClick={(e) => e.stopPropagation()}>
            <h2>Confirm Delete</h2>
            <p>
              Are you sure you want to delete this {deleteConfirmAsset.type === 'fixed-deposit' ? 'Fixed Deposit' : 'Savings Account'} from <strong>{deleteConfirmAsset.bankName}</strong>?
            </p>
            <p className="warning-text">This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteConfirmAsset(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteAsset}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default App;
