/**
 * Calculation functions for Personal Finance Tracker
 * Handles maturity calculations for fixed deposits
 */

/**
 * Calculates the maturity amount for a fixed deposit using simple interest
 * Formula: Principal × (1 + Rate × Time)
 * 
 * Requirement 1.6, 8.5: Calculate maturity amount based on principal, interest rate, and duration
 * 
 * @param principalAmount - The initial deposit amount
 * @param interestRate - Annual interest rate as a percentage (e.g., 5 for 5%)
 * @param startDate - The date the deposit started
 * @param maturityDate - The date the deposit matures
 * @returns The maturity amount including principal and interest
 */
export function calculateMaturityAmount(
  principalAmount: number,
  interestRate: number,
  startDate: Date,
  maturityDate: Date
): number {
  // Calculate time period in years using actual days
  // We need to count the actual number of days between dates
  const startTime = startDate.getTime();
  const maturityTime = maturityDate.getTime();
  const millisecondsInDay = 1000 * 60 * 60 * 24;
  const daysInPeriod = Math.round((maturityTime - startTime) / millisecondsInDay);
  
  // Use 365 days per year for simple interest calculation
  const yearsInPeriod = daysInPeriod / 365;
  
  // Convert interest rate from percentage to decimal
  const rateDecimal = interestRate / 100;
  
  // Calculate maturity amount using simple interest formula
  // Maturity Amount = Principal × (1 + Rate × Time)
  const maturityAmount = principalAmount * (1 + rateDecimal * yearsInPeriod);
  
  // Round to 2 decimal places for currency
  return Math.round(maturityAmount * 100) / 100;
}

/**
 * Calculates the number of days remaining until maturity
 * 
 * Requirement 8.1: Calculate days to maturity for fixed deposits
 * 
 * @param maturityDate - The date the deposit matures
 * @param currentDate - The current date (defaults to now)
 * @returns Number of days until maturity (negative if already matured)
 */
export function calculateDaysToMaturity(
  maturityDate: Date,
  currentDate: Date = new Date()
): number {
  // Normalize dates to start of day for consistent day counting
  const maturityDay = new Date(maturityDate.getFullYear(), maturityDate.getMonth(), maturityDate.getDate());
  const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  
  const maturityTime = maturityDay.getTime();
  const currentTime = currentDay.getTime();
  const millisecondsDiff = maturityTime - currentTime;
  const daysDiff = Math.round(millisecondsDiff / (1000 * 60 * 60 * 24));
  
  return daysDiff;
}

/**
 * Determines if a fixed deposit has matured
 * 
 * Requirement 8.2: Determine maturity status
 * 
 * @param maturityDate - The date the deposit matures
 * @param currentDate - The current date (defaults to now)
 * @returns true if the deposit has matured, false otherwise
 */
export function isMatured(
  maturityDate: Date,
  currentDate: Date = new Date()
): boolean {
  return currentDate >= maturityDate;
}

/**
 * Checks if a fixed deposit is maturing soon (within the next 30 days)
 * 
 * Requirement 8.3: Count deposits maturing in next 30 days
 * 
 * @param maturityDate - The date the deposit matures
 * @param currentDate - The current date (defaults to now)
 * @returns true if the deposit matures within 30 days, false otherwise
 */
export function isMaturingSoon(
  maturityDate: Date,
  currentDate: Date = new Date()
): boolean {
  const daysToMaturity = calculateDaysToMaturity(maturityDate, currentDate);
  return daysToMaturity >= 0 && daysToMaturity <= 30;
}
