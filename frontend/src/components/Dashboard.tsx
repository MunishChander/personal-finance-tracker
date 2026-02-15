import React from 'react';
import { Asset, FixedDeposit } from '@personal-finance-tracker/shared';
import './Dashboard.css';

interface DashboardProps {
  assets: Asset[];
}

interface DashboardStats {
  totalPortfolioValue: number;
  totalFixedDepositsCurrent: number;
  totalFixedDepositsMaturity: number;
  totalSavingsAccounts: number;
  fixedDepositCount: number;
  savingsAccountCount: number;
  maturingSoon: number;
}

const calculateStats = (assets: Asset[]): DashboardStats => {
  let totalFixedDepositsCurrent = 0;
  let totalFixedDepositsMaturity = 0;
  let totalSavingsAccounts = 0;
  let fixedDepositCount = 0;
  let savingsAccountCount = 0;
  let maturingSoon = 0;

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  assets.forEach((asset) => {
    if (asset.type === 'fixed-deposit') {
      const fd = asset as FixedDeposit;
      totalFixedDepositsCurrent += fd.principalAmount;
      totalFixedDepositsMaturity += fd.maturityAmount;
      fixedDepositCount++;

      // Check if maturing in next 30 days
      const maturityDate = new Date(fd.maturityDate);
      if (maturityDate >= now && maturityDate <= thirtyDaysFromNow) {
        maturingSoon++;
      }
    } else if (asset.type === 'savings-account') {
      totalSavingsAccounts += asset.currentBalance;
      savingsAccountCount++;
    }
  });

  const totalPortfolioValue = totalFixedDepositsCurrent + totalSavingsAccounts;

  return {
    totalPortfolioValue,
    totalFixedDepositsCurrent,
    totalFixedDepositsMaturity,
    totalSavingsAccounts,
    fixedDepositCount,
    savingsAccountCount,
    maturingSoon,
  };
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const Dashboard: React.FC<DashboardProps> = ({ assets }) => {
  const stats = calculateStats(assets);

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Portfolio Overview</h1>

      {/* Total Portfolio Value */}
      <div className="dashboard-card dashboard-card-primary">
        <h2 className="card-title">Total Portfolio Value</h2>
        <p className="card-value card-value-large">{formatCurrency(stats.totalPortfolioValue)}</p>
      </div>

      {/* Fixed Deposits Section */}
      <div className="dashboard-section">
        <h2 className="section-title">Fixed Deposits</h2>
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3 className="card-title">Current Value</h3>
            <p className="card-value">{formatCurrency(stats.totalFixedDepositsCurrent)}</p>
            <p className="card-subtitle">{stats.fixedDepositCount} deposit{stats.fixedDepositCount !== 1 ? 's' : ''}</p>
          </div>
          <div className="dashboard-card">
            <h3 className="card-title">Maturity Value</h3>
            <p className="card-value">{formatCurrency(stats.totalFixedDepositsMaturity)}</p>
            <p className="card-subtitle">
              Expected returns: {formatCurrency(stats.totalFixedDepositsMaturity - stats.totalFixedDepositsCurrent)}
            </p>
          </div>
          {stats.maturingSoon > 0 && (
            <div className="dashboard-card dashboard-card-warning">
              <h3 className="card-title">Maturing Soon</h3>
              <p className="card-value">{stats.maturingSoon}</p>
              <p className="card-subtitle">In next 30 days</p>
            </div>
          )}
        </div>
      </div>

      {/* Savings Accounts Section */}
      <div className="dashboard-section">
        <h2 className="section-title">Savings Accounts</h2>
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3 className="card-title">Total Balance</h3>
            <p className="card-value">{formatCurrency(stats.totalSavingsAccounts)}</p>
            <p className="card-subtitle">{stats.savingsAccountCount} account{stats.savingsAccountCount !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Asset Counts Summary */}
      <div className="dashboard-section">
        <h2 className="section-title">Asset Summary</h2>
        <div className="dashboard-grid">
          <div className="dashboard-card dashboard-card-info">
            <h3 className="card-title">Total Assets</h3>
            <p className="card-value">{assets.length}</p>
          </div>
          <div className="dashboard-card dashboard-card-info">
            <h3 className="card-title">Fixed Deposits</h3>
            <p className="card-value">{stats.fixedDepositCount}</p>
          </div>
          <div className="dashboard-card dashboard-card-info">
            <h3 className="card-title">Savings Accounts</h3>
            <p className="card-value">{stats.savingsAccountCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
