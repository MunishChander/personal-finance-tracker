/**
 * Assets Controller
 * Handles all asset-related API endpoints
 */

import { Request, Response } from 'express';
import { pool } from '../utils/db';
import { logger } from '../utils/logger';
import {
  validateFixedDeposit,
  validateSavingsAccount,
  calculateMaturityAmount,
  calculateDaysToMaturity,
  isMatured,
  isMaturingSoon,
  Asset,
  AssetInput,
  FixedDeposit,
  SavingsAccount,
  Equity,
  DashboardStats,
} from '@personal-finance-tracker/shared';
import { getStockQuote, getMultipleStockQuotes } from '../services/yahooFinanceService.js';

/**
 * Helper function to convert database row to Asset object
 */
function rowToAsset(row: any): Asset {
  const base = {
    id: row.id,
    type: row.type,
    bankName: row.bank_name,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };

  if (row.type === 'fixed-deposit') {
    const startDate = new Date(row.start_date);
    const maturityDate = new Date(row.maturity_date);
    const maturityAmount = calculateMaturityAmount(
      row.principal_amount,
      row.interest_rate,
      startDate,
      maturityDate
    );
    const daysToMaturity = calculateDaysToMaturity(maturityDate);
    const matured = isMatured(maturityDate);

    return {
      ...base,
      type: 'fixed-deposit',
      accountNumber: row.account_number,
      principalAmount: parseFloat(row.principal_amount),
      interestRate: parseFloat(row.interest_rate),
      startDate,
      maturityDate,
      maturityAmount,
      daysToMaturity,
      isMatured: matured,
    } as FixedDeposit;
  } else if (row.type === 'savings-account') {
    return {
      ...base,
      type: 'savings-account',
      accountNumber: row.account_number,
      currentBalance: parseFloat(row.current_balance),
      interestRate: row.interest_rate ? parseFloat(row.interest_rate) : undefined,
    } as SavingsAccount;
  } else {
    // Equity
    const quantity = parseFloat(row.quantity);
    const averagePrice = parseFloat(row.average_price);
    const totalInvestment = quantity * averagePrice;
    const currentPrice = row.current_price ? parseFloat(row.current_price) : undefined;
    const currentValue = currentPrice ? quantity * currentPrice : undefined;
    const gainLoss = currentValue ? currentValue - totalInvestment : undefined;
    const gainLossPercentage = gainLoss ? (gainLoss / totalInvestment) * 100 : undefined;

    return {
      ...base,
      type: 'equity',
      symbol: row.symbol,
      companyName: row.company_name,
      exchange: row.exchange,
      quantity,
      averagePrice,
      currentPrice,
      totalInvestment,
      currentValue,
      gainLoss,
      gainLossPercentage,
    } as Equity;
  }
}

/**
 * POST /api/assets
 * Create a new asset
 */
export async function createAsset(req: Request, res: Response): Promise<void> {
  try {
    const assetInput: AssetInput = req.body;

    // Validate based on asset type
    let validationResult;
    if (assetInput.type === 'fixed-deposit') {
      validationResult = validateFixedDeposit(assetInput);
    } else if (assetInput.type === 'savings-account') {
      validationResult = validateSavingsAccount(assetInput);
    } else {
      // Basic equity validation
      const equity = assetInput as Partial<Equity>;
      validationResult = {
        isValid: !!(equity.symbol && equity.companyName && equity.exchange && equity.quantity && equity.averagePrice),
        errors: []
      };
    }

    if (!validationResult.isValid) {
      logger.warn('Asset validation failed', { 
        type: assetInput.type,
        errors: validationResult.errors 
      });
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: validationResult.errors,
      });
      return;
    }

    // Insert into database
    let result;
    if (assetInput.type === 'fixed-deposit') {
      const fd = assetInput as Partial<FixedDeposit>;
      result = await pool.query(
        `INSERT INTO assets (
          type, bank_name, account_number, principal_amount, 
          interest_rate, start_date, maturity_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
          'fixed-deposit',
          fd.bankName,
          fd.accountNumber || null,
          fd.principalAmount,
          fd.interestRate,
          fd.startDate,
          fd.maturityDate,
        ]
      );
    } else if (assetInput.type === 'savings-account') {
      const sa = assetInput as Partial<SavingsAccount>;
      result = await pool.query(
        `INSERT INTO assets (
          type, bank_name, account_number, current_balance, interest_rate
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [
          'savings-account',
          sa.bankName,
          sa.accountNumber,
          sa.currentBalance,
          sa.interestRate || null,
        ]
      );
    } else {
      // Equity
      const equity = assetInput as Partial<Equity>;
      result = await pool.query(
        `INSERT INTO assets (
          type, bank_name, symbol, company_name, exchange, quantity, average_price
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
          'equity',
          equity.bankName, // Broker name
          equity.symbol,
          equity.companyName,
          equity.exchange,
          equity.quantity,
          equity.averagePrice,
        ]
      );
    }

    const createdAsset = rowToAsset(result.rows[0]);
    logger.info('Asset created successfully', { 
      assetId: createdAsset.id, 
      type: createdAsset.type 
    });

    res.status(201).json({
      success: true,
      data: createdAsset,
    });
  } catch (error: any) {
    logger.error('Error creating asset', { body: req.body }, error);
    
    // Check for database connection errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      res.status(503).json({
        success: false,
        error: 'Database connection failed. Please try again later.',
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create asset',
    });
  }
}

/**
 * GET /api/assets
 * Get all assets
 */
export async function getAllAssets(req: Request, res: Response): Promise<void> {
  try {
    const result = await pool.query(
      'SELECT * FROM assets ORDER BY created_at DESC'
    );

    const assets = result.rows.map(rowToAsset);
    logger.debug('Assets fetched successfully', { count: assets.length });

    res.json({
      success: true,
      data: assets,
    });
  } catch (error: any) {
    logger.error('Error fetching assets', {}, error);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      res.status(503).json({
        success: false,
        error: 'Database connection failed. Please try again later.',
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assets',
    });
  }
}

/**
 * GET /api/assets/:id
 * Get a single asset by ID
 */
export async function getAssetById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM assets WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      logger.warn('Asset not found', { assetId: id });
      res.status(404).json({
        success: false,
        error: 'Asset not found',
      });
      return;
    }

    const asset = rowToAsset(result.rows[0]);

    res.json({
      success: true,
      data: asset,
    });
  } catch (error: any) {
    logger.error('Error fetching asset', { assetId: req.params.id }, error);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      res.status(503).json({
        success: false,
        error: 'Database connection failed. Please try again later.',
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch asset',
    });
  }
}

/**
 * PUT /api/assets/:id
 * Update an existing asset
 */
export async function updateAsset(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const assetInput: AssetInput = req.body;

    // Check if asset exists
    const existingResult = await pool.query(
      'SELECT * FROM assets WHERE id = $1',
      [id]
    );

    if (existingResult.rows.length === 0) {
      logger.warn('Asset not found for update', { assetId: id });
      res.status(404).json({
        success: false,
        error: 'Asset not found',
      });
      return;
    }

    // Validate based on asset type
    let validationResult;
    if (assetInput.type === 'fixed-deposit') {
      validationResult = validateFixedDeposit(assetInput);
    } else if (assetInput.type === 'savings-account') {
      validationResult = validateSavingsAccount(assetInput);
    } else {
      // Basic equity validation
      const equity = assetInput as Partial<Equity>;
      validationResult = {
        isValid: !!(equity.symbol && equity.companyName && equity.exchange && equity.quantity && equity.averagePrice),
        errors: []
      };
    }

    if (!validationResult.isValid) {
      logger.warn('Asset validation failed on update', { 
        assetId: id,
        type: assetInput.type,
        errors: validationResult.errors 
      });
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: validationResult.errors,
      });
      return;
    }

    // Update in database
    let result;
    if (assetInput.type === 'fixed-deposit') {
      const fd = assetInput as Partial<FixedDeposit>;
      result = await pool.query(
        `UPDATE assets SET
          type = $1, bank_name = $2, account_number = $3,
          principal_amount = $4, interest_rate = $5,
          start_date = $6, maturity_date = $7,
          current_balance = NULL, symbol = NULL, company_name = NULL, 
          exchange = NULL, quantity = NULL, average_price = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING *`,
        [
          'fixed-deposit',
          fd.bankName,
          fd.accountNumber || null,
          fd.principalAmount,
          fd.interestRate,
          fd.startDate,
          fd.maturityDate,
          id,
        ]
      );
    } else if (assetInput.type === 'savings-account') {
      const sa = assetInput as Partial<SavingsAccount>;
      result = await pool.query(
        `UPDATE assets SET
          type = $1, bank_name = $2, account_number = $3,
          current_balance = $4, interest_rate = $5,
          principal_amount = NULL, start_date = NULL, maturity_date = NULL,
          symbol = NULL, company_name = NULL, exchange = NULL, 
          quantity = NULL, average_price = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING *`,
        [
          'savings-account',
          sa.bankName,
          sa.accountNumber,
          sa.currentBalance,
          sa.interestRate || null,
          id,
        ]
      );
    } else {
      // Equity
      const equity = assetInput as Partial<Equity>;
      result = await pool.query(
        `UPDATE assets SET
          type = $1, bank_name = $2, symbol = $3,
          company_name = $4, exchange = $5, quantity = $6,
          average_price = $7,
          account_number = NULL, principal_amount = NULL, interest_rate = NULL,
          start_date = NULL, maturity_date = NULL, current_balance = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING *`,
        [
          'equity',
          equity.bankName, // Broker name
          equity.symbol,
          equity.companyName,
          equity.exchange,
          equity.quantity,
          equity.averagePrice,
          id,
        ]
      );
    }

    const updatedAsset = rowToAsset(result.rows[0]);
    logger.info('Asset updated successfully', { 
      assetId: updatedAsset.id, 
      type: updatedAsset.type 
    });

    res.json({
      success: true,
      data: updatedAsset,
    });
  } catch (error: any) {
    logger.error('Error updating asset', { 
      assetId: req.params.id, 
      body: req.body 
    }, error);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      res.status(503).json({
        success: false,
        error: 'Database connection failed. Please try again later.',
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update asset',
    });
  }
}

/**
 * DELETE /api/assets/:id
 * Delete an asset
 */
export async function deleteAsset(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM assets WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      logger.warn('Asset not found for deletion', { assetId: id });
      res.status(404).json({
        success: false,
        error: 'Asset not found',
      });
      return;
    }

    logger.info('Asset deleted successfully', { assetId: result.rows[0].id });

    res.json({
      success: true,
      data: { id: result.rows[0].id },
    });
  } catch (error: any) {
    logger.error('Error deleting asset', { assetId: req.params.id }, error);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      res.status(503).json({
        success: false,
        error: 'Database connection failed. Please try again later.',
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to delete asset',
    });
  }
}

/**
 * GET /api/assets/stats
 * Get dashboard statistics
 */
export async function getAssetStats(req: Request, res: Response): Promise<void> {
  try {
    const result = await pool.query('SELECT * FROM assets');
    const assets = result.rows.map(rowToAsset);

    // Calculate statistics
    let totalFixedDepositsCurrent = 0;
    let totalFixedDepositsMaturity = 0;
    let totalSavingsAccounts = 0;
    let fixedDepositCount = 0;
    let savingsAccountCount = 0;
    let maturingSoon = 0;

    assets.forEach((asset) => {
      if (asset.type === 'fixed-deposit') {
        const fd = asset as FixedDeposit;
        totalFixedDepositsCurrent += fd.principalAmount;
        totalFixedDepositsMaturity += fd.maturityAmount;
        fixedDepositCount++;
        
        if (isMaturingSoon(fd.maturityDate)) {
          maturingSoon++;
        }
      } else {
        const sa = asset as SavingsAccount;
        totalSavingsAccounts += sa.currentBalance;
        savingsAccountCount++;
      }
    });

    const totalPortfolioValue = totalFixedDepositsCurrent + totalSavingsAccounts;

    const stats: DashboardStats = {
      totalPortfolioValue,
      totalFixedDepositsCurrent,
      totalFixedDepositsMaturity,
      totalSavingsAccounts,
      fixedDepositCount,
      savingsAccountCount,
      maturingSoon,
    };

    logger.debug('Stats calculated successfully', stats);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    logger.error('Error fetching stats', {}, error);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      res.status(503).json({
        success: false,
        error: 'Database connection failed. Please try again later.',
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
    });
  }
}

/**
 * GET /api/equities/prices
 * Fetch live prices for all equities
 */
export async function refreshEquityPrices(req: Request, res: Response): Promise<void> {
  try {
    // Get all equities from database
    const result = await pool.query(
      "SELECT * FROM assets WHERE type = 'equity'"
    );

    if (result.rows.length === 0) {
      res.json({
        success: true,
        data: [],
      });
      return;
    }

    // Extract symbols
    const symbols = result.rows.map(row => row.symbol);

    // Fetch live quotes
    const quotes = await getMultipleStockQuotes(symbols);

    // Update database with current prices
    const updatePromises = result.rows.map(async (row) => {
      const quote = quotes.get(row.symbol);
      if (quote) {
        await pool.query(
          'UPDATE assets SET current_price = $1 WHERE id = $2',
          [quote.price, row.id]
        );
      }
    });

    await Promise.all(updatePromises);

    // Fetch updated assets
    const updatedResult = await pool.query(
      "SELECT * FROM assets WHERE type = 'equity'"
    );

    const equities = updatedResult.rows.map(rowToAsset);

    logger.info('Equity prices refreshed', { count: equities.length });

    res.json({
      success: true,
      data: equities,
    });
  } catch (error: any) {
    logger.error('Error refreshing equity prices', {}, error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to refresh equity prices',
    });
  }
}

/**
 * GET /api/equities/search?q=query
 * Search for stock symbols
 */
export async function searchStockSymbols(req: Request, res: Response): Promise<void> {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required',
      });
      return;
    }

    const { searchStocks } = await import('../services/yahooFinanceService.js');
    const results = await searchStocks(q);

    logger.info('Stock search completed', { query: q, count: results.length });

    res.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    logger.error('Error searching stocks', { query: req.query.q }, error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to search stocks',
    });
  }
}
