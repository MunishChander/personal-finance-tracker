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
    
    const results = await yahooFinance.search(query);
    
    return results.quotes || [];
  } catch (error) {
    logger.error(`Error searching stocks:`, error);
    return [];
  }
}
