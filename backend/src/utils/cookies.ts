/**
 * Cookie Manager utility for secure authentication cookie handling
 * Provides functions to set, clear, and configure HTTP-only cookies for OAuth tokens
 */

import { Response, CookieOptions } from 'express';

/**
 * Cookie names for authentication tokens
 */
export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'sb_access_token',
  REFRESH_TOKEN: 'sb_refresh_token',
} as const;

/**
 * Get cookie configuration options based on environment
 * 
 * @param maxAge - Maximum age of the cookie in milliseconds
 * @returns Cookie options with security settings
 */
export function getCookieOptions(maxAge: number): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true,           // Prevent JavaScript access
    secure: isProduction,     // HTTPS only in production
    sameSite: 'lax',          // CSRF protection
    maxAge,                   // Expiration time in milliseconds
    path: '/',                // Available for all routes
  };
}

/**
 * Set authentication cookies with secure configuration
 * 
 * @param res - Express response object
 * @param accessToken - Access token from Supabase
 * @param refreshToken - Refresh token from Supabase
 * @param expiresIn - Token expiration time in seconds
 */
export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
  expiresIn: number
): void {
  // Convert expiresIn from seconds to milliseconds
  const accessTokenMaxAge = expiresIn * 1000;
  
  // Refresh token typically has longer expiration (e.g., 30 days)
  // Using a conservative 7 days for refresh token
  const refreshTokenMaxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  
  // Set access token cookie
  res.cookie(
    COOKIE_NAMES.ACCESS_TOKEN,
    accessToken,
    getCookieOptions(accessTokenMaxAge)
  );
  
  // Set refresh token cookie with longer expiration
  res.cookie(
    COOKIE_NAMES.REFRESH_TOKEN,
    refreshToken,
    getCookieOptions(refreshTokenMaxAge)
  );
}

/**
 * Clear authentication cookies by setting them to empty values with past expiration
 * 
 * @param res - Express response object
 */
export function clearAuthCookies(res: Response): void {
  // Clear access token cookie
  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  
  // Clear refresh token cookie
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}
