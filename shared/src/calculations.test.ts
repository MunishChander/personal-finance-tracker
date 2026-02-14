/**
 * Unit tests for calculation functions
 */

import { describe, it, expect } from 'vitest';
import {
  calculateMaturityAmount,
  calculateDaysToMaturity,
  isMatured,
  isMaturingSoon,
} from './calculations';

describe('calculateMaturityAmount', () => {
  it('should calculate maturity amount correctly for 1 year deposit', () => {
    const principal = 100000;
    const rate = 7.5; // 7.5% annual interest
    const startDate = new Date('2024-01-01');
    const maturityDate = new Date('2025-01-01');
    
    const maturityAmount = calculateMaturityAmount(principal, rate, startDate, maturityDate);
    
    // 2024-01-01 to 2025-01-01 is 366 days (2024 is a leap year)
    // Expected: 100000 * (1 + 0.075 * (366/365)) = 100000 * 1.07520548 = 107520.55
    expect(maturityAmount).toBe(107520.55);
  });
  
  it('should calculate maturity amount correctly for 6 months deposit', () => {
    const principal = 50000;
    const rate = 6; // 6% annual interest
    const startDate = new Date('2024-01-01');
    const maturityDate = new Date('2024-07-01');
    
    const maturityAmount = calculateMaturityAmount(principal, rate, startDate, maturityDate);
    
    // 2024-01-01 to 2024-07-01 is 182 days (2024 is a leap year)
    // Expected: 50000 * (1 + 0.06 * (182/365)) = 50000 * 1.029917808 = 51495.89
    expect(maturityAmount).toBeCloseTo(51495.89, 2);
  });
  
  it('should calculate maturity amount correctly for 2 year deposit', () => {
    const principal = 200000;
    const rate = 8; // 8% annual interest
    const startDate = new Date('2023-01-01');
    const maturityDate = new Date('2025-01-01');
    
    const maturityAmount = calculateMaturityAmount(principal, rate, startDate, maturityDate);
    
    // 2023-01-01 to 2025-01-01 is 731 days (2024 is a leap year)
    // Expected: 200000 * (1 + 0.08 * (731/365)) = 200000 * 1.16021918 = 232043.84
    expect(maturityAmount).toBe(232043.84);
  });
  
  it('should handle zero interest rate', () => {
    const principal = 100000;
    const rate = 0;
    const startDate = new Date('2024-01-01');
    const maturityDate = new Date('2025-01-01');
    
    const maturityAmount = calculateMaturityAmount(principal, rate, startDate, maturityDate);
    
    // Expected: 100000 * (1 + 0 * 1) = 100000
    expect(maturityAmount).toBe(100000);
  });
  
  it('should round to 2 decimal places', () => {
    const principal = 100000;
    const rate = 7.33; // Rate that produces decimals
    const startDate = new Date('2024-01-01');
    const maturityDate = new Date('2025-01-01');
    
    const maturityAmount = calculateMaturityAmount(principal, rate, startDate, maturityDate);
    
    // 366 days: 100000 * (1 + 0.0733 * (366/365)) = 107350.08
    expect(maturityAmount).toBe(107350.08);
    expect(maturityAmount.toString()).toMatch(/^\d+\.\d{2}$/);
  });
});

describe('calculateDaysToMaturity', () => {
  it('should calculate positive days for future maturity date', () => {
    const maturityDate = new Date('2025-12-31');
    const currentDate = new Date('2025-01-01');
    
    const days = calculateDaysToMaturity(maturityDate, currentDate);
    
    // 364 days in 2025 (not a leap year)
    expect(days).toBe(364);
  });
  
  it('should calculate negative days for past maturity date', () => {
    const maturityDate = new Date('2024-01-01');
    const currentDate = new Date('2024-12-31');
    
    const days = calculateDaysToMaturity(maturityDate, currentDate);
    
    // 2024 is a leap year, so 366 days from Jan 1 to Dec 31
    // But we're going backwards, so -365 days
    expect(days).toBe(-365);
  });
  
  it('should return 0 for same day maturity', () => {
    const maturityDate = new Date('2024-06-15T12:00:00');
    const currentDate = new Date('2024-06-15T14:00:00');
    
    const days = calculateDaysToMaturity(maturityDate, currentDate);
    
    expect(days).toBe(0);
  });
  
  it('should handle leap year correctly', () => {
    const maturityDate = new Date('2024-12-31');
    const currentDate = new Date('2024-01-01');
    
    const days = calculateDaysToMaturity(maturityDate, currentDate);
    
    // 365 days in 2024 (leap year)
    expect(days).toBe(365);
  });
  
  it('should use current date when not provided', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    
    const days = calculateDaysToMaturity(futureDate);
    
    expect(days).toBeGreaterThanOrEqual(9);
    expect(days).toBeLessThanOrEqual(11);
  });
});

describe('isMatured', () => {
  it('should return true when maturity date is in the past', () => {
    const maturityDate = new Date('2023-01-01');
    const currentDate = new Date('2024-01-01');
    
    const result = isMatured(maturityDate, currentDate);
    
    expect(result).toBe(true);
  });
  
  it('should return false when maturity date is in the future', () => {
    const maturityDate = new Date('2025-01-01');
    const currentDate = new Date('2024-01-01');
    
    const result = isMatured(maturityDate, currentDate);
    
    expect(result).toBe(false);
  });
  
  it('should return true when maturity date is today', () => {
    const maturityDate = new Date('2024-06-15T10:00:00');
    const currentDate = new Date('2024-06-15T14:00:00');
    
    const result = isMatured(maturityDate, currentDate);
    
    expect(result).toBe(true);
  });
  
  it('should return true when maturity date equals current date exactly', () => {
    const date = new Date('2024-06-15T12:00:00');
    
    const result = isMatured(date, date);
    
    expect(result).toBe(true);
  });
  
  it('should use current date when not provided', () => {
    const pastDate = new Date('2020-01-01');
    
    const result = isMatured(pastDate);
    
    expect(result).toBe(true);
  });
});

describe('isMaturingSoon', () => {
  it('should return true for deposits maturing in 30 days', () => {
    const currentDate = new Date('2024-01-01');
    const maturityDate = new Date('2024-01-31');
    
    const result = isMaturingSoon(maturityDate, currentDate);
    
    expect(result).toBe(true);
  });
  
  it('should return true for deposits maturing in 1 day', () => {
    const currentDate = new Date('2024-01-01');
    const maturityDate = new Date('2024-01-02');
    
    const result = isMaturingSoon(maturityDate, currentDate);
    
    expect(result).toBe(true);
  });
  
  it('should return true for deposits maturing today', () => {
    const currentDate = new Date('2024-01-01T10:00:00');
    const maturityDate = new Date('2024-01-01T14:00:00');
    
    const result = isMaturingSoon(maturityDate, currentDate);
    
    expect(result).toBe(true);
  });
  
  it('should return false for deposits maturing in 31 days', () => {
    const currentDate = new Date('2024-01-01');
    const maturityDate = new Date('2024-02-01');
    
    const result = isMaturingSoon(maturityDate, currentDate);
    
    expect(result).toBe(false);
  });
  
  it('should return false for deposits maturing in 60 days', () => {
    const currentDate = new Date('2024-01-01');
    const maturityDate = new Date('2024-03-01');
    
    const result = isMaturingSoon(maturityDate, currentDate);
    
    expect(result).toBe(false);
  });
  
  it('should return false for already matured deposits', () => {
    const currentDate = new Date('2024-01-15');
    const maturityDate = new Date('2024-01-01');
    
    const result = isMaturingSoon(maturityDate, currentDate);
    
    expect(result).toBe(false);
  });
  
  it('should use current date when not provided', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 15);
    
    const result = isMaturingSoon(futureDate);
    
    expect(result).toBe(true);
  });
});
