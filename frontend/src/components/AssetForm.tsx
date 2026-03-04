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
import MutualFundSearch from './MutualFundSearch';
import { parseAmount } from '../utils/amountParser';
import './AssetForm.css';

type FixedDepositInput = Omit<FixedDeposit, 'id' | 'createdAt' | 'updatedAt' | 'maturityAmount' | 'daysToMaturity' | 'isMatured'>;
type SavingsAccountInput = Omit<SavingsAccount, 'id' | 'createdAt' | 'updatedAt'>;

interface AssetFormProps {
  assetType?: 'fixed-deposit' | 'savings-account' | 'equity' | 'mutual-fund' | 'provident-fund';
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
  const [assetType, setAssetType] = useState<'fixed-deposit' | 'savings-account' | 'equity' | 'mutual-fund' | 'provident-fund'>(
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
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  
  // Mutual Fund fields
  const [schemeCode, setSchemeCode] = useState(() => {
    if (initialData?.type === 'mutual-fund') {
      return (initialData as any).schemeCode || '';
    }
    return '';
  });
  const [schemeName, setSchemeName] = useState(() => {
    if (initialData?.type === 'mutual-fund') {
      return (initialData as any).schemeName || '';
    }
    return '';
  });
  const [fundHouse, setFundHouse] = useState(() => {
    if (initialData?.type === 'mutual-fund') {
      return (initialData as any).fundHouse || '';
    }
    return '';
  });
  const [units, setUnits] = useState(() => {
    if (initialData?.type === 'mutual-fund') {
      return (initialData as any).units?.toString() || '';
    }
    return '';
  });
  const [averageNav, setAverageNav] = useState(() => {
    if (initialData?.type === 'mutual-fund') {
      return (initialData as any).averageNav?.toString() || '';
    }
    return '';
  });
  const [currentNav, setCurrentNav] = useState<number | null>(null);
  const [isFetchingNav, setIsFetchingNav] = useState(false);
  
  // Provident Fund fields
  const [uan, setUan] = useState(() => {
    if (initialData?.type === 'provident-fund') {
      return (initialData as any).uan || '';
    }
    return '';
  });
  const [pfCurrentBalance, setPfCurrentBalance] = useState(() => {
    if (initialData?.type === 'provident-fund') {
      return (initialData as any).currentBalance?.toString() || '';
    }
    return '';
  });
  const [monthlyContributionEmployee, setMonthlyContributionEmployee] = useState(() => {
    if (initialData?.type === 'provident-fund') {
      return (initialData as any).monthlyContributionEmployee?.toString() || '';
    }
    return '';
  });
  const [monthlyContributionEmployer, setMonthlyContributionEmployer] = useState(() => {
    if (initialData?.type === 'provident-fund') {
      return (initialData as any).monthlyContributionEmployer?.toString() || '';
    }
    return '';
  });
  const [pfInterestRate, setPfInterestRate] = useState(() => {
    if (initialData?.type === 'provident-fund') {
      return (initialData as any).interestRate?.toString() || '8.25';
    }
    return '8.25';
  });
  const [lastUpdatedDate, setLastUpdatedDate] = useState(() => {
    if (initialData?.type === 'provident-fund') {
      return formatDateForInput((initialData as any).lastUpdatedDate);
    }
    return new Date().toISOString().split('T')[0];
  });
  
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
      setCurrentPrice(null);
      setStockSearchQuery('');
      setSchemeCode('');
      setSchemeName('');
      setFundHouse('');
      setUnits('');
      setAverageNav('');
      setCurrentNav(null);
      setUan('');
      setPfCurrentBalance('');
      setMonthlyContributionEmployee('');
      setMonthlyContributionEmployer('');
      setPfInterestRate('8.25');
      setLastUpdatedDate(new Date().toISOString().split('T')[0]);
      setErrors({});
    }
  }, [assetType, isEditMode]);

  // Handle stock selection from autocomplete
  const handleStockSelect = async (stock: { symbol: string; companyName: string; exchange: 'NSE' | 'BSE' }) => {
    setSymbol(stock.symbol);
    setCompanyName(stock.companyName);
    setExchange(stock.exchange);
    setStockSearchQuery('');
    
    // Fetch current price
    setIsFetchingPrice(true);
    try {
      const response = await fetch(`http://localhost:3000/api/assets/equities/${encodeURIComponent(stock.symbol)}/price`);
      const data = await response.json();
      
      if (data.success && data.data && data.data.price) {
        setCurrentPrice(data.data.price);
      } else {
        setCurrentPrice(null);
      }
    } catch (error) {
      console.error('Error fetching price:', error);
      setCurrentPrice(null);
    } finally {
      setIsFetchingPrice(false);
    }
  };

  // Handle mutual fund selection from autocomplete
  const handleMFSelect = async (code: string, name: string) => {
    setSchemeCode(code);
    setSchemeName(name);
    // Extract fund house from scheme name (usually first part before "-")
    const parts = name.split('-');
    if (parts.length > 0) {
      setFundHouse(parts[0].trim());
    }
    
    // Fetch current NAV
    setIsFetchingNav(true);
    try {
      const response = await fetch(`http://localhost:3000/api/assets/mutualfunds/${code}/nav`);
      const data = await response.json();
      
      if (data.success && data.data && data.data.nav) {
        setCurrentNav(data.data.nav);
      } else {
        setCurrentNav(null);
      }
    } catch (error) {
      console.error('Error fetching NAV:', error);
      setCurrentNav(null);
    } finally {
      setIsFetchingNav(false);
    }
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
        principalAmount: parseAmount(principalAmount),
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
        currentBalance: parseAmount(currentBalance),
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
    } else if (assetType === 'equity') {
      // Equity
      const equityAsset: any = {
        type: 'equity',
        bankName: bankName.trim(), // Broker name
        symbol: symbol.trim(),
        companyName: companyName.trim(),
        exchange,
        quantity: parseFloat(quantity),
        averagePrice: parseAmount(averagePrice),
      };
      asset = equityAsset;
      
      // Basic validation
      const errorMap: Record<string, string> = {};
      if (!bankName.trim()) errorMap.bankName = 'Broker name is required';
      if (!symbol.trim()) errorMap.symbol = 'Symbol is required';
      if (!companyName.trim()) errorMap.companyName = 'Company name is required';
      if (!quantity || parseFloat(quantity) <= 0) errorMap.quantity = 'Quantity must be greater than 0';
      if (!averagePrice || parseAmount(averagePrice) <= 0) errorMap.averagePrice = 'Average price must be greater than 0';
      
      if (Object.keys(errorMap).length > 0) {
        setErrors(errorMap);
        return;
      }
    } else if (assetType === 'mutual-fund') {
      // Mutual Fund - bankName is optional (platform name)
      const mfAsset: any = {
        type: 'mutual-fund',
        bankName: bankName.trim() || 'Direct', // Default to 'Direct' if not provided
        schemeCode: schemeCode.trim(),
        schemeName: schemeName.trim(),
        fundHouse: fundHouse.trim(),
        units: parseFloat(units),
        averageNav: parseAmount(averageNav),
      };
      asset = mfAsset;
      
      // Basic validation
      const errorMap: Record<string, string> = {};
      if (!schemeCode.trim()) errorMap.schemeCode = 'Scheme code is required';
      if (!schemeName.trim()) errorMap.schemeName = 'Scheme name is required';
      if (!fundHouse.trim()) errorMap.fundHouse = 'Fund house is required';
      if (!units || parseFloat(units) <= 0) errorMap.units = 'Units must be greater than 0';
      if (!averageNav || parseAmount(averageNav) <= 0) errorMap.averageNav = 'Average NAV must be greater than 0';
      
      if (Object.keys(errorMap).length > 0) {
        setErrors(errorMap);
        return;
      }
    } else {
      // Provident Fund
      const pfAsset: any = {
        type: 'provident-fund',
        bankName: bankName.trim(), // Employer name
        uan: uan.trim(),
        currentBalance: parseAmount(pfCurrentBalance),
        monthlyContributionEmployee: parseAmount(monthlyContributionEmployee),
        monthlyContributionEmployer: parseAmount(monthlyContributionEmployer),
        interestRate: parseFloat(pfInterestRate),
        lastUpdatedDate: new Date(lastUpdatedDate),
      };
      console.log('PF Asset being submitted:', pfAsset);
      asset = pfAsset;
      
      // Basic validation
      const errorMap: Record<string, string> = {};
      if (!bankName.trim()) errorMap.bankName = 'Employer name is required';
      if (!uan.trim()) errorMap.uan = 'UAN is required';
      if (uan.trim().length !== 12) errorMap.uan = 'UAN must be 12 digits';
      if (!pfCurrentBalance || parseAmount(pfCurrentBalance) < 0) errorMap.pfCurrentBalance = 'Current balance must be 0 or greater';
      if (!monthlyContributionEmployee || parseAmount(monthlyContributionEmployee) < 0) errorMap.monthlyContributionEmployee = 'Employee contribution must be 0 or greater';
      if (!monthlyContributionEmployer || parseAmount(monthlyContributionEmployer) < 0) errorMap.monthlyContributionEmployer = 'Employer contribution must be 0 or greater';
      if (!pfInterestRate || parseFloat(pfInterestRate) <= 0) errorMap.pfInterestRate = 'Interest rate must be greater than 0';
      if (!lastUpdatedDate) errorMap.lastUpdatedDate = 'Last updated date is required';
      
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
            onChange={(e) => setAssetType(e.target.value as 'fixed-deposit' | 'savings-account' | 'equity' | 'mutual-fund' | 'provident-fund')}
          >
            <option value="fixed-deposit">Fixed Deposit</option>
            <option value="savings-account">Savings Account</option>
            <option value="equity">Equity</option>
            <option value="mutual-fund">Mutual Fund</option>
            <option value="provident-fund">Provident Fund (EPF/PF)</option>
          </select>
        </div>
      )}
      
      {/* Bank Name / Broker Name / Employer Name - Not for Mutual Fund */}
      {assetType !== 'mutual-fund' && (
        <div className="form-group">
          <label htmlFor="bankName" className="form-label">
            {assetType === 'equity' ? 'Broker Name' : assetType === 'provident-fund' ? 'Employer Name' : 'Bank Name'} <span className="required">*</span>
          </label>
          <input
            id="bankName"
            type="text"
            className={`form-input ${errors.bankName ? 'form-input-error' : ''}`}
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder={assetType === 'equity' ? 'e.g., Zerodha, Upstox' : assetType === 'provident-fund' ? 'e.g., Acme Corp' : 'e.g., HDFC Bank'}
          />
          {errors.bankName && <span className="error-message">{errors.bankName}</span>}
        </div>
      )}
      
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
                type="text"
                className={`form-input ${errors.principalAmount ? 'form-input-error' : ''}`}
                value={principalAmount}
                onChange={(e) => setPrincipalAmount(e.target.value)}
                onBlur={(e) => {
                  const parsed = parseAmount(e.target.value);
                  if (parsed > 0) {
                    setPrincipalAmount(parsed.toLocaleString('en-IN'));
                  }
                }}
                placeholder="e.g., 100000 or 1L or 100k"
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
              type="text"
              className={`form-input ${errors.currentBalance ? 'form-input-error' : ''}`}
              value={currentBalance}
              onChange={(e) => setCurrentBalance(e.target.value)}
              onBlur={(e) => {
                const parsed = parseAmount(e.target.value);
                if (parsed > 0) {
                  setCurrentBalance(parsed.toLocaleString('en-IN'));
                }
              }}
              placeholder="e.g., 50000 or 50k or 5L"
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
          
          {/* Current Price Display */}
          {currentPrice !== null && (
            <div className="form-group">
              <div className="current-price-display">
                <span className="current-price-label">Current Price:</span>
                <span className="current-price-value">₹{currentPrice.toFixed(2)}</span>
                {isFetchingPrice && <span className="fetching-indicator">Updating...</span>}
              </div>
            </div>
          )}
          
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
                type="text"
                className={`form-input ${errors.averagePrice ? 'form-input-error' : ''}`}
                value={averagePrice}
                onChange={(e) => setAveragePrice(e.target.value)}
                onBlur={(e) => {
                  const parsed = parseAmount(e.target.value);
                  if (parsed > 0) {
                    setAveragePrice(parsed.toLocaleString('en-IN'));
                  }
                }}
                placeholder="e.g., 2500 or 2.5k"
              />
              {errors.averagePrice && <span className="error-message">{errors.averagePrice}</span>}
            </div>
          </div>
        </>
      )}
      
      {/* Conditional Fields for Mutual Fund */}
      {assetType === 'mutual-fund' && (
        <>
          <div className="form-group">
            <label htmlFor="mfSearch" className="form-label">
              Search Mutual Fund <span className="required">*</span>
            </label>
            <MutualFundSearch
              onSelect={handleMFSelect}
              disabled={isEditMode}
            />
            <span className="form-hint">
              Start typing to search for Indian mutual funds
            </span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="schemeCode" className="form-label">
                Scheme Code <span className="required">*</span>
              </label>
              <input
                id="schemeCode"
                type="text"
                className={`form-input ${errors.schemeCode ? 'form-input-error' : ''}`}
                value={schemeCode}
                onChange={(e) => setSchemeCode(e.target.value)}
                placeholder="e.g., 119551"
                readOnly={!isEditMode && schemeCode !== ''}
              />
              {errors.schemeCode && <span className="error-message">{errors.schemeCode}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="fundHouse" className="form-label">
                Fund House <span className="required">*</span>
              </label>
              <input
                id="fundHouse"
                type="text"
                className={`form-input ${errors.fundHouse ? 'form-input-error' : ''}`}
                value={fundHouse}
                onChange={(e) => setFundHouse(e.target.value)}
                placeholder="e.g., SBI Mutual Fund"
              />
              {errors.fundHouse && <span className="error-message">{errors.fundHouse}</span>}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="schemeName" className="form-label">
              Scheme Name <span className="required">*</span>
            </label>
            <input
              id="schemeName"
              type="text"
              className={`form-input ${errors.schemeName ? 'form-input-error' : ''}`}
              value={schemeName}
              onChange={(e) => setSchemeName(e.target.value)}
              placeholder="e.g., SBI Bluechip Fund Direct Growth"
              readOnly={!isEditMode && schemeName !== ''}
            />
            {errors.schemeName && <span className="error-message">{errors.schemeName}</span>}
          </div>
          
          {/* Current NAV Display */}
          {currentNav !== null && (
            <div className="form-group">
              <div className="current-price-display">
                <span className="current-price-label">Current NAV:</span>
                <span className="current-price-value">₹{currentNav.toFixed(4)}</span>
                {isFetchingNav && <span className="fetching-indicator">Updating...</span>}
              </div>
            </div>
          )}
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="units" className="form-label">
                Units <span className="required">*</span>
              </label>
              <input
                id="units"
                type="number"
                step="0.001"
                className={`form-input ${errors.units ? 'form-input-error' : ''}`}
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                placeholder="e.g., 100.5"
              />
              {errors.units && <span className="error-message">{errors.units}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="averageNav" className="form-label">
                Average NAV (₹) <span className="required">*</span>
              </label>
              <input
                id="averageNav"
                type="text"
                className={`form-input ${errors.averageNav ? 'form-input-error' : ''}`}
                value={averageNav}
                onChange={(e) => setAverageNav(e.target.value)}
                onBlur={(e) => {
                  const parsed = parseAmount(e.target.value);
                  if (parsed > 0) {
                    setAverageNav(parsed.toLocaleString('en-IN'));
                  }
                }}
                placeholder="e.g., 85.50 or 85"
              />
              {errors.averageNav && <span className="error-message">{errors.averageNav}</span>}
            </div>
          </div>
        </>
      )}
      
      {/* Conditional Fields for Provident Fund */}
      {assetType === 'provident-fund' && (
        <>
          <div className="form-group">
            <label htmlFor="uan" className="form-label">
              UAN (Universal Account Number) <span className="required">*</span>
            </label>
            <input
              id="uan"
              type="text"
              maxLength={12}
              className={`form-input ${errors.uan ? 'form-input-error' : ''}`}
              value={uan}
              onChange={(e) => setUan(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g., 123456789012"
            />
            {errors.uan && <span className="error-message">{errors.uan}</span>}
            <span className="form-hint">12-digit UAN number</span>
          </div>
          
          <div className="form-group">
            <label htmlFor="pfCurrentBalance" className="form-label">
              Current Balance (₹) <span className="required">*</span>
            </label>
            <input
              id="pfCurrentBalance"
              type="text"
              className={`form-input ${errors.pfCurrentBalance ? 'form-input-error' : ''}`}
              value={pfCurrentBalance}
              onChange={(e) => setPfCurrentBalance(e.target.value)}
              onBlur={(e) => {
                const parsed = parseAmount(e.target.value);
                if (parsed > 0) {
                  setPfCurrentBalance(parsed.toLocaleString('en-IN'));
                }
              }}
              placeholder="e.g., 500000 or 5L or 500k"
            />
            {errors.pfCurrentBalance && <span className="error-message">{errors.pfCurrentBalance}</span>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="monthlyContributionEmployee" className="form-label">
                Employee Contribution (Monthly) <span className="required">*</span>
              </label>
              <input
                id="monthlyContributionEmployee"
                type="text"
                className={`form-input ${errors.monthlyContributionEmployee ? 'form-input-error' : ''}`}
                value={monthlyContributionEmployee}
                onChange={(e) => setMonthlyContributionEmployee(e.target.value)}
                onBlur={(e) => {
                  const parsed = parseAmount(e.target.value);
                  if (parsed > 0) {
                    setMonthlyContributionEmployee(parsed.toLocaleString('en-IN'));
                  }
                }}
                placeholder="e.g., 1800 or 1.8k"
              />
              {errors.monthlyContributionEmployee && <span className="error-message">{errors.monthlyContributionEmployee}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="monthlyContributionEmployer" className="form-label">
                Employer Contribution (Monthly) <span className="required">*</span>
              </label>
              <input
                id="monthlyContributionEmployer"
                type="text"
                className={`form-input ${errors.monthlyContributionEmployer ? 'form-input-error' : ''}`}
                value={monthlyContributionEmployer}
                onChange={(e) => setMonthlyContributionEmployer(e.target.value)}
                onBlur={(e) => {
                  const parsed = parseAmount(e.target.value);
                  if (parsed > 0) {
                    setMonthlyContributionEmployer(parsed.toLocaleString('en-IN'));
                  }
                }}
                placeholder="e.g., 1800 or 1.8k"
              />
              {errors.monthlyContributionEmployer && <span className="error-message">{errors.monthlyContributionEmployer}</span>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pfInterestRate" className="form-label">
                Interest Rate (% p.a.) <span className="required">*</span>
              </label>
              <input
                id="pfInterestRate"
                type="number"
                step="0.01"
                className={`form-input ${errors.pfInterestRate ? 'form-input-error' : ''}`}
                value={pfInterestRate}
                onChange={(e) => setPfInterestRate(e.target.value)}
                placeholder="8.25"
              />
              {errors.pfInterestRate && <span className="error-message">{errors.pfInterestRate}</span>}
              <span className="form-hint">Current EPF rate: 8.25% (FY 2023-24)</span>
            </div>
            
            <div className="form-group">
              <label htmlFor="lastUpdatedDate" className="form-label">
                Last Updated Date <span className="required">*</span>
              </label>
              <input
                id="lastUpdatedDate"
                type="date"
                className={`form-input ${errors.lastUpdatedDate ? 'form-input-error' : ''}`}
                value={lastUpdatedDate}
                onChange={(e) => setLastUpdatedDate(e.target.value)}
              />
              {errors.lastUpdatedDate && <span className="error-message">{errors.lastUpdatedDate}</span>}
            </div>
          </div>
          
          {/* Projected Balance Display */}
          {pfCurrentBalance && monthlyContributionEmployee && monthlyContributionEmployer && pfInterestRate && (
            <div className="projection-display">
              <h4>Projected Growth (1 Year)</h4>
              <div className="projection-item">
                <span>Annual Contribution:</span>
                <span>₹{((parseFloat(monthlyContributionEmployee) + parseFloat(monthlyContributionEmployer)) * 12).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="projection-item">
                <span>Annual Interest:</span>
                <span>₹{(parseFloat(pfCurrentBalance) * (parseFloat(pfInterestRate) / 100)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="projection-item highlight">
                <span>Projected Balance:</span>
                <span>₹{(parseFloat(pfCurrentBalance) + ((parseFloat(monthlyContributionEmployee) + parseFloat(monthlyContributionEmployer)) * 12) + (parseFloat(pfCurrentBalance) * (parseFloat(pfInterestRate) / 100))).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          )}
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
