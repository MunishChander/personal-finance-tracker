/**
 * API Client for Personal Finance Tracker
 * Handles all HTTP requests to the backend API
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  Asset,
  AssetInput,
  DashboardStats,
  ApiResponse,
} from '@personal-finance-tracker/shared';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Axios instance configured with base URL from environment variable
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 30000, // 30 second timeout for requests
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Response interceptor for error handling
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.code === 'ECONNABORTED') {
      // Request timeout
      throw new ApiError(
        'Request timeout: The server took too long to respond',
        408,
        error
      );
    } else if (error.response) {
      // Server responded with error status
      const data = error.response.data as ApiResponse<unknown>;
      throw new ApiError(
        data.error || 'An error occurred',
        error.response.status,
        error
      );
    } else if (error.request) {
      // Request made but no response received (network error or server down)
      throw new ApiError(
        'Database unavailable: Unable to reach the server. Please check your connection and try again.',
        503,
        error
      );
    } else {
      // Error setting up the request
      throw new ApiError(error.message, undefined, error);
    }
  }
);

/**
 * Transform date strings to Date objects in asset data
 */
function transformAssetDates(asset: any): Asset {
  return {
    ...asset,
    createdAt: new Date(asset.createdAt),
    updatedAt: new Date(asset.updatedAt),
    ...(asset.type === 'fixed-deposit' && {
      startDate: new Date(asset.startDate),
      maturityDate: new Date(asset.maturityDate),
    }),
  };
}

/**
 * GET /api/assets
 * Fetch all assets
 */
export async function getAssets(): Promise<Asset[]> {
  try {
    const response = await apiClient.get<ApiResponse<Asset[]>>('/assets');
    
    if (!response.data.success || !response.data.data) {
      throw new ApiError('Failed to fetch assets');
    }

    // Transform date strings to Date objects
    return response.data.data.map(transformAssetDates);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to fetch assets', undefined, error);
  }
}

/**
 * POST /api/assets
 * Create a new asset
 */
export async function createAsset(assetInput: AssetInput): Promise<Asset> {
  try {
    const response = await apiClient.post<ApiResponse<Asset>>(
      '/assets',
      assetInput
    );

    if (!response.data.success || !response.data.data) {
      throw new ApiError('Failed to create asset');
    }

    return transformAssetDates(response.data.data);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to create asset', undefined, error);
  }
}

/**
 * PUT /api/assets/:id
 * Update an existing asset
 */
export async function updateAsset(
  id: string,
  assetInput: AssetInput
): Promise<Asset> {
  try {
    const response = await apiClient.put<ApiResponse<Asset>>(
      `/assets/${id}`,
      assetInput
    );

    if (!response.data.success || !response.data.data) {
      throw new ApiError('Failed to update asset');
    }

    return transformAssetDates(response.data.data);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to update asset', undefined, error);
  }
}

/**
 * DELETE /api/assets/:id
 * Delete an asset
 */
export async function deleteAsset(id: string): Promise<void> {
  try {
    const response = await apiClient.delete<ApiResponse<{ id: string }>>(
      `/assets/${id}`
    );

    if (!response.data.success) {
      throw new ApiError('Failed to delete asset');
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to delete asset', undefined, error);
  }
}

/**
 * GET /api/assets/stats
 * Fetch dashboard statistics
 */
export async function getStats(): Promise<DashboardStats> {
  try {
    const response = await apiClient.get<ApiResponse<DashboardStats>>(
      '/assets/stats'
    );

    if (!response.data.success || !response.data.data) {
      throw new ApiError('Failed to fetch statistics');
    }

    return response.data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to fetch statistics', undefined, error);
  }
}

/**
 * GET /api/assets/equities/prices
 * Refresh live prices for all equity holdings
 */
export async function refreshEquityPrices(): Promise<Asset[]> {
  try {
    const response = await apiClient.get<ApiResponse<Asset[]>>(
      '/assets/equities/prices'
    );

    if (!response.data.success || !response.data.data) {
      throw new ApiError('Failed to refresh equity prices');
    }

    return response.data.data.map(transformAssetDates);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to refresh equity prices', undefined, error);
  }
}

/**
 * GET /api/assets/equities/search?q=query
 * Search for stock symbols
 */
export async function searchStocks(query: string): Promise<any[]> {
  try {
    const response = await apiClient.get<ApiResponse<any[]>>(
      `/assets/equities/search?q=${encodeURIComponent(query)}`
    );

    if (!response.data.success || !response.data.data) {
      throw new ApiError('Failed to search stocks');
    }

    return response.data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to search stocks', undefined, error);
  }
}

/**
 * Export the configured axios instance for advanced usage
 */
export { apiClient };

/**
 * GET /api/assets/mutualfunds/nav
 * Refresh live NAVs for all mutual fund holdings
 */
export async function refreshMutualFundNavs(): Promise<Asset[]> {
  try {
    const response = await apiClient.get<ApiResponse<Asset[]>>(
      '/assets/mutualfunds/nav'
    );

    if (!response.data.success || !response.data.data) {
      throw new ApiError('Failed to refresh mutual fund NAVs');
    }

    return response.data.data.map(transformAssetDates);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to refresh mutual fund NAVs', undefined, error);
  }
}

/**
 * GET /api/assets/mutualfunds/search?q=query
 * Search for mutual fund schemes
 */
export async function searchMutualFunds(query: string): Promise<any[]> {
  try {
    const response = await apiClient.get<ApiResponse<any[]>>(
      `/assets/mutualfunds/search?q=${encodeURIComponent(query)}`
    );

    if (!response.data.success || !response.data.data) {
      throw new ApiError('Failed to search mutual funds');
    }

    return response.data.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Failed to search mutual funds', undefined, error);
  }
}
