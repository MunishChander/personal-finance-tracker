/**
 * State Manager utility for CSRF protection in OAuth flow
 * Manages state tokens with in-memory storage and automatic expiration
 */

import crypto from 'crypto';

/**
 * State token expiration time in milliseconds (10 minutes)
 */
const STATE_EXPIRATION_MS = 10 * 60 * 1000;

/**
 * Interface for stored state data
 */
interface StateData {
  timestamp: number;
}

/**
 * In-memory storage for state tokens
 * Maps state token to creation timestamp
 */
const stateStore = new Map<string, StateData>();

/**
 * Generate a cryptographically secure random state token
 * 
 * @returns A random hex string to be used as CSRF state parameter
 */
export function generateState(): string {
  // Generate 32 random bytes and convert to hex string
  const state = crypto.randomBytes(32).toString('hex');
  
  // Store state with current timestamp
  stateStore.set(state, {
    timestamp: Date.now(),
  });
  
  return state;
}

/**
 * Validate a state token and remove it from storage if valid
 * 
 * @param state - The state token to validate
 * @returns true if state is valid and not expired, false otherwise
 */
export function validateState(state: string): boolean {
  // Check if state exists in storage
  const stateData = stateStore.get(state);
  
  if (!stateData) {
    return false;
  }
  
  // Check if state has expired (older than 10 minutes)
  const isExpired = Date.now() - stateData.timestamp > STATE_EXPIRATION_MS;
  
  // Remove state from storage (one-time use)
  stateStore.delete(state);
  
  // Return false if expired, true if valid
  return !isExpired;
}

/**
 * Clean up expired state tokens from storage
 * Should be called periodically to prevent memory leaks
 */
export function cleanupExpiredStates(): void {
  const now = Date.now();
  
  // Iterate through all stored states
  for (const [state, data] of stateStore.entries()) {
    // Remove if expired
    if (now - data.timestamp > STATE_EXPIRATION_MS) {
      stateStore.delete(state);
    }
  }
}

/**
 * Get the current number of stored states (for testing/monitoring)
 * 
 * @returns Number of states currently in storage
 */
export function getStateCount(): number {
  return stateStore.size;
}

/**
 * Clear all states from storage (for testing)
 */
export function clearAllStates(): void {
  stateStore.clear();
}
