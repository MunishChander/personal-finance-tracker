import React, { useState, useEffect } from 'react';
import { Asset, FixedDeposit, MutualFund, Equity, calculateAnnualizedReturn } from '@personal-finance-tracker/shared';
import './Dashboard.css';

interface DashboardProps {
  assets: Asset[];
  onRefreshPrices?: () => void;
  isRefreshing?: boolean;
}

interface MarketIndex {
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface DashboardStats {
  totalPortfolioValue: number;
  totalInvested: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  totalFixedDeposits: number;
  totalSavingsAccounts: number;
  totalEquities: number;
  totalEquitiesInvested: number;
  totalEquitiesGainLoss: number;
  totalEquitiesGainLossPercentage: number;
  totalMutualFunds: number;
  totalMutualFundsInvested: number;
  totalMutualFundsGainLoss: number;
  fixedDepositCount: number;
  savingsAccountCount: number;
  equityCount: number;
  mutualFundCount: number;
  maturingSoonCount: number;
  fdAverageReturn: number;
  savingsAverageReturn: number;
  equityXIRR: number | null;
  mfXIRR: number | null;
}

const calculateStats = (assets: Asset[]): DashboardStats => {
  let totalFixedDeposits = 0;
  let totalSavingsAccounts = 0;
  let totalEquities = 0;
  let totalEquitiesInvested = 0;
  let totalEquitiesGainLoss = 0;
  let totalMutualFunds = 0;
  let totalMutualFundsInvested = 0;
  let totalMutualFundsGainLoss = 0;
  let fixedDepositCount = 0;
  let savingsAccountCount = 0;
  let equityCount = 0;
  let mutualFundCount = 0;
  let maturingSoonCount = 0;
  
  // For average returns
  let fdTotalInterestRate = 0;
  let savingsTotalInterestRate = 0;
  let savingsWithInterestCount = 0;
  
  // For XIRR calculation
  const equityCashFlows: Array<{ date: Date; amount: number }> = [];
  const mfCashFlows: Array<{ date: Date; amount: number }> = [];

  assets.forEach((asset) => {
    if (asset.type === 'fixed-deposit') {
      const fd = asset as FixedDeposit;
      totalFixedDeposits += fd.principalAmount;
      fixedDepositCount++;
      fdTotalInterestRate += fd.interestRate;
      
      // Check if maturing within 30 days
      if (fd.daysToMaturity !== null && fd.daysToMaturity <= 30 && fd.daysToMaturity >= 0) {
        maturingSoonCount++;
      }
    } else if (asset.type === 'savings-account') {
      totalSavingsAccounts += asset.currentBalance;
      savingsAccountCount++;
      if (asset.interestRate) {
        savingsTotalInterestRate += asset.interestRate;
        savingsWithInterestCount++;
      }
    } else if (asset.type === 'equity') {
      const equity = asset as Equity;
      const currentValue = equity.currentValue || equity.totalInvestment;
      totalEquities += currentValue;
      totalEquitiesInvested += equity.totalInvestment;
      totalEquitiesGainLoss += equity.gainLoss || 0;
      equityCount++;
      
      // Add cash flows for XIRR (investment as negative, current value as positive)
      equityCashFlows.push({
        date: asset.createdAt,
        amount: -equity.totalInvestment
      });
      equityCashFlows.push({
        date: new Date(),
        amount: currentValue
      });
    } else if (asset.type === 'mutual-fund') {
      const mf = asset as MutualFund;
      const currentValue = mf.currentValue || mf.totalInvestment;
      totalMutualFunds += currentValue;
      totalMutualFundsInvested += mf.totalInvestment;
      totalMutualFundsGainLoss += mf.gainLoss || 0;
      mutualFundCount++;
      
      // Add cash flows for XIRR
      mfCashFlows.push({
        date: asset.createdAt,
        amount: -mf.totalInvestment
      });
      mfCashFlows.push({
        date: new Date(),
        amount: currentValue
      });
    }
  });

  const totalPortfolioValue = totalFixedDeposits + totalSavingsAccounts + totalEquities + totalMutualFunds;
  const totalInvested = totalFixedDeposits + totalSavingsAccounts + totalEquitiesInvested + totalMutualFundsInvested;
  const totalGainLoss = totalEquitiesGainLoss + totalMutualFundsGainLoss;
  const totalGainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;
  const totalEquitiesGainLossPercentage = totalEquitiesInvested > 0 ? (totalEquitiesGainLoss / totalEquitiesInvested) * 100 : 0;
  
  // Calculate average returns
  const fdAverageReturn = fixedDepositCount > 0 ? fdTotalInterestRate / fixedDepositCount : 0;
  const savingsAverageReturn = savingsWithInterestCount > 0 ? savingsTotalInterestRate / savingsWithInterestCount : 0;
  
  // Calculate XIRR for equities and mutual funds
  const equityXIRR = equityCashFlows.length >= 2 ? calculateAnnualizedReturn(
    totalEquitiesInvested,
    totalEquities,
    equityCashFlows[0].date
  ) : null;
  
  const mfXIRR = mfCashFlows.length >= 2 ? calculateAnnualizedReturn(
    totalMutualFundsInvested,
    totalMutualFunds,
    mfCashFlows[0].date
  ) : null;

  return {
    totalPortfolioValue,
    totalInvested,
    totalGainLoss,
    totalGainLossPercentage,
    totalFixedDeposits,
    totalSavingsAccounts,
    totalEquities,
    totalEquitiesInvested,
    totalEquitiesGainLoss,
    totalEquitiesGainLossPercentage,
    totalMutualFunds,
    totalMutualFundsInvested,
    totalMutualFundsGainLoss,
    fixedDepositCount,
    savingsAccountCount,
    equityCount,
    mutualFundCount,
    maturingSoonCount,
    fdAverageReturn,
    savingsAverageReturn,
    equityXIRR,
    mfXIRR,
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
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return formatCurrency(amount);
};

export const Dashboard: React.FC<DashboardProps> = ({ assets, onRefreshPrices, isRefreshing }) => {
  const stats = calculateStats(assets);
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([]);
  const [loadingIndices, setLoadingIndices] = useState(false);

  // Fetch market indices on mount
  useEffect(() => {
    fetchMarketIndices();
  }, []);

  const fetchMarketIndices = async () => {
    setLoadingIndices(true);
    try {
      const response = await fetch('http://localhost:3000/api/assets/market-indices');
      const data = await response.json();
      if (data.success) {
        setMarketIndices(data.data);
      }
    } catch (error) {
      console.error('Error fetching market indices:', error);
    } finally {
      setLoadingIndices(false);
    }
  };

  // Calculate percentages for allocation bar
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

  return (
    <div className="dashboard-container">
      {/* Hero Section */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <div className="hero-header">
            <div>
              <h1 className="hero-title">Portfolio Overview</h1>
              <p className="hero-subtitle">Track your wealth across all investments</p>
            </div>
            {onRefreshPrices && (
              <button 
                className={`btn-refresh ${isRefreshing ? 'refreshing' : ''}`}
                onClick={onRefreshPrices}
                disabled={isRefreshing}
                title="Refresh live prices"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                </svg>
                {isRefreshing ? 'Refreshing...' : 'Refresh Prices'}
              </button>
            )}
          </div>
          
          <div className="hero-stats">
            <div className="hero-main-stat">
              <span className="hero-label">Total Portfolio Value</span>
              <span className="hero-value">{formatCurrency(stats.totalPortfolioValue)}</span>
            </div>
            <div className="hero-secondary-stats">
              <div className="hero-stat-item">
                <span className="stat-label">Total Invested</span>
                <span className="stat-value">{formatCurrency(stats.totalInvested)}</span>
              </div>
              <div className="hero-stat-item">
                <span className="stat-label">Total Returns</span>
                <span className={`stat-value ${stats.totalGainLoss >= 0 ? 'positive' : 'negative'}`}>
                  {stats.totalGainLoss >= 0 ? '+' : ''}{formatCurrency(stats.totalGainLoss)}
                  <span className="stat-percentage">
                    ({stats.totalGainLossPercentage >= 0 ? '+' : ''}{stats.totalGainLossPercentage.toFixed(2)}%)
                  </span>
                </span>
              </div>
            </div>
            
            {/* Market Comparison - Inline */}
            {stats.totalEquities > 0 && (
              <div className="hero-market-comparison">
                <div className="market-comparison-header">
                  <span className="market-comparison-title">Market Benchmarks</span>
                  <button 
                    className="btn-refresh-inline" 
                    onClick={fetchMarketIndices}
                    disabled={loadingIndices}
                    title="Refresh market data"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                    </svg>
                  </button>
                </div>
                <div className="market-indices-inline">
                  {/* Your Portfolio */}
                  <div className="market-index-inline portfolio-inline">
                    <span className="index-label">Your Equity</span>
                    <span className={`index-value ${stats.totalEquitiesGainLoss >= 0 ? 'positive' : 'negative'}`}>
                      {stats.totalEquitiesGainLossPercentage >= 0 ? '+' : ''}{stats.totalEquitiesGainLossPercentage.toFixed(2)}%
                    </span>
                  </div>
                  
                  {/* Market Indices */}
                  {loadingIndices ? (
                    <>
                      <div className="market-index-inline">
                        <span className="index-label skeleton skeleton-text-small"></span>
                        <span className="index-value skeleton skeleton-text-small"></span>
                      </div>
                      <div className="market-index-inline">
                        <span className="index-label skeleton skeleton-text-small"></span>
                        <span className="index-value skeleton skeleton-text-small"></span>
                      </div>
                    </>
                  ) : (
                    marketIndices.map((index) => (
                      <div key={index.name} className="market-index-inline">
                        <span className="index-label">{index.name} Returns</span>
                        <span className={`index-value ${index.changePercent >= 0 ? 'positive' : 'negative'}`}>
                          {index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Asset Allocation Bar */}
      <div className="allocation-section">
        <h3 className="section-title">Asset Allocation</h3>
        <div className="allocation-bar">
          {fdPercentage > 0 && (
            <div 
              className="allocation-segment fd" 
              style={{ width: `${fdPercentage}%` }}
              title={`Fixed Deposits: ${fdPercentage.toFixed(1)}%`}
            />
          )}
          {savingsPercentage > 0 && (
            <div 
              className="allocation-segment savings" 
              style={{ width: `${savingsPercentage}%` }}
              title={`Savings: ${savingsPercentage.toFixed(1)}%`}
            />
          )}
          {equitiesPercentage > 0 && (
            <div 
              className="allocation-segment equity" 
              style={{ width: `${equitiesPercentage}%` }}
              title={`Equities: ${equitiesPercentage.toFixed(1)}%`}
            />
          )}
          {mfPercentage > 0 && (
            <div 
              className="allocation-segment mf" 
              style={{ width: `${mfPercentage}%` }}
              title={`Mutual Funds: ${mfPercentage.toFixed(1)}%`}
            />
          )}
        </div>
        <div className="allocation-legend">
          <div className="legend-item">
            <span className="legend-dot fd"></span>
            <span>Fixed Deposits {fdPercentage.toFixed(1)}%</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot savings"></span>
            <span>Savings {savingsPercentage.toFixed(1)}%</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot equity"></span>
            <span>Equities {equitiesPercentage.toFixed(1)}%</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot mf"></span>
            <span>Mutual Funds {mfPercentage.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="stats-grid">
        {/* Fixed Deposits Card */}
        <div className="stat-card fd-card">
          <div className="card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <div className="card-content">
            <h4 className="card-title">Fixed Deposits</h4>
            <p className="card-value">{formatCompact(stats.totalFixedDeposits)}</p>
            <p className="card-subtitle">{stats.fixedDepositCount} {stats.fixedDepositCount === 1 ? 'deposit' : 'deposits'}</p>
            {stats.maturingSoonCount > 0 && (
              <div className="card-alert">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {stats.maturingSoonCount} maturing soon
              </div>
            )}
            {stats.fdAverageReturn > 0 && (
              <div className="card-metric">
                <span className="metric-label">Avg. Return:</span>
                <span className="metric-value">{stats.fdAverageReturn.toFixed(2)}% p.a.</span>
              </div>
            )}
          </div>
        </div>

        {/* Savings Card */}
        <div className="stat-card savings-card">
          <div className="card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
          </div>
          <div className="card-content">
            <h4 className="card-title">Savings Accounts</h4>
            <p className="card-value">{formatCompact(stats.totalSavingsAccounts)}</p>
            <p className="card-subtitle">{stats.savingsAccountCount} {stats.savingsAccountCount === 1 ? 'account' : 'accounts'}</p>
            {stats.savingsAverageReturn > 0 && (
              <div className="card-metric">
                <span className="metric-label">Avg. Interest:</span>
                <span className="metric-value">{stats.savingsAverageReturn.toFixed(2)}% p.a.</span>
              </div>
            )}
          </div>
        </div>

        {/* Equities Card */}
        <div className="stat-card equity-card">
          <div className="card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div className="card-content">
            <h4 className="card-title">Equities</h4>
            <p className="card-value">{formatCompact(stats.totalEquities)}</p>
            <p className="card-subtitle">{stats.equityCount} {stats.equityCount === 1 ? 'stock' : 'stocks'}</p>
            {stats.totalEquitiesGainLoss !== 0 && (
              <p className={`card-returns ${stats.totalEquitiesGainLoss >= 0 ? 'positive' : 'negative'}`}>
                {stats.totalEquitiesGainLoss >= 0 ? '+' : ''}{formatCompact(stats.totalEquitiesGainLoss)}
              </p>
            )}
            {stats.equityXIRR !== null && (
              <div className="card-metric">
                <span className="metric-label">XIRR:</span>
                <span className={`metric-value ${stats.equityXIRR >= 0 ? 'positive' : 'negative'}`}>
                  {stats.equityXIRR >= 0 ? '+' : ''}{(stats.equityXIRR * 100).toFixed(2)}% p.a.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Mutual Funds Card */}
        <div className="stat-card mf-card">
          <div className="card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <div className="card-content">
            <h4 className="card-title">Mutual Funds</h4>
            <p className="card-value">{formatCompact(stats.totalMutualFunds)}</p>
            <p className="card-subtitle">{stats.mutualFundCount} {stats.mutualFundCount === 1 ? 'fund' : 'funds'}</p>
            {stats.totalMutualFundsGainLoss !== 0 && (
              <p className={`card-returns ${stats.totalMutualFundsGainLoss >= 0 ? 'positive' : 'negative'}`}>
                {stats.totalMutualFundsGainLoss >= 0 ? '+' : ''}{formatCompact(stats.totalMutualFundsGainLoss)}
              </p>
            )}
            {stats.mfXIRR !== null && (
              <div className="card-metric">
                <span className="metric-label">XIRR:</span>
                <span className={`metric-value ${stats.mfXIRR >= 0 ? 'positive' : 'negative'}`}>
                  {stats.mfXIRR >= 0 ? '+' : ''}{(stats.mfXIRR * 100).toFixed(2)}% p.a.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
