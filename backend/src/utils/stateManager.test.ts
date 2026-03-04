/**
 * Unit tests for State Manager utility
 */

import {
  generateState,
  validateState,
  cleanupExpiredStates,
  getStateCount,
  clearAllStates,
} from './stateManager';

describe('State Manager', () => {
  // Clear state storage before each test
  beforeEach(() => {
    clearAllStates();
  });

  describe('generateState', () => {
    it('should generate a non-empty string', () => {
      const state = generateState();
      expect(state).toBeTruthy();
      expect(typeof state).toBe('string');
      expect(state.length).toBeGreaterThan(0);
    });

    it('should generate unique state tokens', () => {
      const state1 = generateState();
      const state2 = generateState();
      const state3 = generateState();
      
      expect(state1).not.toBe(state2);
      expect(state2).not.toBe(state3);
      expect(state1).not.toBe(state3);
    });

    it('should generate hex strings (64 characters for 32 bytes)', () => {
      const state = generateState();
      expect(state).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should store the state in memory', () => {
      expect(getStateCount()).toBe(0);
      generateState();
      expect(getStateCount()).toBe(1);
      generateState();
      expect(getStateCount()).toBe(2);
    });
  });

  describe('validateState', () => {
    it('should return true for a valid, non-expired state', () => {
      const state = generateState();
      expect(validateState(state)).toBe(true);
    });

    it('should return false for a non-existent state', () => {
      expect(validateState('invalid-state-token')).toBe(false);
    });

    it('should remove state after validation (one-time use)', () => {
      const state = generateState();
      expect(getStateCount()).toBe(1);
      
      // First validation should succeed
      expect(validateState(state)).toBe(true);
      expect(getStateCount()).toBe(0);
      
      // Second validation should fail (already used)
      expect(validateState(state)).toBe(false);
    });

    it('should return false for expired state', async () => {
      // Generate state
      const state = generateState();
      
      // Mock Date.now to simulate 11 minutes passing
      const originalDateNow = Date.now;
      const mockTime = Date.now() + 11 * 60 * 1000; // 11 minutes later
      Date.now = jest.fn(() => mockTime);
      
      // Validate should return false for expired state
      expect(validateState(state)).toBe(false);
      
      // Restore Date.now
      Date.now = originalDateNow;
    });

    it('should validate multiple different states independently', () => {
      const state1 = generateState();
      const state2 = generateState();
      const state3 = generateState();
      
      expect(getStateCount()).toBe(3);
      
      // Validate state2
      expect(validateState(state2)).toBe(true);
      expect(getStateCount()).toBe(2);
      
      // state1 and state3 should still be valid
      expect(validateState(state1)).toBe(true);
      expect(validateState(state3)).toBe(true);
      expect(getStateCount()).toBe(0);
    });
  });

  describe('cleanupExpiredStates', () => {
    it('should not remove non-expired states', () => {
      generateState();
      generateState();
      generateState();
      
      expect(getStateCount()).toBe(3);
      cleanupExpiredStates();
      expect(getStateCount()).toBe(3);
    });

    it('should remove expired states', () => {
      // Generate some states
      generateState();
      generateState();
      
      expect(getStateCount()).toBe(2);
      
      // Mock Date.now to simulate 11 minutes passing
      const originalDateNow = Date.now;
      const mockTime = Date.now() + 11 * 60 * 1000; // 11 minutes later
      Date.now = jest.fn(() => mockTime);
      
      // Cleanup should remove expired states
      cleanupExpiredStates();
      expect(getStateCount()).toBe(0);
      
      // Restore Date.now
      Date.now = originalDateNow;
    });

    it('should only remove expired states, keeping valid ones', () => {
      // Generate first state
      const state1 = generateState();
      
      // Mock time to 5 minutes later
      const originalDateNow = Date.now;
      const time5MinLater = Date.now() + 5 * 60 * 1000;
      Date.now = jest.fn(() => time5MinLater);
      
      // Generate second state (5 minutes after first)
      const state2 = generateState();
      
      // Mock time to 11 minutes after first state (6 minutes after second)
      const time11MinLater = originalDateNow() + 11 * 60 * 1000;
      Date.now = jest.fn(() => time11MinLater);
      
      // Cleanup should remove only state1
      cleanupExpiredStates();
      expect(getStateCount()).toBe(1);
      
      // state2 should still be valid
      expect(validateState(state2)).toBe(true);
      
      // Restore Date.now
      Date.now = originalDateNow;
    });

    it('should handle empty storage gracefully', () => {
      expect(getStateCount()).toBe(0);
      expect(() => cleanupExpiredStates()).not.toThrow();
      expect(getStateCount()).toBe(0);
    });
  });

  describe('getStateCount', () => {
    it('should return 0 for empty storage', () => {
      expect(getStateCount()).toBe(0);
    });

    it('should return correct count after generating states', () => {
      expect(getStateCount()).toBe(0);
      generateState();
      expect(getStateCount()).toBe(1);
      generateState();
      expect(getStateCount()).toBe(2);
      generateState();
      expect(getStateCount()).toBe(3);
    });

    it('should decrease count after validation', () => {
      const state = generateState();
      expect(getStateCount()).toBe(1);
      validateState(state);
      expect(getStateCount()).toBe(0);
    });
  });

  describe('clearAllStates', () => {
    it('should remove all states from storage', () => {
      generateState();
      generateState();
      generateState();
      
      expect(getStateCount()).toBe(3);
      clearAllStates();
      expect(getStateCount()).toBe(0);
    });

    it('should handle empty storage gracefully', () => {
      expect(getStateCount()).toBe(0);
      expect(() => clearAllStates()).not.toThrow();
      expect(getStateCount()).toBe(0);
    });
  });
});
