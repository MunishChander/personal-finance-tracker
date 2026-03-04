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
  MutualFund,
  ProvidentFund,
  DashboardStats,
} from '@personal-finance-tracker/shared';
import { getStockQuote, getMultipleStockQuotes } from '../services/yahooFinanceService.js';
import { getMFQuote, getMultipleMFQuotes } from '../services/mfApiService.js';
import { getMarketIndices as getMarketIndicesService } from '../services/yahooFinanceService.js';

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
  } else if (row.type === 'equity') {
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
  } else if (row.type === 'mutual-fund') {
    // Mutual Fund
    const units = parseFloat(row.units);
    const averageNav = parseFloat(row.average_nav);
    const totalInvestment = units * averageNav;
    const currentNav = row.current_nav ? parseFloat(row.current_nav) : undefined;
    const currentValue = currentNav ? units * currentNav : undefined;
    const gainLoss = currentValue ? currentValue - totalInvestment : undefined;
    const gainLossPercentage = gainLoss ? (gainLoss / totalInvestment) * 100 : undefined;

    return {
      ...base,
      type: 'mutual-fund',
      schemeCode: row.scheme_code,
      schemeName: row.scheme_name,
      fundHouse: row.fund_house,
      units,
      averageNav,
      currentNav,
      totalInvestment,
      currentValue,
      gainLoss,
      gainLossPercentage,
    } as MutualFund;
  } else {
    // Provident Fund
    const currentBalance = parseFloat(row.current_balance);
    const monthlyContributionEmployee = parseFloat(row.monthly_contribution_employee);
    const monthlyContributionEmployer = parseFloat(row.monthly_contribution_employer);
    const interestRate = parseFloat(row.interest_rate);
    const lastUpdatedDate = new Date(row.last_updated_date);
    
    // Calculate projected balance (simple projection for 1 year)
    const monthlyContribution = monthlyContributionEmployee + monthlyContributionEmployer;
    const annualContribution = monthlyContribution * 12;
    const annualInterest = currentBalance * (interestRate / 100);
    const projectedBalance = currentBalance + annualContribution + annualInterest;
    const projectedAnnualGrowth = annualContribution + annualInterest;

    return {
      ...base,
      type: 'provident-fund',
      uan: row.uan,
      currentBalance,
      monthlyContributionEmployee,
      monthlyContributionEmployer,
      interestRate,
      lastUpdatedDate,
      projectedBalance,
      projectedAnnualGrowth,
    } as ProvidentFund;
  }
}

/**
 * POST /api/assets
 * Create a new asset
 */
export async function createAsset(req: Request, res: Response): Promise<void> {
  try {
    const assetInput: AssetInput = req.body;
    
    logger.info('Creating asset - received data', { 
      type: assetInput.type, 
      typeOf: typeof assetInput.type,
      body: JSON.stringify(req.body, null, 2)
    });

    // Validate based on asset type
    let validationResult;
    if (assetInput.type === 'fixed-deposit') {
      validationResult = validateFixedDeposit(assetInput);
    } else if (assetInput.type === 'savings-account') {
      validationResult = validateSavingsAccount(assetInput);
    } else if (assetInput.type === 'equity') {
      // Basic equity validation
      const equity = assetInput as Partial<Equity>;
      validationResult = {
        isValid: !!(equity.symbol && equity.companyName && equity.exchange && equity.quantity && equity.averagePrice),
        errors: []
      };
    } else if (assetInput.type === 'mutual-fund') {
      // Basic mutual fund validation
      const mf = assetInput as Partial<MutualFund>;
      validationResult = {
        isValid: !!(mf.schemeCode && mf.schemeName && mf.fundHouse && mf.units && mf.averageNav),
        errors: []
      };
    } else if (assetInput.type === 'provident-fund') {
      // Basic provident fund validation
      const pf = assetInput as Partial<ProvidentFund>;
      const errors = [];
      
      logger.info('PF validation - checking fields', {
        hasUan: !!pf.uan,
        uan: pf.uan,
        hasCurrentBalance: pf.currentBalance !== undefined,
        currentBalance: pf.currentBalance,
        hasMonthlyEmployee: pf.monthlyContributionEmployee !== undefined,
        monthlyEmployee: pf.monthlyContributionEmployee,
        hasMonthlyEmployer: pf.monthlyContributionEmployer !== undefined,
        monthlyEmployer: pf.monthlyContributionEmployer,
        hasInterestRate: !!pf.interestRate,
        interestRate: pf.interestRate,
        hasBankName: !!pf.bankName,
        bankName: pf.bankName
      });
      
      if (!pf.uan) errors.push({ field: 'uan', message: 'UAN is required' });
      if (pf.currentBalance === undefined) errors.push({ field: 'currentBalance', message: 'Current balance is required' });
      if (pf.monthlyContributionEmployee === undefined) errors.push({ field: 'monthlyContributionEmployee', message: 'Employee contribution is required' });
      if (pf.monthlyContributionEmployer === undefined) errors.push({ field: 'monthlyContributionEmployer', message: 'Employer contribution is required' });
      if (!pf.interestRate) errors.push({ field: 'interestRate', message: 'Interest rate is required' });
      if (!pf.bankName) errors.push({ field: 'bankName', message: 'Employer name is required' });
      
      logger.info('PF validation result', { 
        errorsCount: errors.length,
        errors,
        isValid: errors.length === 0
      });
      
      validationResult = {
        isValid: errors.length === 0,
        errors
      };
    } else {
      validationResult = {
        isValid: false,
        errors: [{ field: 'type', message: 'Invalid asset type' }]
      };
    }

    if (!validationResult.isValid) {
      logger.warn('Asset validation failed', { 
        type: assetInput.type,
        body: req.body,
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
    } else if (assetInput.type === 'equity') {
      // Equity - Check for existing holding with same symbol and broker
      const equity = assetInput as Partial<Equity>;
      
      const existingEquity = await pool.query(
        `SELECT * FROM assets WHERE type = 'equity' AND symbol = $1 AND bank_name = $2`,
        [equity.symbol, equity.bankName]
      );
      
      if (existingEquity.rows.length > 0) {
        // Aggregate with existing holding
        const existing = existingEquity.rows[0];
        const existingQty = parseFloat(existing.quantity);
        const existingAvgPrice = parseFloat(existing.average_price);
        const newQty = equity.quantity!;
        const newAvgPrice = equity.averagePrice!;
        
        // Calculate new average price: (oldQty * oldAvg + newQty * newAvg) / (oldQty + newQty)
        const totalQty = existingQty + newQty;
        const weightedAvgPrice = ((existingQty * existingAvgPrice) + (newQty * newAvgPrice)) / totalQty;
        
        result = await pool.query(
          `UPDATE assets SET
            quantity = $1,
            average_price = $2,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
          RETURNING *`,
          [totalQty, weightedAvgPrice, existing.id]
        );
        
        logger.info('Equity holding aggregated', {
          symbol: equity.symbol,
          broker: equity.bankName,
          oldQty: existingQty,
          newQty,
          totalQty,
          oldAvgPrice: existingAvgPrice,
          newAvgPrice,
          weightedAvgPrice
        });
      } else {
        // Create new holding
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
    } else if (assetInput.type === 'mutual-fund') {
      // Mutual Fund - Check for existing holding with same scheme code and platform
      const mf = assetInput as Partial<MutualFund>;
      
      const existingMF = await pool.query(
        `SELECT * FROM assets WHERE type = 'mutual-fund' AND scheme_code = $1 AND bank_name = $2`,
        [mf.schemeCode, mf.bankName]
      );
      
      if (existingMF.rows.length > 0) {
        // Aggregate with existing holding
        const existing = existingMF.rows[0];
        const existingUnits = parseFloat(existing.units);
        const existingAvgNav = parseFloat(existing.average_nav);
        const newUnits = mf.units!;
        const newAvgNav = mf.averageNav!;
        
        // Calculate new average NAV: (oldUnits * oldAvg + newUnits * newAvg) / (oldUnits + newUnits)
        const totalUnits = existingUnits + newUnits;
        const weightedAvgNav = ((existingUnits * existingAvgNav) + (newUnits * newAvgNav)) / totalUnits;
        
        result = await pool.query(
          `UPDATE assets SET
            units = $1,
            average_nav = $2,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
          RETURNING *`,
          [totalUnits, weightedAvgNav, existing.id]
        );
        
        logger.info('Mutual fund holding aggregated', {
          schemeCode: mf.schemeCode,
          platform: mf.bankName,
          oldUnits: existingUnits,
          newUnits,
          totalUnits,
          oldAvgNav: existingAvgNav,
          newAvgNav,
          weightedAvgNav
        });
      } else {
        // Create new holding
        result = await pool.query(
          `INSERT INTO assets (
            type, bank_name, scheme_code, scheme_name, fund_house, units, average_nav
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *`,
          [
            'mutual-fund',
            mf.bankName, // Platform name
            mf.schemeCode,
            mf.schemeName,
            mf.fundHouse,
            mf.units,
            mf.averageNav,
          ]
        );
      }
    } else if (assetInput.type === 'provident-fund') {
      // Provident Fund
      const pf = assetInput as Partial<ProvidentFund>;
      result = await pool.query(
        `INSERT INTO assets (
          type, bank_name, uan, current_balance, 
          monthly_contribution_employee, monthly_contribution_employer,
          interest_rate, last_updated_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          'provident-fund',
          pf.bankName, // Employer name
          pf.uan,
          pf.currentBalance,
          pf.monthlyContributionEmployee,
          pf.monthlyContributionEmployer,
          pf.interestRate || 8.25, // Default to current EPF rate
          pf.lastUpdatedDate || new Date()
        ]
      );
      
      logger.info('Provident Fund created', {
        uan: pf.uan,
        employer: pf.bankName,
        balance: pf.currentBalance
      });
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
    } else if (assetInput.type === 'equity') {
      // Basic equity validation
      const equity = assetInput as Partial<Equity>;
      validationResult = {
        isValid: !!(equity.symbol && equity.companyName && equity.exchange && equity.quantity && equity.averagePrice),
        errors: []
      };
    } else if (assetInput.type === 'mutual-fund') {
      // Basic mutual fund validation
      const mf = assetInput as Partial<MutualFund>;
      validationResult = {
        isValid: !!(mf.schemeCode && mf.schemeName && mf.fundHouse && mf.units && mf.averageNav),
        errors: []
      };
    } else if (assetInput.type === 'provident-fund') {
      // Basic provident fund validation
      const pf = assetInput as Partial<ProvidentFund>;
      const errors = [];
      
      if (!pf.uan) errors.push({ field: 'uan', message: 'UAN is required' });
      if (pf.currentBalance === undefined) errors.push({ field: 'currentBalance', message: 'Current balance is required' });
      if (pf.monthlyContributionEmployee === undefined) errors.push({ field: 'monthlyContributionEmployee', message: 'Employee contribution is required' });
      if (pf.monthlyContributionEmployer === undefined) errors.push({ field: 'monthlyContributionEmployer', message: 'Employer contribution is required' });
      if (!pf.interestRate) errors.push({ field: 'interestRate', message: 'Interest rate is required' });
      if (!pf.bankName) errors.push({ field: 'bankName', message: 'Employer name is required' });
      
      validationResult = {
        isValid: errors.length === 0,
        errors
      };
    } else {
      validationResult = {
        isValid: false,
        errors: [{ field: 'type', message: 'Invalid asset type' }]
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
    } else if (assetInput.type === 'equity') {
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
    } else if (assetInput.type === 'mutual-fund') {
      // Mutual Fund
      const mf = assetInput as Partial<MutualFund>;
      result = await pool.query(
        `UPDATE assets SET
          type = $1, bank_name = $2, scheme_code = $3,
          scheme_name = $4, fund_house = $5, units = $6,
          average_nav = $7,
          account_number = NULL, principal_amount = NULL, interest_rate = NULL,
          start_date = NULL, maturity_date = NULL, current_balance = NULL,
          symbol = NULL, company_name = NULL, exchange = NULL, quantity = NULL, average_price = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING *`,
        [
          'mutual-fund',
          mf.bankName, // Platform name
          mf.schemeCode,
          mf.schemeName,
          mf.fundHouse,
          mf.units,
          mf.averageNav,
          id,
        ]
      );
    } else {
      // Provident Fund
      const pf = assetInput as Partial<ProvidentFund>;
      result = await pool.query(
        `UPDATE assets SET
          type = $1, bank_name = $2, uan = $3,
          current_balance = $4, monthly_contribution_employee = $5,
          monthly_contribution_employer = $6, interest_rate = $7,
          last_updated_date = $8,
          account_number = NULL, principal_amount = NULL,
          start_date = NULL, maturity_date = NULL,
          symbol = NULL, company_name = NULL, exchange = NULL, 
          quantity = NULL, average_price = NULL,
          scheme_code = NULL, scheme_name = NULL, fund_house = NULL,
          units = NULL, average_nav = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
        RETURNING *`,
        [
          'provident-fund',
          pf.bankName, // Employer name
          pf.uan,
          pf.currentBalance,
          pf.monthlyContributionEmployee,
          pf.monthlyContributionEmployer,
          pf.interestRate,
          pf.lastUpdatedDate || new Date(),
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
    let totalEquitiesInvestment = 0;
    let totalEquitiesValue = 0;
    let totalMutualFundsInvestment = 0;
    let totalMutualFundsValue = 0;
    let totalProvidentFunds = 0;
    let fixedDepositCount = 0;
    let savingsAccountCount = 0;
    let equityCount = 0;
    let mutualFundCount = 0;
    let providentFundCount = 0;
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
      } else if (asset.type === 'savings-account') {
        const sa = asset as SavingsAccount;
        totalSavingsAccounts += sa.currentBalance;
        savingsAccountCount++;
      } else if (asset.type === 'equity') {
        const equity = asset as Equity;
        totalEquitiesInvestment += equity.totalInvestment;
        totalEquitiesValue += equity.currentValue || equity.totalInvestment;
        equityCount++;
      } else if (asset.type === 'mutual-fund') {
        const mf = asset as MutualFund;
        totalMutualFundsInvestment += mf.totalInvestment;
        totalMutualFundsValue += mf.currentValue || mf.totalInvestment;
        mutualFundCount++;
      } else if (asset.type === 'provident-fund') {
        const pf = asset as ProvidentFund;
        totalProvidentFunds += pf.currentBalance;
        providentFundCount++;
      }
    });

    const totalPortfolioValue = 
      totalFixedDepositsCurrent + 
      totalSavingsAccounts + 
      totalEquitiesValue + 
      totalMutualFundsValue +
      totalProvidentFunds;

    const stats: DashboardStats = {
      totalPortfolioValue,
      totalFixedDepositsCurrent,
      totalFixedDepositsMaturity,
      totalSavingsAccounts,
      totalEquitiesInvestment,
      totalEquitiesValue,
      totalMutualFundsInvestment,
      totalMutualFundsValue,
      totalProvidentFunds,
      fixedDepositCount,
      savingsAccountCount,
      equityCount,
      mutualFundCount,
      providentFundCount,
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

/**
 * GET /api/mutualfunds/nav
 * Fetch live NAVs for all mutual funds
 */
export async function refreshMutualFundNavs(req: Request, res: Response): Promise<void> {
  try {
    // Get all mutual funds from database
    const result = await pool.query(
      "SELECT * FROM assets WHERE type = 'mutual-fund'"
    );

    if (result.rows.length === 0) {
      res.json({
        success: true,
        data: [],
      });
      return;
    }

    // Extract scheme codes
    const schemeCodes = result.rows.map(row => row.scheme_code);

    // Fetch live NAVs
    const quotes = await getMultipleMFQuotes(schemeCodes);

    // Update database with current NAVs
    const updatePromises = result.rows.map(async (row) => {
      const quote = quotes.get(row.scheme_code);
      if (quote) {
        await pool.query(
          'UPDATE assets SET current_nav = $1 WHERE id = $2',
          [quote.nav, row.id]
        );
      }
    });

    await Promise.all(updatePromises);

    // Fetch updated assets
    const updatedResult = await pool.query(
      "SELECT * FROM assets WHERE type = 'mutual-fund'"
    );

    const mutualFunds = updatedResult.rows.map(rowToAsset);

    logger.info('Mutual fund NAVs refreshed', { count: mutualFunds.length });

    res.json({
      success: true,
      data: mutualFunds,
    });
  } catch (error: any) {
    logger.error('Error refreshing mutual fund NAVs', {}, error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to refresh mutual fund NAVs',
    });
  }
}

/**
 * GET /api/mutualfunds/search?q=query
 * Search for mutual fund schemes
 */
export async function searchMutualFundSchemes(req: Request, res: Response): Promise<void> {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required',
      });
      return;
    }

    const { searchMutualFunds } = await import('../services/mfApiService.js');
    const results = await searchMutualFunds(q);

    logger.info('Mutual fund search completed', { query: q, count: results.length });

    res.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    logger.error('Error searching mutual funds', { query: req.query.q }, error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to search mutual funds',
    });
  }
}

/**
 * GET /api/mutualfunds/:schemeCode/nav
 * Get current NAV for a specific mutual fund scheme
 */
export async function getMutualFundNav(req: Request, res: Response): Promise<void> {
  try {
    const { schemeCode } = req.params;

    if (!schemeCode) {
      res.status(400).json({
        success: false,
        error: 'Scheme code is required',
      });
      return;
    }

    logger.info('Fetching NAV for scheme', { schemeCode });

    const navData = await getMFQuote(schemeCode);

    if (!navData) {
      res.status(404).json({
        success: false,
        error: 'Mutual fund not found or NAV unavailable',
      });
      return;
    }

    logger.info('NAV fetched successfully', { schemeCode, nav: navData.nav });

    res.json({
      success: true,
      data: navData,
    });
  } catch (error: any) {
    logger.error('Error fetching mutual fund NAV', { schemeCode: req.params.schemeCode }, error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mutual fund NAV',
    });
  }
}

/**
 * GET /api/equities/:symbol/price
 * Get current price for a specific stock symbol
 */
export async function getStockPrice(req: Request, res: Response): Promise<void> {
  try {
    const { symbol } = req.params;

    if (!symbol) {
      res.status(400).json({
        success: false,
        error: 'Stock symbol is required',
      });
      return;
    }

    logger.info('Fetching price for symbol', { symbol });

    const priceData = await getStockQuote(symbol);

    if (!priceData) {
      res.status(404).json({
        success: false,
        error: 'Stock not found or price unavailable',
      });
      return;
    }

    logger.info('Price fetched successfully', { symbol, price: priceData.price });

    res.json({
      success: true,
      data: priceData,
    });
  } catch (error: any) {
    logger.error('Error fetching stock price', { symbol: req.params.symbol }, error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stock price',
    });
  }
}

/**
 * GET /api/assets/market-indices
 * Get market indices (Nifty 50, Sensex)
 */
export async function getMarketIndices(req: Request, res: Response): Promise<void> {
  try {
    logger.info('Fetching market indices');

    const indices = await getMarketIndicesService();
    
    const result = Array.from(indices.values());

    logger.info('Market indices fetched successfully', { count: result.length });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('Error fetching market indices', {}, error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market indices',
    });
  }
}
