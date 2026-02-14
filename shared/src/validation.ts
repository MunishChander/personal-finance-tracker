/**
 * Validation functions for Personal Finance Tracker
 * Validates asset data according to requirements 6.1-6.5
 */

import {
  ValidationResult,
  ValidationError,
  FixedDeposit,
  SavingsAccount,
  AssetInput,
} from './types';

/**
 * Validates that a number is positive (greater than 0)
 * Requirement 6.1: Principal amounts and balances must be positive
 */
export function validatePositiveAmount(
  value: number,
  fieldName: string
): ValidationError | null {
  if (typeof value !== 'number' || isNaN(value)) {
    return {
      field: fieldName,
      message: `${fieldName} must be a valid number`,
    };
  }
  if (value <= 0) {
    return {
      field: fieldName,
      message: `${fieldName} must be greater than 0`,
    };
  }
  return null;
}

/**
 * Validates that an interest rate is between 0 and 100 (inclusive)
 * Requirement 6.2: Interest rates must be non-negative and <= 100
 */
export function validateInterestRate(
  value: number,
  fieldName: string
): ValidationError | null {
  if (typeof value !== 'number' || isNaN(value)) {
    return {
      field: fieldName,
      message: `${fieldName} must be a valid number`,
    };
  }
  if (value < 0 || value > 100) {
    return {
      field: fieldName,
      message: `${fieldName} must be between 0 and 100`,
    };
  }
  return null;
}

/**
 * Validates that a value is a valid date
 * Requirement 6.3: Dates must be valid date formats
 */
export function validateDateFormat(
  value: Date | string,
  fieldName: string
): ValidationError | null {
  const date = value instanceof Date ? value : new Date(value);
  
  if (isNaN(date.getTime())) {
    return {
      field: fieldName,
      message: `${fieldName} must be a valid date`,
    };
  }
  return null;
}

/**
 * Validates that maturity date is after start date
 * Requirement 6.4: Maturity date must be after start date for fixed deposits
 */
export function validateDateRelationship(
  startDate: Date | string,
  maturityDate: Date | string
): ValidationError | null {
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const maturity = maturityDate instanceof Date ? maturityDate : new Date(maturityDate);
  
  if (isNaN(start.getTime()) || isNaN(maturity.getTime())) {
    return {
      field: 'maturityDate',
      message: 'Invalid date format',
    };
  }
  
  if (maturity <= start) {
    return {
      field: 'maturityDate',
      message: 'Maturity date must be after start date',
    };
  }
  return null;
}

/**
 * Validates that required string fields are not empty or whitespace-only
 * Requirement 6.5: Required fields must not be empty or whitespace-only
 */
export function validateRequiredFields(
  value: string | undefined,
  fieldName: string
): ValidationError | null {
  if (value === undefined || value === null) {
    return {
      field: fieldName,
      message: `${fieldName} is required`,
    };
  }
  
  if (typeof value !== 'string') {
    return {
      field: fieldName,
      message: `${fieldName} must be a string`,
    };
  }
  
  if (value.trim() === '') {
    return {
      field: fieldName,
      message: `${fieldName} cannot be empty or whitespace`,
    };
  }
  return null;
}

/**
 * Validates a Fixed Deposit asset
 * Requirements 1.4, 1.5: Validates all required fields and business rules
 */
export function validateFixedDeposit(
  asset: Partial<FixedDeposit> | AssetInput
): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Validate required string fields
  const bankNameError = validateRequiredFields(asset.bankName, 'bankName');
  if (bankNameError) errors.push(bankNameError);
  
  // Validate principal amount
  if (asset.type === 'fixed-deposit' && 'principalAmount' in asset) {
    const principalError = validatePositiveAmount(
      asset.principalAmount as number,
      'principalAmount'
    );
    if (principalError) errors.push(principalError);
  } else {
    errors.push({
      field: 'principalAmount',
      message: 'principalAmount is required for fixed deposits',
    });
  }
  
  // Validate interest rate
  if (asset.type === 'fixed-deposit' && 'interestRate' in asset) {
    const interestError = validateInterestRate(
      asset.interestRate as number,
      'interestRate'
    );
    if (interestError) errors.push(interestError);
  } else {
    errors.push({
      field: 'interestRate',
      message: 'interestRate is required for fixed deposits',
    });
  }
  
  // Validate start date
  if (asset.type === 'fixed-deposit' && 'startDate' in asset) {
    const startDateError = validateDateFormat(
      asset.startDate as Date,
      'startDate'
    );
    if (startDateError) errors.push(startDateError);
  } else {
    errors.push({
      field: 'startDate',
      message: 'startDate is required for fixed deposits',
    });
  }
  
  // Validate maturity date
  if (asset.type === 'fixed-deposit' && 'maturityDate' in asset) {
    const maturityDateError = validateDateFormat(
      asset.maturityDate as Date,
      'maturityDate'
    );
    if (maturityDateError) errors.push(maturityDateError);
  } else {
    errors.push({
      field: 'maturityDate',
      message: 'maturityDate is required for fixed deposits',
    });
  }
  
  // Validate date relationship (only if both dates are valid)
  if (
    asset.type === 'fixed-deposit' &&
    'startDate' in asset &&
    'maturityDate' in asset &&
    !errors.some(e => e.field === 'startDate' || e.field === 'maturityDate')
  ) {
    const dateRelationError = validateDateRelationship(
      asset.startDate as Date,
      asset.maturityDate as Date
    );
    if (dateRelationError) errors.push(dateRelationError);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates a Savings Account asset
 * Requirements 2.4, 2.5, 2.6: Validates all required fields and optional fields
 */
export function validateSavingsAccount(
  asset: Partial<SavingsAccount> | AssetInput
): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Validate required string fields
  const bankNameError = validateRequiredFields(asset.bankName, 'bankName');
  if (bankNameError) errors.push(bankNameError);
  
  // Validate account number (required for savings accounts)
  if (asset.type === 'savings-account' && 'accountNumber' in asset) {
    const accountNumberError = validateRequiredFields(
      asset.accountNumber as string,
      'accountNumber'
    );
    if (accountNumberError) errors.push(accountNumberError);
  } else {
    errors.push({
      field: 'accountNumber',
      message: 'accountNumber is required for savings accounts',
    });
  }
  
  // Validate current balance
  if (asset.type === 'savings-account' && 'currentBalance' in asset) {
    const balanceError = validatePositiveAmount(
      asset.currentBalance as number,
      'currentBalance'
    );
    if (balanceError) errors.push(balanceError);
  } else {
    errors.push({
      field: 'currentBalance',
      message: 'currentBalance is required for savings accounts',
    });
  }
  
  // Validate optional interest rate (if provided)
  if (
    asset.type === 'savings-account' &&
    'interestRate' in asset &&
    asset.interestRate !== undefined &&
    asset.interestRate !== null
  ) {
    const interestError = validateInterestRate(
      asset.interestRate as number,
      'interestRate'
    );
    if (interestError) errors.push(interestError);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}
