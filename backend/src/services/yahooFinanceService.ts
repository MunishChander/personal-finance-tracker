import yahooFinance from 'yahoo-finance2';
import { logger } from '../utils/logger.js';

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  companyName: string;
}

/**
 * Fetch current stock quote from Yahoo Finance
 */
export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  try {
    logger.info(`Fetching quote for ${symbol}`);
    
    const quote = await yahooFinance.quote(symbol);
    
    if (!quote || !quote.regularMarketPrice) {
      logger.warn(`No quote data found for ${symbol}`);
      return null;
    }

    return {
      symbol: quote.symbol,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange || 0,
      changePercent: quote.regularMarketChangePercent || 0,
      companyName: quote.longName || quote.shortName || symbol,
    };
  } catch (error) {
    logger.error(`Error fetching quote for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch quotes for multiple symbols
 */
export async function getMultipleStockQuotes(symbols: string[]): Promise<Map<string, StockQuote>> {
  const quotes = new Map<string, StockQuote>();
  
  // Fetch quotes in parallel
  const results = await Promise.allSettled(
    symbols.map(symbol => getStockQuote(symbol))
  );
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      quotes.set(symbols[index], result.value);
    }
  });
  
  return quotes;
}

/**
 * Search for stock symbols
 */
export async function searchStocks(query: string): Promise<any[]> {
  try {
    logger.info(`Searching stocks for query: ${query}`);
    
    // Try Yahoo Finance search first
    try {
      const results = await yahooFinance.search(query);
      logger.info(`Yahoo Finance search results:`, { count: results.quotes?.length || 0 });
      
      if (results.quotes && results.quotes.length > 0) {
        return results.quotes;
      }
    } catch (searchError) {
      logger.warn(`Yahoo Finance search failed, using fallback:`, searchError);
    }
    
    // Fallback: Common Indian stocks database
    const indianStocks = [
      { symbol: 'RELIANCE.NS', shortname: 'Reliance Industries', longname: 'Reliance Industries Limited', exchDisp: 'NSE', typeDisp: 'Equity' },
      { symbol: 'RELIANCE.BO', shortname: 'Reliance Industries', longname: 'Reliance Industries Limited', exchDisp: 'BSE', typeDisp: 'Equity' },
      { symbol: 'TCS.NS', shortname: 'TCS', longname: 'Tata Consultancy Services Limited', exchDisp: 'NSE', typeDisp: 'Equity' },
      { symbol: 'TCS.BO', shortname: 'TCS', longname: 'Tata Consultancy Services Limited', exchDisp: 'BSE', typeDisp: 'Equity' },
      { symbol: 'HDFCBANK.NS', shortname: 'HDFC Bank', longname: 'HDFC Bank Limited', exchDisp: 'NSE', typeDisp: 'Equity' },
      { symbol: 'HDFCBANK.BO', shortname: 'HDFC Bank', longname: 'HDFC Bank Limited', exchDisp: 'BSE', typeDisp: 'Equity' },
      { symbol: 'INFY.NS', shortname: 'Infosys', longname: 'Infosys Limited', exchDisp: 'NSE', typeDisp: 'Equity' },
      { symbol: 'INFY.BO', shortname: 'Infosys', longname: 'Infosys Limited', exchDisp: 'BSE', typeDisp: 'Equity' },
      { symbol: 'ICICIBANK.NS', shortname: 'ICICI Bank', longname: 'ICICI Bank Limited', exchDisp: 'NSE', typeDisp: 'Equity' },
      { symbol: 'ICICIBANK.BO', shortname: 'ICICI Bank', longname: 'ICICI Bank Limited', exchDisp: 'BSE', typeDisp: 'Equity' },
      { symbol: 'HINDUNILVR.NS', shortname: 'Hindustan Unilever', longname: 'Hindustan Unilever Limited', exchDisp: 'NSE', typeDisp: 'Equity' },
      { symbol: 'ITC.NS', shortname: 'ITC', longname: 'ITC Limited', exchDisp: 'NSE', typeDisp: 'Equity' },
      { symbol: 'SBIN.NS', shortname: 'SBI', longname: 'State Bank of India', exchDisp: 'NSE', typeDisp: 'Equity' },
      { symbol: 'BHARTIARTL.NS', shortname: 'Bharti Airtel', longname: 'Bharti Airtel Limited', exchDisp: 'NSE', typeDisp: 'Equity' },
      { symbol: 'KOTAKBANK.NS', shortname: 'Kotak Bank', longname: 'Kotak Mahindra Bank Limited', exchDisp: 'NSE', typeDisp: 'Equity' },
      { symbol: 'LT.NS', shortname: 'L&T', longname: 'Larsen & Toubro Limited', exchDisp: 'NSE', typeDisp: 'Equity' },
      { symbol: 'AXISBANK.NS', shortname: 'Axis Bank', longname: 'Axis Bank Limited', exchDisp: 'NSE', typeDisp: 'Equity' },
      { symbol: 'MARUTI.NS', shortname: 'Maruti Suzuki', longname: 'Maruti Suzuki India Limited', exchDisp: 'NSE', typeDisp: 'Equity' },
      { symbol: 'WIPRO.NS', shortname: 'Wipro', longname: 'Wipro Limited', exchDisp: 'NSE', typeDisp: 'Equity' },
      { symbol: 'TATAMOTORS.NS', shortname: 'Tata Motors', longname: 'Tata Motors Limited', exchDisp: 'NSE', typeDisp: 'Equity' },
    ];
    
    // Filter stocks based on query
    const lowerQuery = query.toLowerCase();
    const filtered = indianStocks.filter(stock => 
      stock.symbol.toLowerCase().includes(lowerQuery) ||
      stock.shortname.toLowerCase().includes(lowerQuery) ||
      stock.longname.toLowerCase().includes(lowerQuery)
    );
    
    logger.info(`Fallback search results:`, { count: filtered.length });
    return filtered;
    
  } catch (error) {
    logger.error(`Error searching stocks:`, error);
    return [];
  }
}
