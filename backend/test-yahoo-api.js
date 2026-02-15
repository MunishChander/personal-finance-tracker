// Quick test of Yahoo Finance API
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

async function testYahooAPI() {
  console.log('Testing Yahoo Finance API...\n');
  
  const symbol = 'RELIANCE.NS';
  
  // Test 1: quoteSummary
  console.log('1. Testing quoteSummary...');
  try {
    const result = await yahooFinance.quoteSummary(symbol, {
      modules: ['price', 'summaryDetail']
    });
    console.log('✅ quoteSummary works!');
    console.log('Price data:', result?.price?.regularMarketPrice);
    console.log('Company:', result?.price?.longName);
  } catch (error) {
    console.log('❌ quoteSummary failed:', error.message);
  }
  
  // Test 2: historical
  console.log('\n2. Testing historical...');
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    const result = await yahooFinance.historical(symbol, {
      period1: startDate,
      period2: endDate,
      interval: '1d'
    });
    console.log('✅ historical works!');
    console.log('Data points:', result?.length);
    if (result && result.length > 0) {
      const last = result[result.length - 1];
      console.log('Last close:', last.close, 'on', last.date);
    }
  } catch (error) {
    console.log('❌ historical failed:', error.message);
  }
  
  // Test 3: search
  console.log('\n3. Testing search...');
  try {
    const result = await yahooFinance.search('reliance', {
      quotesCount: 5,
      newsCount: 0
    });
    console.log('✅ search works!');
    console.log('Results:', result?.quotes?.length);
  } catch (error) {
    console.log('❌ search failed:', error.message);
  }
}

testYahooAPI().catch(console.error);
