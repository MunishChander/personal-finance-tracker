/**
 * Property-based tests for validation functions
 * Using fast-check for property-based testing
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { validatePositiveAmount } from './validation';

// Feature: personal-finance-tracker, Property 17: Positive Amount Validation
describe('Property 17: Positive Amount Validation', () => {
  it('should accept all positive numbers', () => {
    fc.assert(
      fc.property(
        fc.double({ min: Number.MIN_VALUE, max: Number.MAX_SAFE_INTEGER, noNaN: true }),
        (amount) => {
          const result = validatePositiveAmount(amount, 'testField');
          expect(result).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject zero', () => {
    const result = validatePositiveAmount(0, 'testField');
    expect(result).not.toBeNull();
    expect(result?.field).toBe('testField');
    expect(result?.message).toContain('greater than 0');
  });

  it('should reject all negative numbers', () => {
    fc.assert(
      fc.property(
        fc.double({ min: -Number.MAX_SAFE_INTEGER, max: -Number.MIN_VALUE, noNaN: true }),
        (amount) => {
          const result = validatePositiveAmount(amount, 'testField');
          expect(result).not.toBeNull();
          expect(result?.field).toBe('testField');
          expect(result?.message).toContain('greater than 0');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject NaN', () => {
    const result = validatePositiveAmount(NaN, 'testField');
    expect(result).not.toBeNull();
    expect(result?.field).toBe('testField');
    expect(result?.message).toContain('valid number');
  });

  it('should reject non-numeric values', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.string(),
          fc.boolean(),
          fc.constant(null),
          fc.constant(undefined),
          fc.object()
        ),
        (value) => {
          const result = validatePositiveAmount(value as any, 'testField');
          expect(result).not.toBeNull();
          expect(result?.field).toBe('testField');
        }
      ),
      { numRuns: 100 }
    );
  });
});
