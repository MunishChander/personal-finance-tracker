/**
 * XIRR (Extended Internal Rate of Return) Calculation
 * Calculates the annualized return rate for investments with irregular cash flows
 */

interface CashFlow {
  date: Date;
  amount: number; // Negative for investments, positive for returns
}

/**
 * Calculate XIRR using Newton-Raphson method
 * @param cashFlows Array of cash flows with dates and amounts
 * @param guess Initial guess for the rate (default 0.1 = 10%)
 * @returns XIRR as a decimal (e.g., 0.15 = 15%)
 */
export function calculateXIRR(cashFlows: CashFlow[], guess: number = 0.1): number | null {
  if (cashFlows.length < 2) {
    return null;
  }

  const maxIterations = 100;
  const tolerance = 0.0001;
  let rate = guess;

  // Sort cash flows by date
  const sortedFlows = [...cashFlows].sort((a, b) => a.date.getTime() - b.date.getTime());
  const startDate = sortedFlows[0].date;

  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;

    for (const flow of sortedFlows) {
      const years = daysBetween(startDate, flow.date) / 365;
      const factor = Math.pow(1 + rate, years);
      
      npv += flow.amount / factor;
      dnpv -= flow.amount * years / Math.pow(1 + rate, years + 1);
    }

    const newRate = rate - npv / dnpv;

    if (Math.abs(newRate - rate) < tolerance) {
      return newRate;
    }

    rate = newRate;

    // Prevent infinite loops with invalid rates
    if (rate < -0.99 || rate > 10) {
      return null;
    }
  }

  return null; // Did not converge
}

/**
 * Calculate days between two dates
 */
function daysBetween(date1: Date, date2: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return (date2.getTime() - date1.getTime()) / msPerDay;
}

/**
 * Calculate simple annualized return
 * For single investment with current value
 */
export function calculateAnnualizedReturn(
  investedAmount: number,
  currentValue: number,
  startDate: Date,
  endDate: Date = new Date()
): number | null {
  if (investedAmount <= 0) return null;

  const years = daysBetween(startDate, endDate) / 365;
  if (years <= 0) return null;

  // Annualized return formula: ((Current Value / Invested Amount) ^ (1 / years)) - 1
  const totalReturn = currentValue / investedAmount;
  const annualizedReturn = Math.pow(totalReturn, 1 / years) - 1;

  return annualizedReturn;
}

/**
 * Calculate CAGR (Compound Annual Growth Rate)
 * Same as annualized return but more commonly used term
 */
export function calculateCAGR(
  initialValue: number,
  finalValue: number,
  years: number
): number | null {
  if (initialValue <= 0 || years <= 0) return null;
  
  return Math.pow(finalValue / initialValue, 1 / years) - 1;
}
