import { logger } from '../utils/logger.js';

const MFAPI_BASE_URL = 'https://api.mfapi.in/mf';

export interface MFQuote {
  schemeCode: string;
  schemeName: string;
  fundHouse: string;
  nav: number;
  date: string;
}

export interface MFSearchResult {
  schemeCode: string;
  schemeName: string;
}

/**
 * Fetch current NAV for a mutual fund scheme
 */
export async function getMFQuote(schemeCode: string): Promise<MFQuote | null> {
  try {
    logger.info(`Fetching NAV for scheme ${schemeCode}`);
    
    const response = await fetch(`${MFAPI_BASE_URL}/${schemeCode}`);
    
    if (!response.ok) {
      logger.error(`MFApi returned ${response.status} for scheme ${schemeCode}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.status !== 'SUCCESS' || !data.data || data.data.length === 0) {
      logger.warn(`No NAV data found for scheme ${schemeCode}`);
      return null;
    }
    
    // Get the latest NAV (first element in data array)
    const latestNav = data.data[0];
    
    return {
      schemeCode: data.meta.scheme_code,
      schemeName: data.meta.scheme_name,
      fundHouse: data.meta.fund_house,
      nav: parseFloat(latestNav.nav),
      date: latestNav.date,
    };
  } catch (error: any) {
    logger.error(`Error fetching NAV for scheme ${schemeCode}:`, {
      message: error.message
    });
    return null;
  }
}

/**
 * Fetch NAVs for multiple schemes
 */
export async function getMultipleMFQuotes(schemeCodes: string[]): Promise<Map<string, MFQuote>> {
  const quotes = new Map<string, MFQuote>();
  
  // Fetch quotes in parallel
  const results = await Promise.allSettled(
    schemeCodes.map(code => getMFQuote(code))
  );
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      quotes.set(schemeCodes[index], result.value);
    }
  });
  
  return quotes;
}

/**
 * Search for mutual fund schemes
 */
export async function searchMutualFunds(query: string): Promise<MFSearchResult[]> {
  try {
    logger.info(`Searching mutual funds for query: ${query}`);
    
    const response = await fetch(`${MFAPI_BASE_URL}/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      logger.error(`MFApi search returned ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      logger.warn(`Unexpected response format from MFApi search`);
      return [];
    }
    
    logger.info(`MFApi search results:`, { count: data.length });
    
    return data.map((item: any) => ({
      schemeCode: item.schemeCode.toString(),
      schemeName: item.schemeName,
    }));
  } catch (error: any) {
    logger.error(`Error searching mutual funds:`, {
      message: error.message
    });
    return [];
  }
}
