import React, { useState, useEffect } from 'react';
import {
  AssetInput,
  ValidationError,
  validateFixedDeposit,
  validateSavingsAccount,
  FixedDeposit,
  SavingsAccount,
} from '@personal-finance-tracker/shared';
import { StockSearch } from './StockSearch';
import './AssetForm.css';

type FixedDepositInput = Omit<FixedDeposit, 'id' | 'createdAt' | 'updatedAt' | 'maturityAmount' | 'daysToMaturity' | 'isMatured'>;
type SavingsAccountInput = Omit<SavingsAccount, 'id' | 'createdAt' | 'updatedAt'>;
type EquityInput = Omit<any, 'id' | 'createdAt' | 'updatedAt'>;

interface AssetFormProps {
  assetType?: 'fixed-deposit' | 'savings-account' | 'equity';
  initialData?: AssetInput | any;
  onSubmit: (asset: AssetInput) => Promise<void>;
  onCancel: () => void;
}

export const AssetForm: React.FC<AssetFormProps> = ({
  assetType: initialAssetType,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const isEditMode = !!initialData;
  
  // Form state
  const [assetType, setAssetType] = useState<'fixed-deposit' | 'savings-account' | 'equity'>(
    initialData?.type || initialAssetType || 'fixed-deposit'
  );
  const [bankName, setBankName] = useState(initialData?.bankName || '');
  const [accountNumber, setAccountNumber] = useState<string>(() => {
    if (initialData?.type === 'savings-account') {
      return initialData.accountNumber || '';
    }
    if (initialData?.type === 'fixed-deposit' && initialData.accountNumber) {
      return initialData.accountNumber;
    }
    return '';
  });
  
  // Fixed Deposit fields
  const [principalAmount, setPrincipalAmount] = useState(() => {
    if (initialData?.type === 'fixed-deposit') {
      const fdData = initialData as FixedDepositInput;
      return fdData.principalAmount.toString();
    }
    return '';
  });
  const [interestRate, setInterestRate] = useState(() => {
    if (initialData?.type === 'fixed-deposit') {
      const fdData = initialData as FixedDepositInput;
      return fdData.interestRate.toString();
    }
    if (initialData?.type === 'savings-account') {
      const saData = initialData as SavingsAccountInput;
      if (saData.interestRate !== undefined) {
        return saData.interestRate.toString();
      }
    }
    return '';
  });
  const [startDate, setStartDate] = useState(() => {
    if (initialData?.type === 'fixed-deposit') {
      const fdData = initialData as FixedDepositInput;
      return formatDateForInput(fdData.startDate);
    }
    return '';
  });
  const [maturityDate, setMaturityDate] = useState(() => {
    if (initialData?.type === 'fixed-deposit') {
      const fdData = initialData as FixedDepositInput;
      return formatDateForInput(fdData.maturityDate);
    }
    return '';
  });
  
  // Savings Account fields
  const [currentBalance, setCurrentBalance] = useState(() => {
    if (initialData?.type === 'savings-account') {
      const saData = initialData as SavingsAccountInput;
      return saData.currentBalance.toString();
    }
    return '';
  });
  
  // Equity fields
  const [symbol, setSymbol] = useState(() => {
    if (initialData?.type === 'equity') {
      return (initialData as any).symbol || '';
    }
    return '';
  });
  const [companyName, setCompanyName] = useState(() => {
    if (initialData?.type === 'equity') {
      return (initialData as any).companyName || '';
    }
    return '';
  });
  const [exchange, setExchange] = useState<'NSE' | 'BSE'>(() => {
    if (initialData?.type === 'equity') {
      return (initialData as any).exchange || 'NSE';
    }
    return 'NSE';
  });
  const [quantity, setQuantity] = useState(() => {
    if (initialData?.type === 'equity') {
      return (initialData as any).quantity?.toString() || '';
    }
    return '';
  });
  const [averagePrice, setAveragePrice] = useState(() => {
    if (initialData?.type === 'equity') {
      return (initialData as any).averagePrice?.toString() || '';
    }
    return '';
  });
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset form when asset type changes
  useEffect(() => {
    if (!isEditMode) {
      // Clear fields when switching types
      setAccountNumber('');
      setPrincipalAmount('');
      setInterestRate('');
      setStartDate('');
      setMaturityDate('');
      setCurrentBalance('');
      setSymbol('');
      setCompanyName('');
      setExchange('NSE');
      setQuantity('');
      setAveragePrice('');
      setStockSearchQuery('');
      setErrors({});
    }
  }, [assetType, isEditMode]);

  // Handle stock selection from autocomplete
  const handleStockSelect = (stock: { symbol: string; companyName: string; exchange: 'NSE' | 'BSE' }) => {
    setSymbol(stock.symbol);
    setCompanyName(stock.companyName);
    setExchange(stock.exchange);
    setStockSearchQuery('');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build asset object based on type
    let asset: AssetInput;
    
    if (assetType === 'fixed-deposit') {
      const trimmedAccountNumber = accountNumber.trim();
      const fdAsset: FixedDepositInput = {
        type: 'fixed-deposit',
        bankName: bankName.trim(),
        accountNumber: trimmedAccountNumber || undefined,
        principalAmount: parseFloat(principalAmount),
        interestRate: parseFloat(interestRate),
        startDate: new Date(startDate),
        maturityDate: new Date(maturityDate),
      };
      asset = fdAsset;
      
      // Validate
      const validation = validateFixedDeposit(fdAsset);
      if (!validation.isValid) {
        const errorMap: Record<string, string> = {};
        validation.errors.forEach((err: ValidationError) => {
          errorMap[err.field] = err.message;
        });
        setErrors(errorMap);
        return;
      }
    } else if (assetType === 'savings-account') {
      const trimmedAccountNumber = accountNumber.trim();
      const saAsset: SavingsAccountInput = {
        type: 'savings-account',
        bankName: bankName.trim(),
        accountNumber: trimmedAccountNumber,
        currentBalance: parseFloat(currentBalance),
        interestRate: interestRate.trim() ? parseFloat(interestRate) : undefined,
      };
      asset = saAsset;
      
      // Validate
      const validation = validateSavingsAccount(saAsset);
      if (!validation.isValid) {
        const errorMap: Record<string, string> = {};
        validation.errors.forEach((err: ValidationError) => {
          errorMap[err.field] = err.message;
        });
        setErrors(errorMap);
        return;
      }
    } else {
      // Equity
      const equityAsset: any = {
        type: 'equity',
        bankName: bankName.trim(), // Broker name
        symbol: symbol.trim(),
        companyName: companyName.trim(),
        exchange,
        quantity: parseFloat(quantity),
        averagePrice: parseFloat(averagePrice),
      };
      asset = equityAsset;
      
      // Basic validation
      const errorMap: Record<string, string> = {};
      if (!bankName.trim()) errorMap.bankName = 'Broker name is required';
      if (!symbol.trim()) errorMap.symbol = 'Symbol is required';
      if (!companyName.trim()) errorMap.companyName = 'Company name is required';
      if (!quantity || parseFloat(quantity) <= 0) errorMap.quantity = 'Quantity must be greater than 0';
      if (!averagePrice || parseFloat(averagePrice) <= 0) errorMap.averagePrice = 'Average price must be greater than 0';
      
      if (Object.keys(errorMap).length > 0) {
        setErrors(errorMap);
        return;
      }
    }
    
    // Clear errors and submit
    setErrors({});
    setIsSubmitting(true);
    
    try {
      await onSubmit(asset);
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ submit: 'Failed to save asset. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form className="asset-form" onSubmit={handleSubmit}>
      <h2 className="form-title">
        {isEditMode ? 'Edit Asset' : 'Add New Asset'}
      </h2>
      
      {/* Asset Type Selection */}
      {!isEditMode && (
        <div className="form-group">
          <label htmlFor="assetType" className="form-label">
            Asset Type <span className="required">*</span>
          </label>
          <select
            id="assetType"
            className="form-input"
            value={assetType}
            onChange={(e) => setAssetType(e.target.value as 'fixed-deposit' | 'savings-account' | 'equity')}
          >
            <option value="fixed-deposit">Fixed Deposit</option>
            <option value="savings-account">Savings Account</option>
            <option value="equity">Equity</option>
          </select>
        </div>
      )}
      
      {/* Bank Name / Broker Name */}
      <div className="form-group">
        <label htmlFor="bankName" className="form-label">
          {assetType === 'equity' ? 'Broker Name' : 'Bank Name'} <span className="required">*</span>
        </label>
        <input
          id="bankName"
          type="text"
          className={`form-input ${errors.bankName ? 'form-input-error' : ''}`}
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          placeholder={assetType === 'equity' ? 'e.g., Zerodha, Upstox' : 'e.g., HDFC Bank'}
        />
        {errors.bankName && <span className="error-message">{errors.bankName}</span>}
      </div>
      
      {/* Conditional Fields for Fixed Deposit */}
      {assetType === 'fixed-deposit' && (
        <>
          <div className="form-group">
            <label htmlFor="accountNumber" className="form-label">
              Account Number
            </label>
            <input
              id="accountNumber"
              type="text"
              className="form-input"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Optional"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="principalAmount" className="form-label">
                Principal Amount <span className="required">*</span>
              </label>
              <input
                id="principalAmount"
                type="number"
                step="0.01"
                className={`form-input ${errors.principalAmount ? 'form-input-error' : ''}`}
                value={principalAmount}
                onChange={(e) => setPrincipalAmount(e.target.value)}
                placeholder="e.g., 100000"
              />
              {errors.principalAmount && (
                <span className="error-message">{errors.principalAmount}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="interestRate" className="form-label">
                Interest Rate (%) <span className="required">*</span>
              </label>
              <input
                id="interestRate"
                type="number"
                step="0.01"
                className={`form-input ${errors.interestRate ? 'form-input-error' : ''}`}
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="e.g., 6.5"
              />
              {errors.interestRate && (
                <span className="error-message">{errors.interestRate}</span>
              )}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate" className="form-label">
                Start Date <span className="required">*</span>
              </label>
              <input
                id="startDate"
                type="date"
                className={`form-input ${errors.startDate ? 'form-input-error' : ''}`}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              {errors.startDate && (
                <span className="error-message">{errors.startDate}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="maturityDate" className="form-label">
                Maturity Date <span className="required">*</span>
              </label>
              <input
                id="maturityDate"
                type="date"
                className={`form-input ${errors.maturityDate ? 'form-input-error' : ''}`}
                value={maturityDate}
                onChange={(e) => setMaturityDate(e.target.value)}
              />
              {errors.maturityDate && (
                <span className="error-message">{errors.maturityDate}</span>
              )}
            </div>
          </div>
        </>
      )}
      
      {/* Conditional Fields for Savings Account */}
      {assetType === 'savings-account' && (
        <>
          <div className="form-group">
            <label htmlFor="accountNumber" className="form-label">
              Account Number <span className="required">*</span>
            </label>
            <input
              id="accountNumber"
              type="text"
              className={`form-input ${errors.accountNumber ? 'form-input-error' : ''}`}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="e.g., 1234567890"
            />
            {errors.accountNumber && (
              <span className="error-message">{errors.accountNumber}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="currentBalance" className="form-label">
              Current Balance <span className="required">*</span>
            </label>
            <input
              id="currentBalance"
              type="number"
              step="0.01"
              className={`form-input ${errors.currentBalance ? 'form-input-error' : ''}`}
              value={currentBalance}
              onChange={(e) => setCurrentBalance(e.target.value)}
              placeholder="e.g., 50000"
            />
            {errors.currentBalance && (
              <span className="error-message">{errors.currentBalance}</span>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="interestRate" className="form-label">
              Interest Rate (%)
            </label>
            <input
              id="interestRate"
              type="number"
              step="0.01"
              className={`form-input ${errors.interestRate ? 'form-input-error' : ''}`}
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="Optional, e.g., 3.5"
            />
            {errors.interestRate && (
              <span className="error-message">{errors.interestRate}</span>
            )}
          </div>
        </>
      )}
      
      {/* Conditional Fields for Equity */}
      {assetType === 'equity' && (
        <>
          <div className="form-group">
            <label htmlFor="stockSearch" className="form-label">
              Search Stock <span className="required">*</span>
            </label>
            <StockSearch
              value={stockSearchQuery}
              onChange={setStockSearchQuery}
              onSelect={handleStockSelect}
              placeholder="Search for stocks (e.g., Reliance, TCS, HDFC)"
              disabled={isEditMode}
            />
            <span className="form-hint">
              Start typing to search for Indian stocks on NSE/BSE
            </span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="symbol" className="form-label">
                Stock Symbol <span className="required">*</span>
              </label>
              <input
                id="symbol"
                type="text"
                className={`form-input ${errors.symbol ? 'form-input-error' : ''}`}
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="e.g., RELIANCE.NS"
                readOnly={!isEditMode && symbol !== ''}
              />
              {errors.symbol && <span className="error-message">{errors.symbol}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="exchange" className="form-label">
                Exchange <span className="required">*</span>
              </label>
              <select
                id="exchange"
                className="form-input"
                value={exchange}
                onChange={(e) => setExchange(e.target.value as 'NSE' | 'BSE')}
                disabled={!isEditMode && symbol !== ''}
              >
                <option value="NSE">NSE</option>
                <option value="BSE">BSE</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="companyName" className="form-label">
              Company Name <span className="required">*</span>
            </label>
            <input
              id="companyName"
              type="text"
              className={`form-input ${errors.companyName ? 'form-input-error' : ''}`}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., Reliance Industries"
              readOnly={!isEditMode && companyName !== ''}
            />
            {errors.companyName && <span className="error-message">{errors.companyName}</span>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quantity" className="form-label">
                Quantity <span className="required">*</span>
              </label>
              <input
                id="quantity"
                type="number"
                step="1"
                className={`form-input ${errors.quantity ? 'form-input-error' : ''}`}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g., 10"
              />
              {errors.quantity && <span className="error-message">{errors.quantity}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="averagePrice" className="form-label">
                Average Price (₹) <span className="required">*</span>
              </label>
              <input
                id="averagePrice"
                type="number"
                step="0.01"
                className={`form-input ${errors.averagePrice ? 'form-input-error' : ''}`}
                value={averagePrice}
                onChange={(e) => setAveragePrice(e.target.value)}
                placeholder="e.g., 2500.50"
              />
              {errors.averagePrice && <span className="error-message">{errors.averagePrice}</span>}
            </div>
          </div>
        </>
      )}
      
      {/* Submit Error */}
      {errors.submit && (
        <div className="error-message error-message-submit">{errors.submit}</div>
      )}
      
      {/* Form Actions */}
      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : isEditMode ? 'Update Asset' : 'Add Asset'}
        </button>
      </div>
    </form>
  );
};

// Helper function to format Date for input[type="date"]
function formatDateForInput(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default AssetForm;
