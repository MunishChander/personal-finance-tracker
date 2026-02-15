import React from 'react';
import { Asset, FixedDeposit, MutualFund } from '@personal-finance-tracker/shared';
import './Dashboard.css';

interface DashboardProps {
  assets: Asset[];
}

interface DashboardStats {
  totalPortfolioValue: number;
  totalFixedDeposits: number;
  totalSavingsAccounts: number;
  totalEquities: number;
  totalMutualFunds: number;
  fixedDepositCount: number;
  savingsAccountCount: number;
  equityCount: number;
  mutualFundCount: number;
}

const calculateStats = (assets: Asset[]): DashboardStats => {
  let totalFixedDeposits = 0;
  let totalSavingsAccounts = 0;
  let totalEquities = 0;
  let totalMutualFunds = 0;
  let fixedDepositCount = 0;
  let savingsAccountCount = 0;
  let equityCount = 0;
  let mutualFundCount = 0;

  assets.forEach((asset) => {
    if (asset.type === 'fixed-deposit') {
      const fd = asset as FixedDeposit;
      totalFixedDeposits += fd.principalAmount;
      fixedDepositCount++;
    } else if (asset.type === 'savings-account') {
      totalSavingsAccounts += asset.currentBalance;
      savingsAccountCount++;
    } else if (asset.type === 'equity') {
      const equity = asset as any;
      totalEquities += equity.currentValue || equity.totalInvestment;
      equityCount++;
    } else if (asset.type === 'mutual-fund') {
      const mf = asset as MutualFund;
      totalMutualFunds += mf.currentValue || mf.totalInvestment;
      mutualFundCount++;
    }
  });

  const totalPortfolioValue = totalFixedDeposits + totalSavingsAccounts + totalEquities + totalMutualFunds;

  return {
    totalPortfolioValue,
    totalFixedDeposits,
    totalSavingsAccounts,
    totalEquities,
    totalMutualFunds,
    fixedDepositCount,
    savingsAccountCount,
    equityCount,
    mutualFundCount,
  };
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatCompact = (amount: number): string => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return formatCurrency(amount);
};

export const Dashboard: React.FC<DashboardProps> = ({ assets }) => {
  const stats = calculateStats(assets);

  // Calculate percentages for pie chart
  const fdPercentage = stats.totalPortfolioValue > 0 
    ? (stats.totalFixedDeposits / stats.totalPortfolioValue) * 100 
    : 0;
  const savingsPercentage = stats.totalPortfolioValue > 0 
    ? (stats.totalSavingsAccounts / stats.totalPortfolioValue) * 100 
    : 0;
  const equitiesPercentage = stats.totalPortfolioValue > 0 
    ? (stats.totalEquities / stats.totalPortfolioValue) * 100 
    : 0;
  const mfPercentage = stats.totalPortfolioValue > 0 
    ? (stats.totalMutualFunds / stats.totalPortfolioValue) * 100 
    : 0;

  // Calculate pie chart segments (SVG circle with circumference 502.65)
  const circumference = 502.65;
  const fdDashArray = `${(fdPercentage / 100) * circumference} ${circumference}`;
  const savingsDashArray = `${(savingsPercentage / 100) * circumference} ${circumference}`;
  const equitiesDashArray = `${(equitiesPercentage / 100) * circumference} ${circumference}`;
  const mfDashArray = `${(mfPercentage / 100) * circumference} ${circumference}`;
  const savingsDashOffset = -((fdPercentage / 100) * circumference);
  const equitiesDashOffset = -(((fdPercentage + savingsPercentage) / 100) * circumference);
  const mfDashOffset = -(((fdPercentage + savingsPercentage + equitiesPercentage) / 100) * circumference);

  return (
    <div className="portfolio-summary">
      <div className="summary-left">
        <h2>Portfolio Summary</h2>
        <div className="total-value">{formatCurrency(stats.totalPortfolioValue)}</div>
        
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Fixed Deposits</span>
            <span className="summary-value">{formatCompact(stats.totalFixedDeposits)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Savings Accounts</span>
            <span className="summary-value">{formatCompact(stats.totalSavingsAccounts)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Equities</span>
            <span className="summary-value">{formatCompact(stats.totalEquities)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Mutual Funds</span>
            <span className="summary-value">{formatCompact(stats.totalMutualFunds)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Assets</span>
            <span className="summary-value">{assets.length} items</span>
          </div>
        </div>
      </div>

      <div className="summary-right">
        <div className="pie-chart-container">
          <svg className="pie-chart" viewBox="0 0 200 200">
            {/* Fixed Deposits segment */}
            {fdPercentage > 0 && (
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#10b981"
                strokeWidth="40"
                strokeDasharray={fdDashArray}
                strokeDashoffset="0"
                transform="rotate(-90 100 100)"
                strokeLinecap="round"
              />
            )}
            {/* Savings segment */}
            {savingsPercentage > 0 && (
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="40"
                strokeDasharray={savingsDashArray}
                strokeDashoffset={savingsDashOffset}
                transform="rotate(-90 100 100)"
                strokeLinecap="round"
              />
            )}
            {/* Equities segment */}
            {equitiesPercentage > 0 && (
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="40"
                strokeDasharray={equitiesDashArray}
                strokeDashoffset={equitiesDashOffset}
                transform="rotate(-90 100 100)"
                strokeLinecap="round"
              />
            )}
            {/* Mutual Funds segment */}
            {mfPercentage > 0 && (
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="40"
                strokeDasharray={mfDashArray}
                strokeDashoffset={mfDashOffset}
                transform="rotate(-90 100 100)"
                strokeLinecap="round"
              />
            )}
            {/* Center circle for donut effect */}
            <circle cx="100" cy="100" r="60" className="center-circle" />
            {/* Center text */}
            <text x="100" y="95" textAnchor="middle" fontSize="14" fontWeight="600" fill="var(--text-tertiary)">
              Total
            </text>
            <text x="100" y="115" textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--text-primary)" className="center-text">
              {formatCompact(stats.totalPortfolioValue)}
            </text>
          </svg>
        </div>

        <div className="pie-legend">
          <div className="legend-item">
            <span className="legend-color" style={{ background: '#10b981' }}></span>
            <span className="legend-label">Fixed Deposits ({fdPercentage.toFixed(1)}%)</span>
            <span className="legend-value">{formatCompact(stats.totalFixedDeposits)}</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ background: '#f59e0b' }}></span>
            <span className="legend-label">Savings ({savingsPercentage.toFixed(1)}%)</span>
            <span className="legend-value">{formatCompact(stats.totalSavingsAccounts)}</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ background: '#8b5cf6' }}></span>
            <span className="legend-label">Equities ({equitiesPercentage.toFixed(1)}%)</span>
            <span className="legend-value">{formatCompact(stats.totalEquities)}</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ background: '#3b82f6' }}></span>
            <span className="legend-label">Mutual Funds ({mfPercentage.toFixed(1)}%)</span>
            <span className="legend-value">{formatCompact(stats.totalMutualFunds)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
