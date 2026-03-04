import React, { useState, useEffect } from 'react';
import { Asset, FixedDeposit, MutualFund, Equity, ProvidentFund, calculateAnnualizedReturn, calculateFDCurrentValue } from '@personal-finance-tracker/shared';
import './Dashboard.css';

type TabType = 'fixed-deposits' | 'savings' | 'equities' | 'mutual-funds' | 'provident-funds';

interface DashboardProps {
  assets: Asset[];
  onRefreshPrices?: () => void;
  isRefreshing?: boolean;
  showAmounts: boolean;
  onAllocationCardClick?: (tab: TabType) => void;
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
  totalProvidentFunds: number;
  fixedDepositCount: number;
  savingsAccountCount: number;
  equityCount: number;
  mutualFundCount: number;
  providentFundCount: number;
  maturingSoonCount: number;
  fdAverageReturn: number;
  savingsAverageReturn: number;
  pfAverageRate: number;
  equityXIRR: number | null;
  mfXIRR: number | null;
}

const calculateStats = (assets: Asset[]): DashboardStats => {
  let totalFixedDeposits = 0;
  let totalFixedDepositsPrincipal = 0;
  let totalSavingsAccounts = 0;
  let totalEquities = 0;
  let totalEquitiesInvested = 0;
  let totalEquitiesGainLoss = 0;
  let totalMutualFunds = 0;
  let totalMutualFundsInvested = 0;
  let totalMutualFundsGainLoss = 0;
  let totalProvidentFunds = 0;
  let fixedDepositCount = 0;
  let savingsAccountCount = 0;
  let equityCount = 0;
  let mutualFundCount = 0;
  let providentFundCount = 0;
  let maturingSoonCount = 0;
  
  // For average returns
  let fdTotalInterestRate = 0;
  let savingsTotalInterestRate = 0;
  let savingsWithInterestCount = 0;
  let pfTotalInterestRate = 0;
  
  // For XIRR calculation
  const equityCashFlows: Array<{ date: Date; amount: number }> = [];
  const mfCashFlows: Array<{ date: Date; amount: number }> = [];

  assets.forEach((asset) => {
    if (asset.type === 'fixed-deposit') {
      const fd = asset as FixedDeposit;
      // Calculate current value for portfolio total
      const currentValue = calculateFDCurrentValue(
        fd.principalAmount,
        fd.interestRate,
        fd.startDate,
        fd.maturityDate
      );
      totalFixedDeposits += currentValue;
      totalFixedDepositsPrincipal += fd.principalAmount;
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
    } else if (asset.type === 'provident-fund') {
      const pf = asset as ProvidentFund;
      totalProvidentFunds += pf.currentBalance;
      providentFundCount++;
      pfTotalInterestRate += pf.interestRate;
    }
  });

  const totalPortfolioValue = totalFixedDeposits + totalSavingsAccounts + totalEquities + totalMutualFunds + totalProvidentFunds;
  const totalInvested = totalFixedDepositsPrincipal + totalSavingsAccounts + totalEquitiesInvested + totalMutualFundsInvested + totalProvidentFunds;
  const totalGainLoss = totalEquitiesGainLoss + totalMutualFundsGainLoss;
  const totalGainLossPercentage = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;
  const totalEquitiesGainLossPercentage = totalEquitiesInvested > 0 ? (totalEquitiesGainLoss / totalEquitiesInvested) * 100 : 0;
  
  // Calculate average returns
  const fdAverageReturn = fixedDepositCount > 0 ? fdTotalInterestRate / fixedDepositCount : 0;
  const savingsAverageReturn = savingsWithInterestCount > 0 ? savingsTotalInterestRate / savingsWithInterestCount : 0;
  const pfAverageRate = providentFundCount > 0 ? pfTotalInterestRate / providentFundCount : 0;
  
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
    totalProvidentFunds,
    fixedDepositCount,
    savingsAccountCount,
    equityCount,
    mutualFundCount,
    providentFundCount,
    maturingSoonCount,
    fdAverageReturn,
    savingsAverageReturn,
    pfAverageRate,
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

const maskAmount = (): string => {
  return '₹••••••';
};

const displayAmount = (amount: number, showAmounts: boolean): string => {
  const formatted = formatCurrency(amount);
  return showAmounts ? formatted : maskAmount();
};

export const Dashboard: React.FC<DashboardProps> = ({ assets, showAmounts, onAllocationCardClick }) => {
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
  const pfPercentage = stats.totalPortfolioValue > 0 
    ? (stats.totalProvidentFunds / stats.totalPortfolioValue) * 100 
    : 0;

  return (
    <div className="dashboard-container">
      {/* Hero Section */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <div className="hero-layout">
            {/* Left Side - Main Stats */}
            <div className="hero-left">
              <div className="hero-header">
                <div>
                  <h1 className="hero-title">Portfolio Overview</h1>
                  <p className="hero-subtitle">Track your wealth across all investments</p>
                </div>
              </div>
              
              <div className="hero-stats-compact">
                <div className="hero-main-stat">
                  <span className="hero-label">Total Portfolio Value</span>
                  <span className="hero-value">{displayAmount(stats.totalPortfolioValue, showAmounts)}</span>
                </div>
                <div className="hero-secondary-stats-compact">
                  <div className="hero-stat-item-compact">
                    <span className="stat-label-compact">Invested</span>
                    <span className="stat-value-compact">{displayAmount(stats.totalInvested, showAmounts)}</span>
                  </div>
                  <div className="hero-stat-item-compact">
                    <span className="stat-label-compact">Returns</span>
                    <span className={`stat-value-compact ${stats.totalGainLoss >= 0 ? 'positive' : 'negative'}`}>
                      {showAmounts ? (
                        <>
                          {stats.totalGainLoss >= 0 ? '+' : ''}{formatCurrency(stats.totalGainLoss)}
                          <span className="stat-percentage-compact">
                            ({stats.totalGainLossPercentage >= 0 ? '+' : ''}{stats.totalGainLossPercentage.toFixed(2)}%)
                          </span>
                        </>
                      ) : (
                        '₹••••••'
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Side - Market Benchmarks */}
            {stats.totalEquities > 0 && (
              <div className="hero-right">
                <div className="market-benchmarks">
                  <div className="benchmarks-header">
                    <span className="benchmarks-title">Market Benchmarks</span>
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
                  <div className="benchmarks-grid">
                    {/* Your Portfolio */}
                    <div className="benchmark-item portfolio-benchmark">
                      <span className="benchmark-label">Your Equity</span>
                      <span className={`benchmark-value ${stats.totalEquitiesGainLoss >= 0 ? 'positive' : 'negative'}`}>
                        {showAmounts ? (
                          `${stats.totalEquitiesGainLossPercentage >= 0 ? '+' : ''}${stats.totalEquitiesGainLossPercentage.toFixed(2)}%`
                        ) : (
                          '••••%'
                        )}
                      </span>
                    </div>
                    
                    {/* Market Indices */}
                    {loadingIndices ? (
                      <>
                        <div className="benchmark-item">
                          <span className="benchmark-label skeleton skeleton-text-small"></span>
                          <span className="benchmark-value skeleton skeleton-text-small"></span>
                        </div>
                        <div className="benchmark-item">
                          <span className="benchmark-label skeleton skeleton-text-small"></span>
                          <span className="benchmark-value skeleton skeleton-text-small"></span>
                        </div>
                      </>
                    ) : (
                      marketIndices.map((index) => (
                        <div key={index.name} className="benchmark-item">
                          <span className="benchmark-label">{index.name} Returns</span>
                          <span className={`benchmark-value ${index.changePercent >= 0 ? 'positive' : 'negative'}`}>
                            {showAmounts ? (
                              `${index.changePercent >= 0 ? '+' : ''}${index.changePercent.toFixed(2)}%`
                            ) : (
                              '••••%'
                            )}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Asset Allocation Section */}
      <div className="allocation-section">
        <h3 className="section-title">Asset Allocation</h3>
        
        {/* Allocation Bar */}
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
          {pfPercentage > 0 && (
            <div 
              className="allocation-segment pf" 
              style={{ width: `${pfPercentage}%` }}
              title={`Provident Fund: ${pfPercentage.toFixed(1)}%`}
            />
          )}
        </div>
        
        {/* Detailed Allocation Cards */}
        <div className="allocation-details-grid">
          {/* Fixed Deposits */}
          {stats.fixedDepositCount > 0 && (
            <div 
              className="allocation-detail-card fd-card clickable-card" 
              onClick={() => onAllocationCardClick?.('fixed-deposits')}
              role="button"
              tabIndex={0}
            >
              <div className="allocation-card-header">
                <div className="allocation-card-icon fd-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                </div>
                <div className="allocation-card-title-section">
                  <h4 className="allocation-card-title">Fixed Deposits</h4>
                  <span className="allocation-card-percentage">{fdPercentage.toFixed(1)}%</span>
                </div>
              </div>
              <div className="allocation-card-stats">
                <div className="allocation-stat-row">
                  <span className="allocation-stat-label">Current Value</span>
                  <span className="allocation-stat-value">{displayAmount(stats.totalFixedDeposits, showAmounts)}</span>
                </div>
                <div className="allocation-stat-row">
                  <span className="allocation-stat-label">Avg. Return</span>
                  <span className="allocation-stat-value">{stats.fdAverageReturn.toFixed(2)}% p.a.</span>
                </div>
                <div className="allocation-stat-row">
                  <span className="allocation-stat-label">Count</span>
                  <span className="allocation-stat-value">{stats.fixedDepositCount} {stats.fixedDepositCount === 1 ? 'deposit' : 'deposits'}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Savings Accounts */}
          {stats.savingsAccountCount > 0 && (
            <div 
              className="allocation-detail-card savings-card clickable-card" 
              onClick={() => onAllocationCardClick?.('savings')}
              role="button"
              tabIndex={0}
            >
              <div className="allocation-card-header">
                <div className="allocation-card-icon savings-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                </div>
                <div className="allocation-card-title-section">
                  <h4 className="allocation-card-title">Savings Accounts</h4>
                  <span className="allocation-card-percentage">{savingsPercentage.toFixed(1)}%</span>
                </div>
              </div>
              <div className="allocation-card-stats">
                <div className="allocation-stat-row">
                  <span className="allocation-stat-label">Current Balance</span>
                  <span className="allocation-stat-value">{displayAmount(stats.totalSavingsAccounts, showAmounts)}</span>
                </div>
                {stats.savingsAverageReturn > 0 && (
                  <div className="allocation-stat-row">
                    <span className="allocation-stat-label">Avg. Interest</span>
                    <span className="allocation-stat-value">{stats.savingsAverageReturn.toFixed(2)}% p.a.</span>
                  </div>
                )}
                <div className="allocation-stat-row">
                  <span className="allocation-stat-label">Count</span>
                  <span className="allocation-stat-value">{stats.savingsAccountCount} {stats.savingsAccountCount === 1 ? 'account' : 'accounts'}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Equities */}
          {stats.equityCount > 0 && (
            <div 
              className="allocation-detail-card equity-card clickable-card" 
              onClick={() => onAllocationCardClick?.('equities')}
              role="button"
              tabIndex={0}
            >
              <div className="allocation-card-header">
                <div className="allocation-card-icon equity-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                </div>
                <div className="allocation-card-title-section">
                  <h4 className="allocation-card-title">Equities</h4>
                  <span className="allocation-card-percentage">{equitiesPercentage.toFixed(1)}%</span>
                </div>
              </div>
              <div className="allocation-card-stats">
                <div className="allocation-stat-row">
                  <span className="allocation-stat-label">Invested</span>
                  <span className="allocation-stat-value">{displayAmount(stats.totalEquitiesInvested, showAmounts)}</span>
                </div>
                <div className="allocation-stat-row">
                  <span className="allocation-stat-label">Current Value</span>
                  <span className="allocation-stat-value">{displayAmount(stats.totalEquities, showAmounts)}</span>
                </div>
                <div className="allocation-stat-row">
                  <span className="allocation-stat-label">Returns</span>
                  <span className={`allocation-stat-value ${stats.totalEquitiesGainLoss >= 0 ? 'positive' : 'negative'}`}>
                    {showAmounts ? (
                      <>
                        {stats.totalEquitiesGainLoss >= 0 ? '+' : ''}{formatCurrency(stats.totalEquitiesGainLoss)}
                        <span className="allocation-stat-percent">
                          ({stats.totalEquitiesGainLossPercentage >= 0 ? '+' : ''}{stats.totalEquitiesGainLossPercentage.toFixed(2)}%)
                        </span>
                      </>
                    ) : (
                      '₹••••••'
                    )}
                  </span>
                </div>
                {stats.equityXIRR !== null && !isNaN(stats.equityXIRR) && isFinite(stats.equityXIRR) && Math.abs(stats.equityXIRR) < 10 && (
                  <div className="allocation-stat-row">
                    <span className="allocation-stat-label">XIRR</span>
                    <span className={`allocation-stat-value ${stats.equityXIRR >= 0 ? 'positive' : 'negative'}`}>
                      {showAmounts ? (
                        `${stats.equityXIRR >= 0 ? '+' : ''}${(stats.equityXIRR * 100).toFixed(2)}% p.a.`
                      ) : (
                        '••••% p.a.'
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Mutual Funds */}
          {stats.mutualFundCount > 0 && (
            <div 
              className="allocation-detail-card mf-card clickable-card" 
              onClick={() => onAllocationCardClick?.('mutual-funds')}
              role="button"
              tabIndex={0}
            >
              <div className="allocation-card-header">
                <div className="allocation-card-icon mf-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                </div>
                <div className="allocation-card-title-section">
                  <h4 className="allocation-card-title">Mutual Funds</h4>
                  <span className="allocation-card-percentage">{mfPercentage.toFixed(1)}%</span>
                </div>
              </div>
              <div className="allocation-card-stats">
                <div className="allocation-stat-row">
                  <span className="allocation-stat-label">Invested</span>
                  <span className="allocation-stat-value">{displayAmount(stats.totalMutualFundsInvested, showAmounts)}</span>
                </div>
                <div className="allocation-stat-row">
                  <span className="allocation-stat-label">Current Value</span>
                  <span className="allocation-stat-value">{displayAmount(stats.totalMutualFunds, showAmounts)}</span>
                </div>
                <div className="allocation-stat-row">
                  <span className="allocation-stat-label">Returns</span>
                  <span className={`allocation-stat-value ${stats.totalMutualFundsGainLoss >= 0 ? 'positive' : 'negative'}`}>
                    {showAmounts ? (
                      <>
                        {stats.totalMutualFundsGainLoss >= 0 ? '+' : ''}{formatCurrency(stats.totalMutualFundsGainLoss)}
                        <span className="allocation-stat-percent">
                          ({(stats.totalMutualFundsInvested > 0 ? (stats.totalMutualFundsGainLoss / stats.totalMutualFundsInvested) * 100 : 0).toFixed(2)}%)
                        </span>
                      </>
                    ) : (
                      '₹••••••'
                    )}
                  </span>
                </div>
                {stats.mfXIRR !== null && !isNaN(stats.mfXIRR) && isFinite(stats.mfXIRR) && Math.abs(stats.mfXIRR) < 10 && (
                  <div className="allocation-stat-row">
                    <span className="allocation-stat-label">XIRR</span>
                    <span className={`allocation-stat-value ${stats.mfXIRR >= 0 ? 'positive' : 'negative'}`}>
                      {showAmounts ? (
                        `${stats.mfXIRR >= 0 ? '+' : ''}${(stats.mfXIRR * 100).toFixed(2)}% p.a.`
                      ) : (
                        '••••% p.a.'
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Provident Fund */}
          {stats.providentFundCount > 0 && (
            <div 
              className="allocation-detail-card pf-card clickable-card" 
              onClick={() => onAllocationCardClick?.('provident-funds')}
              role="button"
              tabIndex={0}
            >
              <div className="allocation-card-header">
                <div className="allocation-card-icon pf-icon">
                  🏛️
                </div>
                <div className="allocation-card-title-section">
                  <h4 className="allocation-card-title">Provident Fund</h4>
                  <span className="allocation-card-percentage">{pfPercentage.toFixed(1)}%</span>
                </div>
              </div>
              <div className="allocation-card-stats">
                <div className="allocation-stat-row">
                  <span className="allocation-stat-label">Current Balance</span>
                  <span className="allocation-stat-value">{displayAmount(stats.totalProvidentFunds, showAmounts)}</span>
                </div>
                <div className="allocation-stat-row">
                  <span className="allocation-stat-label">Avg. Interest</span>
                  <span className="allocation-stat-value">{stats.pfAverageRate.toFixed(2)}% p.a.</span>
                </div>
                <div className="allocation-stat-row">
                  <span className="allocation-stat-label">Count</span>
                  <span className="allocation-stat-value">{stats.providentFundCount} {stats.providentFundCount === 1 ? 'account' : 'accounts'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
