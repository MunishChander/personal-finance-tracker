/**
 * Shared TypeScript types for Personal Finance Tracker
 */

// Asset Base Model
export interface AssetBase {
  id: string;
  type: 'fixed-deposit' | 'savings-account' | 'equity';
  bankName: string;
  createdAt: Date;
  updatedAt: Date;
}

// Fixed Deposit Model
export interface FixedDeposit extends AssetBase {
  type: 'fixed-deposit';
  accountNumber?: string;
  principalAmount: number;
  interestRate: number; // Annual percentage
  startDate: Date;
  maturityDate: Date;
  maturityAmount: number; // Calculated
  daysToMaturity: number; // Calculated
  isMatured: boolean; // Calculated
}

// Savings Account Model
export interface SavingsAccount extends AssetBase {
  type: 'savings-account';
  accountNumber: string;
  currentBalance: number;
  interestRate?: number; // Optional annual percentage
}

// Equity Model
export interface Equity extends AssetBase {
  type: 'equity';
  bankName: string; // Broker name (Zerodha, Upstox, etc.)
  symbol: string; // Stock ticker (e.g., RELIANCE.NS)
  companyName: string;
  exchange: 'NSE' | 'BSE';
  quantity: number;
  averagePrice: number; // Purchase price per share
  currentPrice?: number; // Live price (fetched from API)
  totalInvestment: number; // quantity * averagePrice
  currentValue?: number; // quantity * currentPrice
  gainLoss?: number; // currentValue - totalInvestment
  gainLossPercentage?: number; // (gainLoss / totalInvestment) * 100
  dayChange?: number; // Today's price change
  dayChangePercentage?: number; // Today's percentage change
}

// Union Type
export type Asset = FixedDeposit | SavingsAccount | Equity;

// Asset Type
export type AssetType = 'fixed-deposit' | 'savings-account' | 'equity';

// Filter Model
export interface AssetFilters {
  assetType: AssetType | null;
  bankName: string | null;
}

// Validation Models
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// API Models
export type AssetInput = Omit<
  Asset,
  'id' | 'createdAt' | 'updatedAt' | 'maturityAmount' | 'daysToMaturity' | 'isMatured'
>;

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Dashboard Statistics
export interface DashboardStats {
  totalPortfolioValue: number; // Total of all current values
  totalFixedDepositsCurrent: number; // Sum of all FD principals
  totalFixedDepositsMaturity: number; // Sum of all FD maturity amounts
  totalSavingsAccounts: number; // Sum of all savings balances
  fixedDepositCount: number;
  savingsAccountCount: number;
  maturingSoon: number; // FDs maturing in next 30 days
}
