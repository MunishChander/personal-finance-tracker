import React, { useState } from 'react';
import { Asset, FixedDeposit, SavingsAccount, Equity } from '@personal-finance-tracker/shared';
import './AssetTabs.css';

interface AssetTabsProps {
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onDelete: (assetId: string) => void;
  onRefreshPrices?: () => Promise<void>;
}

type TabType = 'fixed-deposits' | 'savings' | 'equities';

export const AssetTabs: React.FC<AssetTabsProps> = ({ assets, onEdit, onDelete, onRefreshPrices }) => {
  const [activeTab, setActiveTab] = useState<TabType>('fixed-deposits');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fixedDeposits = assets.filter((a): a is FixedDeposit => a.type === 'fixed-deposit');
  const savingsAccounts = assets.filter((a): a is SavingsAccount => a.type === 'savings-account');
  const equities = assets.filter((a): a is Equity => a.type === 'equity');

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysRemaining = (date: Date | string): number => {
    const now = new Date();
    const maturity = typeof date === 'string' ? new Date(date) : date;
    const diffTime = maturity.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isMaturingSoon = (date: Date | string): boolean => {
    const daysRemaining = getDaysRemaining(date);
    return daysRemaining > 0 && daysRemaining <= 60;
  };

  const totalFDValue = fixedDeposits.reduce((sum, fd) => sum + fd.principalAmount, 0);
  const totalSavingsValue = savingsAccounts.reduce((sum, sa) => sum + sa.currentBalance, 0);
  const totalEquitiesValue = equities.reduce((sum, eq) => sum + (eq.currentValue || eq.totalInvestment), 0);

  const handleRefreshPrices = async () => {
    if (!onRefreshPrices || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await onRefreshPrices();
    } catch (error) {
      console.error('Failed to refresh prices:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="asset-tabs-container">
      {/* Tab Buttons */}
      <div className="asset-tabs">
        <button
          className={`tab-button ${activeTab === 'fixed-deposits' ? 'active' : ''}`}
          onClick={() => setActiveTab('fixed-deposits')}
        >
          <span className="tab-icon">🏦</span>
          <span className="tab-label">Fixed Deposits</span>
          <span className="tab-count">{fixedDeposits.length}</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'savings' ? 'active' : ''}`}
          onClick={() => setActiveTab('savings')}
        >
          <span className="tab-icon">💰</span>
          <span className="tab-label">Savings Accounts</span>
          <span className="tab-count">{savingsAccounts.length}</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'equities' ? 'active' : ''}`}
          onClick={() => setActiveTab('equities')}
        >
          <span className="tab-icon">📈</span>
          <span className="tab-label">Equities</span>
          <span className="tab-count">{equities.length}</span>
        </button>
      </div>

      {/* Fixed Deposits Table */}
      {activeTab === 'fixed-deposits' && (
        <div className="asset-section">
          <div className="section-header">
            <span>🏦 Fixed Deposits ({fixedDeposits.length} assets)</span>
            <span className="section-value">{formatCurrency(totalFDValue)}</span>
          </div>

          {fixedDeposits.length === 0 ? (
            <div className="empty-state">
              <p>No fixed deposits yet. Add your first fixed deposit to start tracking.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="asset-table">
                <thead>
                  <tr>
                    <th>Bank</th>
                    <th className="text-right">Principal</th>
                    <th className="text-right">Interest Rate</th>
                    <th>Start Date</th>
                    <th>Maturity Date</th>
                    <th className="text-right">Days Remaining</th>
                    <th className="text-right">Maturity Amount</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fixedDeposits.map((fd) => {
                    const daysRemaining = getDaysRemaining(fd.maturityDate);
                    const maturingSoon = isMaturingSoon(fd.maturityDate);

                    return (
                      <tr key={fd.id} className={maturingSoon ? 'row-warning' : ''}>
                        <td>
                          <div className="asset-name">
                            <span className="name-primary">{fd.bankName}</span>
                            {maturingSoon && (
                              <span className="badge warning-badge">Maturing Soon</span>
                            )}
                          </div>
                        </td>
                        <td className="text-right">{formatCurrency(fd.principalAmount)}</td>
                        <td className="text-right">{fd.interestRate}%</td>
                        <td>{formatDate(fd.startDate)}</td>
                        <td>{formatDate(fd.maturityDate)}</td>
                        <td className="text-right">
                          <span className={`days-badge ${maturingSoon ? 'warning' : ''}`}>
                            {daysRemaining > 0 ? `${daysRemaining} days` : 'Matured'}
                          </span>
                        </td>
                        <td className="text-right value-cell">{formatCurrency(fd.maturityAmount)}</td>
                        <td className="text-center">
                          <div className="action-buttons">
                            <button
                              className="btn-action btn-edit-sm"
                              onClick={() => onEdit(fd)}
                              title="Edit"
                            >
                              Edit
                            </button>
                            <button
                              className="btn-action btn-delete-sm"
                              onClick={() => onDelete(fd.id)}
                              title="Delete"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Savings Accounts Table */}
      {activeTab === 'savings' && (
        <div className="asset-section">
          <div className="section-header">
            <span>💰 Savings Accounts ({savingsAccounts.length} accounts)</span>
            <span className="section-value">{formatCurrency(totalSavingsValue)}</span>
          </div>

          {savingsAccounts.length === 0 ? (
            <div className="empty-state">
              <p>No savings accounts yet. Add your first savings account to start tracking.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="asset-table">
                <thead>
                  <tr>
                    <th>Bank</th>
                    <th>Account Number</th>
                    <th className="text-right">Balance</th>
                    <th className="text-right">Interest Rate</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {savingsAccounts.map((sa) => (
                    <tr key={sa.id}>
                      <td>
                        <div className="asset-name">
                          <span className="name-primary">{sa.bankName}</span>
                          <span className="name-secondary">Savings Account</span>
                        </div>
                      </td>
                      <td>****{sa.accountNumber.slice(-4)}</td>
                      <td className="text-right value-cell">{formatCurrency(sa.currentBalance)}</td>
                      <td className="text-right">{sa.interestRate}%</td>
                      <td className="text-center">
                        <div className="action-buttons">
                          <button
                            className="btn-action btn-edit-sm"
                            onClick={() => onEdit(sa)}
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            className="btn-action btn-delete-sm"
                            onClick={() => onDelete(sa.id)}
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Equities Table */}
      {activeTab === 'equities' && (
        <div className="asset-section">
          <div className="section-header">
            <span>📈 Equities ({equities.length} holdings)</span>
            <div className="section-header-actions">
              {onRefreshPrices && equities.length > 0 && (
                <button
                  className="btn-refresh"
                  onClick={handleRefreshPrices}
                  disabled={isRefreshing}
                  title="Refresh live prices from Yahoo Finance"
                >
                  {isRefreshing ? '🔄 Refreshing...' : '🔄 Refresh Prices'}
                </button>
              )}
              <span className="section-value">{formatCurrency(totalEquitiesValue)}</span>
            </div>
          </div>

          {equities.length === 0 ? (
            <div className="empty-state">
              <p>No equities yet. Add your first equity holding to start tracking.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="asset-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Symbol</th>
                    <th>Broker</th>
                    <th className="text-right">Quantity</th>
                    <th className="text-right">Avg Price</th>
                    <th className="text-right">Current Price</th>
                    <th className="text-right">Investment</th>
                    <th className="text-right">Current Value</th>
                    <th className="text-right">Gain/Loss</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {equities.map((eq) => {
                    const hasCurrentPrice = eq.currentPrice !== undefined;
                    const gainLossClass = eq.gainLoss && eq.gainLoss > 0 ? 'positive' : eq.gainLoss && eq.gainLoss < 0 ? 'negative' : '';

                    return (
                      <tr key={eq.id}>
                        <td>
                          <div className="asset-name">
                            <span className="name-primary">{eq.companyName}</span>
                            <span className="name-secondary">{eq.exchange}</span>
                          </div>
                        </td>
                        <td>{eq.symbol}</td>
                        <td>{eq.bankName}</td>
                        <td className="text-right">{eq.quantity}</td>
                        <td className="text-right">{formatCurrency(eq.averagePrice)}</td>
                        <td className="text-right">
                          {hasCurrentPrice ? formatCurrency(eq.currentPrice!) : '-'}
                        </td>
                        <td className="text-right">{formatCurrency(eq.totalInvestment)}</td>
                        <td className="text-right value-cell">
                          {eq.currentValue ? formatCurrency(eq.currentValue) : formatCurrency(eq.totalInvestment)}
                        </td>
                        <td className={`text-right ${gainLossClass}`}>
                          {eq.gainLoss !== undefined ? (
                            <div className="gain-loss">
                              <span>{formatCurrency(Math.abs(eq.gainLoss))}</span>
                              <span className="gain-loss-percent">
                                ({eq.gainLossPercentage! > 0 ? '+' : ''}{eq.gainLossPercentage!.toFixed(2)}%)
                              </span>
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="text-center">
                          <div className="action-buttons">
                            <button
                              className="btn-action btn-edit-sm"
                              onClick={() => onEdit(eq)}
                              title="Edit"
                            >
                              Edit
                            </button>
                            <button
                              className="btn-action btn-delete-sm"
                              onClick={() => onDelete(eq.id)}
                              title="Delete"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssetTabs;
