import React, { useState } from 'react';
import { Asset, FixedDeposit, SavingsAccount } from '@personal-finance-tracker/shared';
import './AssetTabs.css';

interface AssetTabsProps {
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onDelete: (assetId: string) => void;
}

type TabType = 'fixed-deposits' | 'savings';

export const AssetTabs: React.FC<AssetTabsProps> = ({ assets, onEdit, onDelete }) => {
  const [activeTab, setActiveTab] = useState<TabType>('fixed-deposits');

  const fixedDeposits = assets.filter((a): a is FixedDeposit => a.type === 'fixed-deposit');
  const savingsAccounts = assets.filter((a): a is SavingsAccount => a.type === 'savings-account');

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysRemaining = (maturityDate: string): number => {
    const now = new Date();
    const maturity = new Date(maturityDate);
    const diffTime = maturity.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isMaturingSoon = (maturityDate: string): boolean => {
    const daysRemaining = getDaysRemaining(maturityDate);
    return daysRemaining > 0 && daysRemaining <= 60;
  };

  const totalFDValue = fixedDeposits.reduce((sum, fd) => sum + fd.principalAmount, 0);
  const totalSavingsValue = savingsAccounts.reduce((sum, sa) => sum + sa.currentBalance, 0);

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
    </div>
  );
};

export default AssetTabs;
