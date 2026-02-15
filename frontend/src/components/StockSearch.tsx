import React, { useState, useEffect, useRef } from 'react';
import { searchStocks } from '../services/api';
import './StockSearch.css';

interface StockResult {
  symbol: string;
  shortname?: string;
  longname?: string;
  exchDisp?: string;
  typeDisp?: string;
}

interface StockSearchProps {
  onSelect: (stock: { symbol: string; companyName: string; exchange: 'NSE' | 'BSE' }) => void;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const StockSearch: React.FC<StockSearchProps> = ({
  onSelect,
  value,
  onChange,
  placeholder = 'Search for stocks (e.g., Reliance, TCS, HDFC)',
  disabled = false,
}) => {
  const [results, setResults] = useState<StockResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchTimeoutRef = useRef<number>();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    if (value.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout
    searchTimeoutRef.current = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const searchResults = await searchStocks(value);
        // Filter for Indian stocks (NSE/BSE)
        const indianStocks = searchResults.filter(
          (stock: StockResult) =>
            stock.exchDisp === 'NSE' ||
            stock.exchDisp === 'BSE' ||
            stock.symbol?.endsWith('.NS') ||
            stock.symbol?.endsWith('.BO')
        );
        setResults(indianStocks.slice(0, 10)); // Limit to 10 results
        setShowDropdown(indianStocks.length > 0);
      } catch (error) {
        console.error('Stock search error:', error);
        setResults([]);
        setShowDropdown(false);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (stock: StockResult) => {
    const companyName = stock.longname || stock.shortname || stock.symbol;
    const exchange = stock.exchDisp === 'BSE' || stock.symbol?.endsWith('.BO') ? 'BSE' : 'NSE';
    
    onSelect({
      symbol: stock.symbol,
      companyName,
      exchange,
    });

    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="stock-search-container">
      <div className="stock-search-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="form-input stock-search-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setShowDropdown(true);
          }}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
        />
        {isSearching && (
          <div className="stock-search-spinner">
            <div className="spinner-small"></div>
          </div>
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <div ref={dropdownRef} className="stock-search-dropdown">
          {results.map((stock, index) => (
            <div
              key={stock.symbol}
              className={`stock-search-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSelect(stock)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="stock-item-main">
                <span className="stock-item-name">
                  {stock.longname || stock.shortname || stock.symbol}
                </span>
                <span className="stock-item-symbol">{stock.symbol}</span>
              </div>
              <div className="stock-item-meta">
                <span className="stock-item-exchange">{stock.exchDisp || 'NSE'}</span>
                {stock.typeDisp && (
                  <span className="stock-item-type">{stock.typeDisp}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showDropdown && results.length === 0 && !isSearching && value.length >= 2 && (
        <div ref={dropdownRef} className="stock-search-dropdown">
          <div className="stock-search-empty">
            No stocks found. Try searching with company name or symbol.
          </div>
        </div>
      )}
    </div>
  );
};

export default StockSearch;
