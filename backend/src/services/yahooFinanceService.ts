import YahooFinance from 'yahoo-finance2';
import { logger } from '../utils/logger.js';

// Initialize Yahoo Finance instance with suppressed notices
const yahooFinance = new YahooFinance({ 
  suppressNotices: ['yahooSurvey', 'ripHistorical'] 
});

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  companyName: string;
}

/**
 * Fetch current stock quote from Yahoo Finance
 * Falls back to historical data if current price is unavailable (market closed)
 */
export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  try {
    logger.info(`Fetching quote for ${symbol}`);
    
    // Try to get current quote first using quoteSummary
    try {
      const result: any = await yahooFinance.quoteSummary(symbol, {
        modules: ['price', 'summaryDetail']
      });
      
      const price = result?.price;
      if (price && price.regularMarketPrice) {
        return {
          symbol: price.symbol || symbol,
          price: price.regularMarketPrice,
          change: price.regularMarketChange || 0,
          changePercent: price.regularMarketChangePercent || 0,
          companyName: price.longName || price.shortName || symbol,
        };
      }
    } catch (quoteError) {
      logger.warn(`Current quote unavailable for ${symbol}, trying historical data`);
    }
    
    // Fallback to historical data (last closing price)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // Get last 7 days
    
    try {
      const result: any = await yahooFinance.historical(symbol, {
        period1: startDate,
        period2: endDate,
        interval: '1d'
      });
      
      if (result && result.length > 0) {
        // Get the most recent closing price
        const lastQuote = result[result.length - 1];
        
        if (lastQuote.close) {
          logger.info(`Using historical closing price for ${symbol}`, { 
            date: lastQuote.date,
            price: lastQuote.close 
          });
          
          return {
            symbol: symbol,
            price: lastQuote.close,
            change: 0, // No change data available from historical
            changePercent: 0,
            companyName: symbol,
          };
        }
      }
    } catch (historicalError: any) {
      logger.error(`Historical data also unavailable for ${symbol}:`, {
        message: historicalError.message
      });
    }
    
    logger.warn(`No price data found for ${symbol}`);
    return null;
    
  } catch (error: any) {
    logger.error(`Error fetching quote for ${symbol}:`, { 
      message: error.message,
      code: error.code,
      type: error.constructor.name 
    });
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
      const results: any = await yahooFinance.search(query, {
        quotesCount: 10,
        newsCount: 0
      });
      logger.info(`Yahoo Finance search results:`, { count: results.quotes?.length || 0 });
      
      if (results.quotes && results.quotes.length > 0) {
        return results.quotes;
      }
    } catch (searchError: any) {
      logger.warn(`Yahoo Finance search failed, using fallback:`, {
        message: searchError.message
      });
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
    
  } catch (error: any) {
    logger.error(`Error searching stocks:`, {
      message: error.message
    });
    return [];
  }
}

/**
 * Get market indices data (Nifty 50, Sensex)
 */
export async function getMarketIndices(): Promise<Map<string, { name: string; price: number; change: number; changePercent: number }>> {
  const indices = new Map();
  
  // Nifty 50 and Sensex symbols
  const symbols = ['^NSEI', '^BSESN']; // Nifty 50, Sensex
  
  try {
    for (const symbol of symbols) {
      try {
        const result: any = await yahooFinance.quoteSummary(symbol, {
          modules: ['price']
        });
        
        const price = result?.price;
        if (price && price.regularMarketPrice) {
          const name = symbol === '^NSEI' ? 'Nifty 50' : 'Sensex';
          
          indices.set(symbol, {
            name,
            price: price.regularMarketPrice,
            change: price.regularMarketChange || 0,
            changePercent: price.regularMarketChangePercent || 0
          });
          
          logger.info(`Fetched ${name} data`, { 
            price: price.regularMarketPrice, 
            change: price.regularMarketChange,
            changePercent: price.regularMarketChangePercent 
          });
        }
      } catch (error: any) {
        logger.warn(`Failed to fetch ${symbol}`, { message: error.message });
      }
    }
    
    return indices;
  } catch (error: any) {
    logger.error('Error fetching market indices', { message: error.message });
    return indices;
  }
}
