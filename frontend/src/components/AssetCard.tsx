import React from 'react';
import { Asset, FixedDeposit, SavingsAccount } from '@personal-finance-tracker/shared';
import './AssetCard.css';

interface AssetCardProps {
  asset: Asset;
  onEdit: () => void;
  onDelete: () => void;
}

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
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const AssetCard: React.FC<AssetCardProps> = ({ asset, onEdit, onDelete }) => {
  if (asset.type === 'fixed-deposit') {
    const fd = asset as FixedDeposit;
    const isMatured = fd.isMatured;
    const daysText = fd.daysToMaturity < 0 
      ? `Matured ${Math.abs(fd.daysToMaturity)} days ago`
      : `${fd.daysToMaturity} days to maturity`;

    return (
      <div className={`asset-card ${isMatured ? 'asset-card-matured' : ''}`}>
        <div className="asset-card-header">
          <div className="asset-type-badge asset-type-fd">Fixed Deposit</div>
          {isMatured && <div className="maturity-badge">Matured</div>}
        </div>

        <h3 className="asset-bank-name">{fd.bankName}</h3>
        {fd.accountNumber && (
          <p className="asset-account-number">A/C: {fd.accountNumber}</p>
        )}

        <div className="asset-details">
          <div className="asset-detail-row">
            <span className="detail-label">Principal Amount:</span>
            <span className="detail-value">{formatCurrency(fd.principalAmount)}</span>
          </div>
          <div className="asset-detail-row">
            <span className="detail-label">Maturity Amount:</span>
            <span className="detail-value detail-value-highlight">
              {formatCurrency(fd.maturityAmount)}
            </span>
          </div>
          <div className="asset-detail-row">
            <span className="detail-label">Interest Rate:</span>
            <span className="detail-value">{fd.interestRate}% p.a.</span>
          </div>
          <div className="asset-detail-row">
            <span className="detail-label">Start Date:</span>
            <span className="detail-value">{formatDate(fd.startDate)}</span>
          </div>
          <div className="asset-detail-row">
            <span className="detail-label">Maturity Date:</span>
            <span className="detail-value">{formatDate(fd.maturityDate)}</span>
          </div>
          <div className="asset-detail-row">
            <span className="detail-label">Status:</span>
            <span className={`detail-value ${isMatured ? 'status-matured' : 'status-active'}`}>
              {daysText}
            </span>
          </div>
        </div>

        <div className="asset-card-actions">
          <button className="btn btn-edit" onClick={onEdit}>
            Edit
          </button>
          <button className="btn btn-delete" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
    );
  } else {
    const sa = asset as SavingsAccount;

    return (
      <div className="asset-card">
        <div className="asset-card-header">
          <div className="asset-type-badge asset-type-sa">Savings Account</div>
        </div>

        <h3 className="asset-bank-name">{sa.bankName}</h3>
        <p className="asset-account-number">A/C: {sa.accountNumber}</p>

        <div className="asset-details">
          <div className="asset-detail-row">
            <span className="detail-label">Current Balance:</span>
            <span className="detail-value detail-value-highlight">
              {formatCurrency(sa.currentBalance)}
            </span>
          </div>
          {sa.interestRate !== undefined && (
            <div className="asset-detail-row">
              <span className="detail-label">Interest Rate:</span>
              <span className="detail-value">{sa.interestRate}% p.a.</span>
            </div>
          )}
        </div>

        <div className="asset-card-actions">
          <button className="btn btn-edit" onClick={onEdit}>
            Edit
          </button>
          <button className="btn btn-delete" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>
    );
  }
};

export default AssetCard;
