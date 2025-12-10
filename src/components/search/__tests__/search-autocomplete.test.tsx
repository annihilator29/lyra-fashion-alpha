import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

// Mock next/image
jest.mock('next/image', () => ({
    __esModule: true,
    default: function MockImage({ src, alt, ...props }: { src: string; alt: string }) {
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={src} alt={alt} {...props} />;
    },
}));

// Mock UI components
jest.mock('@/components/ui/input', () => ({
    Input: React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
        function MockInput(props, ref) {
            return <input ref={ref} {...props} />;
        }
    ),
}));

jest.mock('@/components/ui/button', () => ({
    Button: function MockButton({ children, onClick, ...props }: { children: React.ReactNode; onClick?: () => void }) {
        return <button onClick={onClick} {...props}>{children}</button>;
    },
}));

// Must import after mocks are set up
import { SearchAutocomplete } from '../search-autocomplete';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; },
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('SearchAutocomplete', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.clear();
        mockFetch.mockResolvedValue({
            json: () => Promise.resolve({ suggestions: [] }),
        });
    });

    it('renders search input', () => {
        render(<SearchAutocomplete />);
        expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
        render(<SearchAutocomplete placeholder="Find products" />);
        expect(screen.getByPlaceholderText('Find products')).toBeInTheDocument();
    });

    it('does not fetch suggestions for queries under 2 characters', async () => {
        render(<SearchAutocomplete />);
        const input = screen.getByPlaceholderText('Search products...');

        await userEvent.type(input, 'a');

        // Wait to ensure debounce passes
        await new Promise(resolve => setTimeout(resolve, 400));

        expect(mockFetch).not.toHaveBeenCalled();
    });

    it('fetches suggestions after 2+ character input', async () => {
        const mockSuggestions = [
            { id: '1', name: 'Dress One', slug: 'dress-one', price: 99, image: null, category: 'dresses' },
        ];
        mockFetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ suggestions: mockSuggestions }),
        });

        render(<SearchAutocomplete />);
        const input = screen.getByPlaceholderText('Search products...');

        await userEvent.type(input, 'dress');

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith('/api/search?q=dress');
        }, { timeout: 1000 });
    });

    it('displays suggestions when fetched', async () => {
        const mockSuggestions = [
            { id: '1', name: 'Summer Dress', slug: 'summer-dress', price: 99.99, image: null, category: 'dresses' },
        ];
        mockFetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ suggestions: mockSuggestions }),
        });

        render(<SearchAutocomplete />);
        const input = screen.getByPlaceholderText('Search products...');

        await userEvent.type(input, 'summer');

        await waitFor(() => {
            expect(screen.getByText('Summer Dress')).toBeInTheDocument();
            expect(screen.getByText('$99.99')).toBeInTheDocument();
        }, { timeout: 1000 });
    });

    it('shows empty state when no results found', async () => {
        mockFetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ suggestions: [] }),
        });

        render(<SearchAutocomplete />);
        const input = screen.getByPlaceholderText('Search products...');

        await userEvent.type(input, 'xyznonexistent');

        await waitFor(() => {
            expect(screen.getByText(/No products found/)).toBeInTheDocument();
        }, { timeout: 1000 });
    });

    it('closes dropdown on Escape key', async () => {
        const mockSuggestions = [
            { id: '1', name: 'Test Product', slug: 'test', price: 50, image: null, category: 'tops' },
        ];
        mockFetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ suggestions: mockSuggestions }),
        });

        render(<SearchAutocomplete />);
        const input = screen.getByPlaceholderText('Search products...');

        await userEvent.type(input, 'test');

        await waitFor(() => {
            expect(screen.getByText('Test Product')).toBeInTheDocument();
        });

        fireEvent.keyDown(input, { key: 'Escape' });

        await waitFor(() => {
            expect(screen.queryByText('Test Product')).not.toBeInTheDocument();
        });
    });

    it('saves and displays recent searches', async () => {
        // Set up recent searches in localStorage
        localStorageMock.setItem('lyra-recent-searches', JSON.stringify(['previous search']));

        render(<SearchAutocomplete />);
        const input = screen.getByPlaceholderText('Search products...');

        // Focus input to show recent searches
        fireEvent.focus(input);

        await waitFor(() => {
            expect(screen.getByText('Recent Searches')).toBeInTheDocument();
            expect(screen.getByText('previous search')).toBeInTheDocument();
        });
    });

    it('has correct aria attributes on input', () => {
        render(<SearchAutocomplete />);
        const input = screen.getByPlaceholderText('Search products...');

        expect(input).toHaveAttribute('role', 'combobox');
        expect(input).toHaveAttribute('aria-autocomplete', 'list');
    });
});
