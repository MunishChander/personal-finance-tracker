/**
 * Parse amount strings with shorthand notation
 * Supports: k/K (thousand), m/M (million), b/B (billion), l/L/lac (lakh), cr/CR (crore)
 * 
 * Examples:
 * - "1k" or "1K" → 1000
 * - "1.5m" or "1.5M" → 1500000
 * - "2b" or "2B" → 2000000000
 * - "5l" or "5L" or "5lac" → 500000
 * - "2cr" or "2CR" → 20000000
 */
export function parseAmount(value: string): number {
  if (!value || value.trim() === '') {
    return 0;
  }

  const trimmed = value.trim().toLowerCase();
  
  // Check for shorthand notation
  const match = trimmed.match(/^([\d.]+)\s*(k|m|b|l|lac|cr|crore)?$/i);
  
  if (!match) {
    // No shorthand, parse as regular number
    return parseFloat(value) || 0;
  }

  const [, numberPart, suffix] = match;
  const baseNumber = parseFloat(numberPart);

  if (isNaN(baseNumber)) {
    return 0;
  }

  // Apply multiplier based on suffix
  switch (suffix?.toLowerCase()) {
    case 'k':
      return baseNumber * 1000; // Thousand
    case 'm':
      return baseNumber * 1000000; // Million
    case 'b':
      return baseNumber * 1000000000; // Billion
    case 'l':
    case 'lac':
      return baseNumber * 100000; // Lakh (Indian numbering)
    case 'cr':
    case 'crore':
      return baseNumber * 10000000; // Crore (Indian numbering)
    default:
      return baseNumber;
  }
}

/**
 * Format the parsed amount back to display value with comma separation
 * Uses Indian numbering system (lakhs and crores)
 */
export function formatAmountForDisplay(value: number): string {
  if (!value || isNaN(value)) {
    return '';
  }
  
  // Use Indian locale for comma separation
  return value.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  });
}

/**
 * Handle amount input change with shorthand parsing
 * Returns the raw numeric value for state storage
 */
export function handleAmountInput(inputValue: string): number {
  return parseAmount(inputValue);
}
