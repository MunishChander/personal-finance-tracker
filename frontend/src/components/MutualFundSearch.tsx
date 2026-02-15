import { useState, useEffect, useRef } from 'react';
import './MutualFundSearch.css';

interface MFSearchResult {
  schemeCode: string;
  schemeName: string;
}

interface MutualFundSearchProps {
  onSelect: (schemeCode: string, schemeName: string) => void;
  disabled?: boolean;
}

export default function MutualFundSearch({ onSelect, disabled }: MutualFundSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MFSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSelected, setIsSelected] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length < 2 || isSelected) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:3000/api/assets/mutualfunds/search?q=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        
        if (data.success) {
          setResults(data.data || []);
          setShowDropdown(true);
        }
      } catch (error) {
        console.error('Error searching mutual funds:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, isSelected]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result: MFSearchResult) => {
    setQuery(result.schemeName);
    setIsSelected(true);
    setShowDropdown(false);
    onSelect(result.schemeCode, result.schemeName);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsSelected(false);
    setSelectedIndex(-1);
  };

  return (
    <div className="mf-search-container" ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Search mutual funds (e.g., SBI Bluechip, HDFC Top 100)"
        disabled={disabled || isSelected}
        className="mf-search-input"
      />
      
      {isLoading && <div className="mf-search-loading">Searching...</div>}
      
      {showDropdown && results.length > 0 && (
        <div className="mf-search-dropdown">
          {results.map((result, index) => (
            <div
              key={result.schemeCode}
              className={`mf-search-result ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSelect(result)}
            >
              <div className="mf-result-name">{result.schemeName}</div>
              <div className="mf-result-code">Code: {result.schemeCode}</div>
            </div>
          ))}
        </div>
      )}
      
      {showDropdown && !isLoading && results.length === 0 && query.length >= 2 && (
        <div className="mf-search-dropdown">
          <div className="mf-search-no-results">No mutual funds found</div>
        </div>
      )}
    </div>
  );
}
