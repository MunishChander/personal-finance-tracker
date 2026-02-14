/**
 * Unit tests for validation functions
 */

import { describe, it, expect } from 'vitest';
import {
  validatePositiveAmount,
  validateInterestRate,
  validateDateFormat,
  validateDateRelationship,
  validateRequiredFields,
  validateFixedDeposit,
  validateSavingsAccount,
} from './validation';

describe('validatePositiveAmount', () => {
  it('should accept positive numbers', () => {
    expect(validatePositiveAmount(100, 'amount')).toBeNull();
    expect(validatePositiveAmount(0.01, 'amount')).toBeNull();
    expect(validatePositiveAmount(1000000, 'amount')).toBeNull();
  });

  it('should reject zero', () => {
    const error = validatePositiveAmount(0, 'amount');
    expect(error).not.toBeNull();
    expect(error?.field).toBe('amount');
    expect(error?.message).toContain('greater than 0');
  });

  it('should reject negative numbers', () => {
    const error = validatePositiveAmount(-100, 'amount');
    expect(error).not.toBeNull();
    expect(error?.field).toBe('amount');
    expect(error?.message).toContain('greater than 0');
  });

  it('should reject NaN', () => {
    const error = validatePositiveAmount(NaN, 'amount');
    expect(error).not.toBeNull();
    expect(error?.field).toBe('amount');
    expect(error?.message).toContain('valid number');
  });

  it('should reject non-numeric values', () => {
    const error = validatePositiveAmount('100' as any, 'amount');
    expect(error).not.toBeNull();
    expect(error?.field).toBe('amount');
  });
});

describe('validateInterestRate', () => {
  it('should accept rates between 0 and 100', () => {
    expect(validateInterestRate(0, 'rate')).toBeNull();
    expect(validateInterestRate(5.5, 'rate')).toBeNull();
    expect(validateInterestRate(100, 'rate')).toBeNull();
  });

  it('should reject negative rates', () => {
    const error = validateInterestRate(-1, 'rate');
    expect(error).not.toBeNull();
    expect(error?.field).toBe('rate');
    expect(error?.message).toContain('between 0 and 100');
  });

  it('should reject rates above 100', () => {
    const error = validateInterestRate(101, 'rate');
    expect(error).not.toBeNull();
    expect(error?.field).toBe('rate');
    expect(error?.message).toContain('between 0 and 100');
  });

  it('should reject NaN', () => {
    const error = validateInterestRate(NaN, 'rate');
    expect(error).not.toBeNull();
    expect(error?.message).toContain('valid number');
  });
});

describe('validateDateFormat', () => {
  it('should accept valid Date objects', () => {
    expect(validateDateFormat(new Date(), 'date')).toBeNull();
    expect(validateDateFormat(new Date('2024-01-01'), 'date')).toBeNull();
  });

  it('should accept valid date strings', () => {
    expect(validateDateFormat('2024-01-01', 'date')).toBeNull();
    expect(validateDateFormat('2024-12-31', 'date')).toBeNull();
  });

  it('should reject invalid date strings', () => {
    const error = validateDateFormat('invalid-date', 'date');
    expect(error).not.toBeNull();
    expect(error?.field).toBe('date');
    expect(error?.message).toContain('valid date');
  });

  it('should reject invalid Date objects', () => {
    const error = validateDateFormat(new Date('invalid'), 'date');
    expect(error).not.toBeNull();
    expect(error?.message).toContain('valid date');
  });
});

describe('validateDateRelationship', () => {
  it('should accept maturity date after start date', () => {
    const start = new Date('2024-01-01');
    const maturity = new Date('2024-12-31');
    expect(validateDateRelationship(start, maturity)).toBeNull();
  });

  it('should accept date strings with maturity after start', () => {
    expect(validateDateRelationship('2024-01-01', '2024-12-31')).toBeNull();
  });

  it('should reject maturity date before start date', () => {
    const start = new Date('2024-12-31');
    const maturity = new Date('2024-01-01');
    const error = validateDateRelationship(start, maturity);
    expect(error).not.toBeNull();
    expect(error?.field).toBe('maturityDate');
    expect(error?.message).toContain('after start date');
  });

  it('should reject maturity date equal to start date', () => {
    const date = new Date('2024-01-01');
    const error = validateDateRelationship(date, date);
    expect(error).not.toBeNull();
    expect(error?.message).toContain('after start date');
  });

  it('should reject invalid dates', () => {
    const error = validateDateRelationship('invalid', '2024-12-31');
    expect(error).not.toBeNull();
    expect(error?.message).toContain('Invalid date');
  });
});

describe('validateRequiredFields', () => {
  it('should accept non-empty strings', () => {
    expect(validateRequiredFields('Bank Name', 'bankName')).toBeNull();
    expect(validateRequiredFields('A', 'bankName')).toBeNull();
  });

  it('should reject undefined', () => {
    const error = validateRequiredFields(undefined, 'bankName');
    expect(error).not.toBeNull();
    expect(error?.field).toBe('bankName');
    expect(error?.message).toContain('required');
  });

  it('should reject empty strings', () => {
    const error = validateRequiredFields('', 'bankName');
    expect(error).not.toBeNull();
    expect(error?.message).toContain('empty or whitespace');
  });

  it('should reject whitespace-only strings', () => {
    const error = validateRequiredFields('   ', 'bankName');
    expect(error).not.toBeNull();
    expect(error?.message).toContain('empty or whitespace');
  });

  it('should reject non-string values', () => {
    const error = validateRequiredFields(123 as any, 'bankName');
    expect(error).not.toBeNull();
    expect(error?.message).toContain('must be a string');
  });
});

describe('validateFixedDeposit', () => {
  const validFixedDeposit = {
    type: 'fixed-deposit' as const,
    bankName: 'HDFC Bank',
    principalAmount: 100000,
    interestRate: 7.5,
    startDate: new Date('2024-01-01'),
    maturityDate: new Date('2025-01-01'),
  };

  it('should accept valid fixed deposit', () => {
    const result = validateFixedDeposit(validFixedDeposit);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject missing bank name', () => {
    const invalid = { ...validFixedDeposit, bankName: '' };
    const result = validateFixedDeposit(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'bankName')).toBe(true);
  });

  it('should reject missing principal amount', () => {
    const invalid = { ...validFixedDeposit };
    delete (invalid as any).principalAmount;
    const result = validateFixedDeposit(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'principalAmount')).toBe(true);
  });

  it('should reject negative principal amount', () => {
    const invalid = { ...validFixedDeposit, principalAmount: -1000 };
    const result = validateFixedDeposit(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'principalAmount')).toBe(true);
  });

  it('should reject missing interest rate', () => {
    const invalid = { ...validFixedDeposit };
    delete (invalid as any).interestRate;
    const result = validateFixedDeposit(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'interestRate')).toBe(true);
  });

  it('should reject invalid interest rate', () => {
    const invalid = { ...validFixedDeposit, interestRate: 150 };
    const result = validateFixedDeposit(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'interestRate')).toBe(true);
  });

  it('should reject missing start date', () => {
    const invalid = { ...validFixedDeposit };
    delete (invalid as any).startDate;
    const result = validateFixedDeposit(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'startDate')).toBe(true);
  });

  it('should reject missing maturity date', () => {
    const invalid = { ...validFixedDeposit };
    delete (invalid as any).maturityDate;
    const result = validateFixedDeposit(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'maturityDate')).toBe(true);
  });

  it('should reject maturity date before start date', () => {
    const invalid = {
      ...validFixedDeposit,
      startDate: new Date('2025-01-01'),
      maturityDate: new Date('2024-01-01'),
    };
    const result = validateFixedDeposit(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'maturityDate')).toBe(true);
  });

  it('should accept optional account number', () => {
    const withAccount = { ...validFixedDeposit, accountNumber: 'FD123456' };
    const result = validateFixedDeposit(withAccount);
    expect(result.isValid).toBe(true);
  });
});

describe('validateSavingsAccount', () => {
  const validSavingsAccount = {
    type: 'savings-account' as const,
    bankName: 'ICICI Bank',
    accountNumber: 'SA123456789',
    currentBalance: 50000,
  };

  it('should accept valid savings account', () => {
    const result = validateSavingsAccount(validSavingsAccount);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject missing bank name', () => {
    const invalid = { ...validSavingsAccount, bankName: '' };
    const result = validateSavingsAccount(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'bankName')).toBe(true);
  });

  it('should reject missing account number', () => {
    const invalid = { ...validSavingsAccount };
    delete (invalid as any).accountNumber;
    const result = validateSavingsAccount(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'accountNumber')).toBe(true);
  });

  it('should reject empty account number', () => {
    const invalid = { ...validSavingsAccount, accountNumber: '   ' };
    const result = validateSavingsAccount(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'accountNumber')).toBe(true);
  });

  it('should reject missing current balance', () => {
    const invalid = { ...validSavingsAccount };
    delete (invalid as any).currentBalance;
    const result = validateSavingsAccount(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'currentBalance')).toBe(true);
  });

  it('should reject negative balance', () => {
    const invalid = { ...validSavingsAccount, currentBalance: -1000 };
    const result = validateSavingsAccount(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'currentBalance')).toBe(true);
  });

  it('should accept optional interest rate', () => {
    const withInterest = { ...validSavingsAccount, interestRate: 3.5 };
    const result = validateSavingsAccount(withInterest);
    expect(result.isValid).toBe(true);
  });

  it('should reject invalid optional interest rate', () => {
    const invalid = { ...validSavingsAccount, interestRate: 150 };
    const result = validateSavingsAccount(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.field === 'interestRate')).toBe(true);
  });

  it('should accept undefined interest rate', () => {
    const withoutInterest = { ...validSavingsAccount, interestRate: undefined };
    const result = validateSavingsAccount(withoutInterest);
    expect(result.isValid).toBe(true);
  });
});
