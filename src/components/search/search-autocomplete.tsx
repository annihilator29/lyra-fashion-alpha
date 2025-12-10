'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SearchSuggestion } from '@/types/product';

// localStorage key for recent searches
const RECENT_SEARCHES_KEY = 'lyra-recent-searches';
const MAX_RECENT_SEARCHES = 5;

interface SearchAutocompleteProps {
    className?: string;
    placeholder?: string;
    onSelect?: (suggestion: SearchSuggestion) => void;
    onClose?: () => void;
}

/**
 * SearchAutocomplete Component
 *
 * Search input with autocomplete suggestions, keyboard navigation,
 * and recent searches support.
 *
 * Features:
 * - Debounced search (300ms)
 * - ARIA combobox pattern for accessibility
 * - Keyboard navigation (arrows, Enter, Escape)
 * - Recent searches in localStorage
 * - Loading and empty states
 */
export function SearchAutocomplete({
    className,
    placeholder = 'Search products...',
    onSelect,
    onClose,
}: SearchAutocompleteProps) {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // State
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [showRecent, setShowRecent] = useState(false);

    // Debounced query for API calls
    const debouncedQuery = useDebounce(query, 300);

    // Load recent searches from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
            if (stored) {
                setRecentSearches(JSON.parse(stored));
            }
        } catch {
            // Ignore localStorage errors
        }
    }, []);

    // Fetch suggestions when debounced query changes
    useEffect(() => {
        if (debouncedQuery.length < 2) {
            setSuggestions([]);
            setIsLoading(false);
            return;
        }

        const fetchSuggestions = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(
                    `/api/search?q=${encodeURIComponent(debouncedQuery)}`
                );
                const data = await response.json();
                setSuggestions(data.suggestions || []);
            } catch (error) {
                console.error('Failed to fetch suggestions:', error);
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSuggestions();
    }, [debouncedQuery]);

    // Save recent search to localStorage
    const saveRecentSearch = useCallback((searchQuery: string) => {
        if (!searchQuery.trim()) return;

        try {
            const recent = recentSearches.filter((s) => s !== searchQuery);
            recent.unshift(searchQuery);
            const updated = recent.slice(0, MAX_RECENT_SEARCHES);
            setRecentSearches(updated);
            localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
        } catch {
            // Ignore localStorage errors
        }
    }, [recentSearches]);

    // Clear a single recent search
    const clearRecentSearch = useCallback((searchQuery: string) => {
        try {
            const updated = recentSearches.filter((s) => s !== searchQuery);
            setRecentSearches(updated);
            localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
        } catch {
            // Ignore localStorage errors
        }
    }, [recentSearches]);

    // Clear all recent searches
    const clearAllRecentSearches = useCallback(() => {
        try {
            setRecentSearches([]);
            localStorage.removeItem(RECENT_SEARCHES_KEY);
        } catch {
            // Ignore localStorage errors
        }
    }, []);

    // Navigate to product page
    const navigateToProduct = useCallback(
        (suggestion: SearchSuggestion) => {
            saveRecentSearch(suggestion.name);
            onSelect?.(suggestion);
            setQuery('');
            setSuggestions([]);
            setIsOpen(false);
            onClose?.();
            router.push(`/products/${suggestion.category}/${suggestion.slug}`);
        },
        [router, saveRecentSearch, onSelect, onClose]
    );

    // Navigate to search results page
    const navigateToSearchResults = useCallback(
        (searchQuery: string) => {
            if (!searchQuery.trim()) return;
            saveRecentSearch(searchQuery);
            setQuery('');
            setSuggestions([]);
            setIsOpen(false);
            onClose?.();
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        },
        [router, saveRecentSearch, onClose]
    );

    // Handle recent search click
    const handleRecentSearchClick = useCallback(
        (searchQuery: string) => {
            setQuery(searchQuery);
            setShowRecent(false);
            inputRef.current?.focus();
        },
        []
    );

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            const itemCount =
                showRecent && query.length === 0
                    ? recentSearches.length
                    : suggestions.length;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setActiveIndex((prev) =>
                        prev < itemCount - 1 ? prev + 1 : prev
                    );
                    break;

                case 'ArrowUp':
                    e.preventDefault();
                    setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
                    break;

                case 'Enter':
                    e.preventDefault();
                    if (activeIndex >= 0) {
                        if (showRecent && query.length === 0) {
                            // Select recent search
                            handleRecentSearchClick(recentSearches[activeIndex]);
                        } else if (suggestions[activeIndex]) {
                            // Select suggestion
                            navigateToProduct(suggestions[activeIndex]);
                        }
                    } else if (query.trim()) {
                        // Submit search
                        navigateToSearchResults(query);
                    }
                    break;

                case 'Escape':
                    e.preventDefault();
                    setIsOpen(false);
                    setShowRecent(false);
                    inputRef.current?.blur();
                    onClose?.();
                    break;

                case 'Tab':
                    setIsOpen(false);
                    setShowRecent(false);
                    break;
            }
        },
        [
            activeIndex,
            query,
            suggestions,
            recentSearches,
            showRecent,
            navigateToProduct,
            navigateToSearchResults,
            handleRecentSearchClick,
            onClose,
        ]
    );

    // Handle input focus
    const handleFocus = () => {
        setIsOpen(true);
        if (query.length === 0 && recentSearches.length > 0) {
            setShowRecent(true);
        }
    };

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        setActiveIndex(-1);
        setIsOpen(true);
        setShowRecent(value.length === 0 && recentSearches.length > 0);
        if (value.length >= 2) {
            setIsLoading(true);
        }
    };

    // Clear input
    const handleClear = () => {
        setQuery('');
        setSuggestions([]);
        setActiveIndex(-1);
        inputRef.current?.focus();
    };

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (
                inputRef.current &&
                !inputRef.current.contains(target) &&
                listRef.current &&
                !listRef.current.contains(target)
            ) {
                setIsOpen(false);
                setShowRecent(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Scroll active item into view
    useEffect(() => {
        if (activeIndex >= 0 && listRef.current) {
            const activeItem = listRef.current.children[activeIndex] as HTMLElement;
            activeItem?.scrollIntoView({ block: 'nearest' });
        }
    }, [activeIndex]);

    const showDropdown =
        isOpen &&
        (isLoading ||
            suggestions.length > 0 ||
            (showRecent && recentSearches.length > 0) ||
            (query.length >= 2 && suggestions.length === 0 && !isLoading));

    return (
        <div className={cn('relative w-full', className)}>
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    ref={inputRef}
                    type="text"
                    role="combobox"
                    aria-expanded={showDropdown}
                    aria-controls="search-listbox"
                    aria-activedescendant={
                        activeIndex >= 0 ? `search-option-${activeIndex}` : undefined
                    }
                    aria-autocomplete="list"
                    placeholder={placeholder}
                    value={query}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                    className="pl-10 pr-10"
                />
                {(query || isLoading) && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 hover:bg-transparent"
                                onClick={handleClear}
                                aria-label="Clear search"
                            >
                                <X className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Dropdown */}
            {showDropdown && (
                <div className="absolute top-full z-50 mt-1 w-full rounded-lg border bg-popover shadow-lg">
                    <ul
                        ref={listRef}
                        id="search-listbox"
                        role="listbox"
                        className="max-h-[400px] overflow-y-auto p-2"
                    >
                        {/* Recent Searches */}
                        {showRecent && query.length === 0 && recentSearches.length > 0 && (
                            <>
                                <li className="mb-2 flex items-center justify-between px-2 text-xs font-medium text-muted-foreground">
                                    <span>Recent Searches</span>
                                    <button
                                        type="button"
                                        onClick={clearAllRecentSearches}
                                        className="text-xs hover:text-foreground"
                                    >
                                        Clear all
                                    </button>
                                </li>
                                {recentSearches.map((search, index) => (
                                    <li
                                        key={`recent-${index}`}
                                        id={`search-option-${index}`}
                                        role="option"
                                        aria-selected={activeIndex === index}
                                        className={cn(
                                            'flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm',
                                            activeIndex === index
                                                ? 'bg-accent text-accent-foreground'
                                                : 'hover:bg-accent/50'
                                        )}
                                        onClick={() => handleRecentSearchClick(search)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Search className="h-3 w-3 text-muted-foreground" />
                                            <span>{search}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                clearRecentSearch(search);
                                            }}
                                            className="text-muted-foreground hover:text-foreground"
                                            aria-label={`Remove ${search} from recent searches`}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </li>
                                ))}
                            </>
                        )}

                        {/* Loading State */}
                        {isLoading && query.length >= 2 && (
                            <li className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Searching...
                            </li>
                        )}

                        {/* Suggestions */}
                        {!isLoading &&
                            suggestions.map((suggestion, index) => (
                                <li
                                    key={suggestion.id}
                                    id={`search-option-${index}`}
                                    role="option"
                                    aria-selected={activeIndex === index}
                                    className={cn(
                                        'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2',
                                        activeIndex === index
                                            ? 'bg-accent text-accent-foreground'
                                            : 'hover:bg-accent/50'
                                    )}
                                    onClick={() => navigateToProduct(suggestion)}
                                >
                                    {/* Product Thumbnail */}
                                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-secondary">
                                        {suggestion.image ? (
                                            <Image
                                                src={suggestion.image}
                                                alt={suggestion.name}
                                                fill
                                                sizes="48px"
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                                <Search className="h-4 w-4" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 overflow-hidden">
                                        <p className="truncate font-medium">
                                            {suggestion.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            ${suggestion.price.toFixed(2)}
                                        </p>
                                    </div>
                                </li>
                            ))}

                        {/* Empty State */}
                        {!isLoading &&
                            query.length >= 2 &&
                            suggestions.length === 0 && (
                                <li className="py-6 text-center text-sm text-muted-foreground">
                                    No products found for &ldquo;{query}&rdquo;
                                </li>
                            )}
                    </ul>
                </div>
            )}
        </div>
    );
}
