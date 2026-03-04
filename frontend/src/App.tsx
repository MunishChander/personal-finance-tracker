import { useState, useEffect, useRef } from 'react';
import { Asset, AssetInput } from '@personal-finance-tracker/shared';
import { useAssets } from './hooks/useAssets';
import { Dashboard } from './components/Dashboard';
import { AssetTabs } from './components/AssetTabs';
import { AssetForm } from './components/AssetForm';
import './App.css';

type TabType = 'fixed-deposits' | 'savings' | 'equities' | 'mutual-funds' | 'provident-funds';

function App() {
  const { assets, loading, error, addAsset, updateAsset, deleteAsset, refreshAssets, refreshEquityPrices, refreshMutualFundNavs } = useAssets();
  
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'light';
  });
  
  // Privacy mode state
  const [showAmounts, setShowAmounts] = useState<boolean>(() => {
    const saved = localStorage.getItem('showAmounts');
    return saved === null ? true : saved === 'true';
  });
  
  // Active tab state
  const [activeTab, setActiveTab] = useState<TabType>('fixed-deposits');
  const assetTabsRef = useRef<HTMLDivElement>(null);
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addAssetType, setAddAssetType] = useState<'fixed-deposit' | 'savings-account' | 'equity' | 'mutual-fund' | 'provident-fund'>('fixed-deposit');
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [deleteConfirmAsset, setDeleteConfirmAsset] = useState<Asset | null>(null);
  
  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Track if database is unavailable
  const isDatabaseUnavailable = error?.includes('Database unavailable') || error?.includes('Unable to reach');

  // Handle allocation card click
  const handleAllocationCardClick = (tab: TabType) => {
    setActiveTab(tab);
    // Scroll to asset tabs section
    setTimeout(() => {
      assetTabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Auto-refresh equity prices on load
  useEffect(() => {
    const hasEquities = assets.some(asset => asset.type === 'equity');
    if (hasEquities && !loading) {
      refreshEquityPrices().catch(err => {
        console.error('Failed to auto-refresh equity prices:', err);
      });
    }
  }, [assets.length]); // Only run when assets are first loaded

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Save privacy mode preference
  useEffect(() => {
    localStorage.setItem('showAmounts', showAmounts.toString());
  }, [showAmounts]);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  // Toggle privacy mode
  const togglePrivacy = () => {
    setShowAmounts(prev => !prev);
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

  // Handle add asset from tab
  const handleAddFromTab = (type: 'fixed-deposit' | 'savings-account' | 'equity' | 'mutual-fund' | 'provident-fund') => {
    setAddAssetType(type);
    setShowAddModal(true);
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

  // Handle refresh all prices (equity + MF)
  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);
  
  const handleRefreshAllPrices = async () => {
    setIsRefreshingPrices(true);
    try {
      await Promise.all([
        refreshEquityPrices(),
        refreshMutualFundNavs()
      ]);
      showToast('All prices refreshed successfully!', 'success');
    } catch (err) {
      showToast('Failed to refresh prices. Please try again.', 'error');
    } finally {
      setIsRefreshingPrices(false);
    }
  };

  // Handle refresh equity prices
  const handleRefreshEquityPrices = async () => {
    try {
      await refreshEquityPrices();
      showToast('Equity prices refreshed successfully!', 'success');
    } catch (err) {
      showToast('Failed to refresh equity prices. Please try again.', 'error');
      throw err;
    }
  };

  // Handle refresh mutual fund NAVs
  const handleRefreshMFNavs = async () => {
    try {
      await refreshMutualFundNavs();
      showToast('Mutual fund NAVs refreshed successfully!', 'success');
    } catch (err) {
      showToast('Failed to refresh mutual fund NAVs. Please try again.', 'error');
      throw err;
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
          <div className="header-right">
            <button 
              className="privacy-toggle" 
              onClick={togglePrivacy}
              title={showAmounts ? 'Hide amounts' : 'Show amounts'}
            >
              {showAmounts ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              )}
            </button>
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
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
            <Dashboard 
              assets={assets} 
              onRefreshPrices={handleRefreshAllPrices}
              isRefreshing={isRefreshingPrices}
              showAmounts={showAmounts}
              onAllocationCardClick={handleAllocationCardClick}
            />

            {/* Asset Tabs with Table View */}
            <div ref={assetTabsRef}>
              <AssetTabs
                assets={assets}
                onEdit={(asset) => setEditingAsset(asset)}
                onDelete={(assetId) => {
                  const asset = assets.find((a) => a.id === assetId);
                  if (asset) setDeleteConfirmAsset(asset);
                }}
                onAdd={handleAddFromTab}
                onRefreshPrices={handleRefreshEquityPrices}
                onRefreshMFNavs={handleRefreshMFNavs}
                showAmounts={showAmounts}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>
          </>
        )}
      </main>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <AssetForm
              assetType={addAssetType}
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
              Are you sure you want to delete this{' '}
              {deleteConfirmAsset.type === 'fixed-deposit' 
                ? 'Fixed Deposit' 
                : deleteConfirmAsset.type === 'savings-account'
                ? 'Savings Account'
                : deleteConfirmAsset.type === 'equity'
                ? 'Equity'
                : 'Mutual Fund'}{' '}
              from <strong>{deleteConfirmAsset.bankName}</strong>?
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
