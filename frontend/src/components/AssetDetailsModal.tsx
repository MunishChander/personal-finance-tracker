import React from 'react';
import { Asset, FixedDeposit, SavingsAccount, Equity, MutualFund, ProvidentFund } from '@personal-finance-tracker/shared';
import './AssetDetailsModal.css';

interface AssetDetailsModalProps {
  asset: Asset;
  onClose: () => void;
  onEdit: (asset: Asset) => void;
  onDelete: (assetId: string) => void;
  showAmounts: boolean;
}

export const AssetDetailsModal: React.FC<AssetDetailsModalProps> = ({
  asset,
  onClose,
  onEdit,
  onDelete,
  showAmounts,
}) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const displayAmount = (amount: number): string => {
    return showAmounts ? formatCurrency(amount) : '₹••••••';
  };

  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getDaysRemaining = (date: Date | string): number => {
    const now = new Date();
    const maturity = typeof date === 'string' ? new Date(date) : date;
    const diffTime = maturity.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleEdit = () => {
    onEdit(asset);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      onDelete(asset.id);
      onClose();
    }
  };

  const renderFixedDepositDetails = (fd: FixedDeposit) => {
    const daysRemaining = getDaysRemaining(fd.maturityDate);
    const maturingSoon = daysRemaining > 0 && daysRemaining <= 60;

    return (
      <>
        <div className="modal-header">
          <div className="modal-icon">🏦</div>
          <div className="modal-title-section">
            <h2 className="modal-title">{fd.bankName}</h2>
            <span className="modal-subtitle">Fixed Deposit</span>
          </div>
        </div>

        <div className="modal-body">
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Principal Amount</span>
              <span className="detail-value">{displayAmount(fd.principalAmount)}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Interest Rate</span>
              <span className="detail-value">{fd.interestRate}% p.a.</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Start Date</span>
              <span className="detail-value">{formatDate(fd.startDate)}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Maturity Date</span>
              <span className="detail-value">{formatDate(fd.maturityDate)}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Days Remaining</span>
              <span className={`detail-value ${maturingSoon ? 'warning-text' : ''}`}>
                {daysRemaining > 0 ? `${daysRemaining} days` : 'Matured'}
                {maturingSoon && <span className="badge-inline warning-badge">Maturing Soon</span>}
              </span>
            </div>

            <div className="detail-item highlight">
              <span className="detail-label">Maturity Amount</span>
              <span className="detail-value large">{displayAmount(fd.maturityAmount)}</span>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderSavingsAccountDetails = (sa: SavingsAccount) => {
    return (
      <>
        <div className="modal-header">
          <div className="modal-icon">💰</div>
          <div className="modal-title-section">
            <h2 className="modal-title">{sa.bankName}</h2>
            <span className="modal-subtitle">Savings Account</span>
          </div>
        </div>

        <div className="modal-body">
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Account Number</span>
              <span className="detail-value">****{sa.accountNumber.slice(-4)}</span>
            </div>

            <div className="detail-item highlight">
              <span className="detail-label">Current Balance</span>
              <span className="detail-value large">{displayAmount(sa.currentBalance)}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Interest Rate</span>
              <span className="detail-value">{sa.interestRate}% p.a.</span>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderEquityDetails = (eq: Equity) => {
    const hasCurrentPrice = eq.currentPrice !== undefined;
    const gainLossClass = eq.gainLoss && eq.gainLoss > 0 ? 'positive' : eq.gainLoss && eq.gainLoss < 0 ? 'negative' : '';

    return (
      <>
        <div className="modal-header">
          <div className="modal-icon">📈</div>
          <div className="modal-title-section">
            <h2 className="modal-title">{eq.companyName}</h2>
            <span className="modal-subtitle">{eq.symbol} • {eq.exchange}</span>
          </div>
        </div>

        <div className="modal-body">
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Broker</span>
              <span className="detail-value">{eq.bankName}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Quantity</span>
              <span className="detail-value">{eq.quantity} shares</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Average Price</span>
              <span className="detail-value">{displayAmount(eq.averagePrice)}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Current Price</span>
              <span className="detail-value">
                {hasCurrentPrice ? displayAmount(eq.currentPrice!) : 'Not available'}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Total Investment</span>
              <span className="detail-value">{displayAmount(eq.totalInvestment)}</span>
            </div>

            <div className="detail-item highlight">
              <span className="detail-label">Current Value</span>
              <span className="detail-value large">
                {eq.currentValue ? displayAmount(eq.currentValue) : displayAmount(eq.totalInvestment)}
              </span>
            </div>

            {eq.gainLoss !== undefined && (
              <>
                <div className={`detail-item ${gainLossClass}`}>
                  <span className="detail-label">Gain/Loss</span>
                  <span className="detail-value">
                    {showAmounts ? formatCurrency(Math.abs(eq.gainLoss)) : '₹••••••'}
                  </span>
                </div>

                <div className={`detail-item ${gainLossClass}`}>
                  <span className="detail-label">Return %</span>
                  <span className="detail-value">
                    {showAmounts ? `${eq.gainLossPercentage! > 0 ? '+' : ''}${eq.gainLossPercentage!.toFixed(2)}%` : '••••%'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </>
    );
  };

  const renderMutualFundDetails = (mf: MutualFund) => {
    const hasCurrentNav = mf.currentNav !== undefined;
    const gainLossClass = mf.gainLoss && mf.gainLoss > 0 ? 'positive' : mf.gainLoss && mf.gainLoss < 0 ? 'negative' : '';

    return (
      <>
        <div className="modal-header">
          <div className="modal-icon">📊</div>
          <div className="modal-title-section">
            <h2 className="modal-title">{mf.schemeName}</h2>
            <span className="modal-subtitle">{mf.fundHouse} • Code: {mf.schemeCode}</span>
          </div>
        </div>

        <div className="modal-body">
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Platform</span>
              <span className="detail-value">{mf.bankName}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Units</span>
              <span className="detail-value">{mf.units.toFixed(3)}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Average NAV</span>
              <span className="detail-value">{displayAmount(mf.averageNav)}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Current NAV</span>
              <span className="detail-value">
                {hasCurrentNav ? displayAmount(mf.currentNav!) : 'Not available'}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Total Investment</span>
              <span className="detail-value">{displayAmount(mf.totalInvestment)}</span>
            </div>

            <div className="detail-item highlight">
              <span className="detail-label">Current Value</span>
              <span className="detail-value large">
                {mf.currentValue ? displayAmount(mf.currentValue) : displayAmount(mf.totalInvestment)}
              </span>
            </div>

            {mf.gainLoss !== undefined && (
              <>
                <div className={`detail-item ${gainLossClass}`}>
                  <span className="detail-label">Gain/Loss</span>
                  <span className="detail-value">
                    {showAmounts ? formatCurrency(Math.abs(mf.gainLoss)) : '₹••••••'}
                  </span>
                </div>

                <div className={`detail-item ${gainLossClass}`}>
                  <span className="detail-label">Return %</span>
                  <span className="detail-value">
                    {showAmounts ? `${mf.gainLossPercentage! > 0 ? '+' : ''}${mf.gainLossPercentage!.toFixed(2)}%` : '••••%'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </>
    );
  };

  const renderProvidentFundDetails = (pf: ProvidentFund) => {
    const monthlyContribution = pf.monthlyContributionEmployee + pf.monthlyContributionEmployer;

    return (
      <>
        <div className="modal-header">
          <div className="modal-icon">🏛️</div>
          <div className="modal-title-section">
            <h2 className="modal-title">{pf.bankName}</h2>
            <span className="modal-subtitle">Provident Fund • UAN: ****{pf.uan.slice(-4)}</span>
          </div>
        </div>

        <div className="modal-body">
          <div className="detail-grid">
            <div className="detail-item highlight">
              <span className="detail-label">Current Balance</span>
              <span className="detail-value large">{displayAmount(pf.currentBalance)}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Employee Contribution</span>
              <span className="detail-value">{displayAmount(pf.monthlyContributionEmployee)}/month</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Employer Contribution</span>
              <span className="detail-value">{displayAmount(pf.monthlyContributionEmployer)}/month</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Total Monthly Contribution</span>
              <span className="detail-value">{displayAmount(monthlyContribution)}/month</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Interest Rate</span>
              <span className="detail-value">{pf.interestRate}% p.a.</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Last Updated</span>
              <span className="detail-value">{formatDate(pf.lastUpdatedDate)}</span>
            </div>

            {pf.projectedBalance && (
              <div className="detail-item">
                <span className="detail-label">Projected Balance (1 Year)</span>
                <span className="detail-value">{displayAmount(pf.projectedBalance)}</span>
              </div>
            )}

            {pf.projectedAnnualGrowth && (
              <div className="detail-item positive">
                <span className="detail-label">Projected Annual Growth</span>
                <span className="detail-value">{displayAmount(pf.projectedAnnualGrowth)}</span>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  const renderDetails = () => {
    switch (asset.type) {
      case 'fixed-deposit':
        return renderFixedDepositDetails(asset as FixedDeposit);
      case 'savings-account':
        return renderSavingsAccountDetails(asset as SavingsAccount);
      case 'equity':
        return renderEquityDetails(asset as Equity);
      case 'mutual-fund':
        return renderMutualFundDetails(asset as MutualFund);
      case 'provident-fund':
        return renderProvidentFundDetails(asset as ProvidentFund);
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="asset-details-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        {renderDetails()}

        <div className="modal-footer">
          <button className="btn-modal btn-edit" onClick={handleEdit}>
            Edit Asset
          </button>
          <button className="btn-modal btn-delete" onClick={handleDelete}>
            Delete Asset
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetDetailsModal;
