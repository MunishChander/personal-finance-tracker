/**
 * Unit tests for Cookie Manager utility
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Response } from 'express';
import { setAuthCookies, clearAuthCookies, getCookieOptions, COOKIE_NAMES } from './cookies';

describe('Cookie Manager', () => {
  let mockResponse: Partial<Response>;
  let cookieSpy: ReturnType<typeof vi.fn>;
  let clearCookieSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    cookieSpy = vi.fn();
    clearCookieSpy = vi.fn();
    
    mockResponse = {
      cookie: cookieSpy,
      clearCookie: clearCookieSpy,
    };
  });

  describe('getCookieOptions', () => {
    it('should return secure cookie options in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const options = getCookieOptions(3600000);
      
      expect(options.httpOnly).toBe(true);
      expect(options.secure).toBe(true);
      expect(options.sameSite).toBe('lax');
      expect(options.maxAge).toBe(3600000);
      expect(options.path).toBe('/');
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should return non-secure cookie options in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const options = getCookieOptions(3600000);
      
      expect(options.httpOnly).toBe(true);
      expect(options.secure).toBe(false);
      expect(options.sameSite).toBe('lax');
      expect(options.maxAge).toBe(3600000);
      expect(options.path).toBe('/');
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should use provided maxAge value', () => {
      const maxAge = 7200000; // 2 hours
      const options = getCookieOptions(maxAge);
      
      expect(options.maxAge).toBe(maxAge);
    });
  });

  describe('setAuthCookies', () => {
    it('should set both access and refresh token cookies', () => {
      const accessToken = 'test-access-token';
      const refreshToken = 'test-refresh-token';
      const expiresIn = 3600; // 1 hour in seconds
      
      setAuthCookies(mockResponse as Response, accessToken, refreshToken, expiresIn);
      
      expect(cookieSpy).toHaveBeenCalledTimes(2);
      
      // Check access token cookie
      expect(cookieSpy).toHaveBeenCalledWith(
        COOKIE_NAMES.ACCESS_TOKEN,
        accessToken,
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 3600000, // 1 hour in milliseconds
        })
      );
      
      // Check refresh token cookie
      expect(cookieSpy).toHaveBeenCalledWith(
        COOKIE_NAMES.REFRESH_TOKEN,
        refreshToken,
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        })
      );
    });

    it('should convert expiresIn from seconds to milliseconds', () => {
      const expiresIn = 1800; // 30 minutes in seconds
      
      setAuthCookies(mockResponse as Response, 'token1', 'token2', expiresIn);
      
      const accessTokenCall = cookieSpy.mock.calls.find(
        call => call[0] === COOKIE_NAMES.ACCESS_TOKEN
      );
      
      expect(accessTokenCall[2].maxAge).toBe(1800000); // 30 minutes in milliseconds
    });

    it('should set httpOnly flag on all cookies', () => {
      setAuthCookies(mockResponse as Response, 'token1', 'token2', 3600);
      
      cookieSpy.mock.calls.forEach(call => {
        expect(call[2].httpOnly).toBe(true);
      });
    });

    it('should set secure flag based on environment', () => {
      const originalEnv = process.env.NODE_ENV;
      
      // Test production
      process.env.NODE_ENV = 'production';
      setAuthCookies(mockResponse as Response, 'token1', 'token2', 3600);
      
      cookieSpy.mock.calls.forEach(call => {
        expect(call[2].secure).toBe(true);
      });
      
      // Reset and test development
      cookieSpy.mockClear();
      process.env.NODE_ENV = 'development';
      setAuthCookies(mockResponse as Response, 'token1', 'token2', 3600);
      
      cookieSpy.mock.calls.forEach(call => {
        expect(call[2].secure).toBe(false);
      });
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('clearAuthCookies', () => {
    it('should clear both access and refresh token cookies', () => {
      clearAuthCookies(mockResponse as Response);
      
      expect(clearCookieSpy).toHaveBeenCalledTimes(2);
      
      // Check access token cookie cleared
      expect(clearCookieSpy).toHaveBeenCalledWith(
        COOKIE_NAMES.ACCESS_TOKEN,
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
        })
      );
      
      // Check refresh token cookie cleared
      expect(clearCookieSpy).toHaveBeenCalledWith(
        COOKIE_NAMES.REFRESH_TOKEN,
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
        })
      );
    });

    it('should use secure flag based on environment when clearing', () => {
      const originalEnv = process.env.NODE_ENV;
      
      // Test production
      process.env.NODE_ENV = 'production';
      clearAuthCookies(mockResponse as Response);
      
      clearCookieSpy.mock.calls.forEach(call => {
        expect(call[1].secure).toBe(true);
      });
      
      // Reset and test development
      clearCookieSpy.mockClear();
      process.env.NODE_ENV = 'development';
      clearAuthCookies(mockResponse as Response);
      
      clearCookieSpy.mock.calls.forEach(call => {
        expect(call[1].secure).toBe(false);
      });
      
      process.env.NODE_ENV = originalEnv;
    });
  });
});
