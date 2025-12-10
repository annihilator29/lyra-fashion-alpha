import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../use-debounce';

describe('useDebounce', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('returns initial value immediately', () => {
        const { result } = renderHook(() => useDebounce('initial', 300));
        expect(result.current).toBe('initial');
    });

    it('does not update value before delay', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 300),
            { initialProps: { value: 'initial' } }
        );

        rerender({ value: 'updated' });

        // Value should still be initial before delay
        expect(result.current).toBe('initial');

        // Advance time but not enough
        act(() => {
            jest.advanceTimersByTime(100);
        });

        expect(result.current).toBe('initial');
    });

    it('updates value after delay', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 300),
            { initialProps: { value: 'initial' } }
        );

        rerender({ value: 'updated' });

        // Advance time past delay
        act(() => {
            jest.advanceTimersByTime(300);
        });

        expect(result.current).toBe('updated');
    });

    it('resets timer on rapid value changes', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 300),
            { initialProps: { value: 'a' } }
        );

        // Rapid changes
        rerender({ value: 'ab' });
        act(() => {
            jest.advanceTimersByTime(100);
        });

        rerender({ value: 'abc' });
        act(() => {
            jest.advanceTimersByTime(100);
        });

        rerender({ value: 'abcd' });

        // At this point, timer has been reset multiple times
        // Value should still be 'a'
        expect(result.current).toBe('a');

        // Advance full delay from last change
        act(() => {
            jest.advanceTimersByTime(300);
        });

        expect(result.current).toBe('abcd');
    });

    it('uses default delay of 300ms', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value),
            { initialProps: { value: 'initial' } }
        );

        rerender({ value: 'updated' });

        act(() => {
            jest.advanceTimersByTime(299);
        });

        expect(result.current).toBe('initial');

        act(() => {
            jest.advanceTimersByTime(1);
        });

        expect(result.current).toBe('updated');
    });

    it('works with different types', () => {
        // Number type
        const { result: numResult, rerender: numRerender } = renderHook(
            ({ value }) => useDebounce(value, 300),
            { initialProps: { value: 0 } }
        );

        numRerender({ value: 42 });
        act(() => {
            jest.advanceTimersByTime(300);
        });
        expect(numResult.current).toBe(42);

        // Object type
        const { result: objResult, rerender: objRerender } = renderHook(
            ({ value }) => useDebounce(value, 300),
            { initialProps: { value: { count: 0 } } }
        );

        objRerender({ value: { count: 1 } });
        act(() => {
            jest.advanceTimersByTime(300);
        });
        expect(objResult.current).toEqual({ count: 1 });
    });

    it('cleans up timeout on unmount', () => {
        const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

        const { unmount, rerender } = renderHook(
            ({ value }) => useDebounce(value, 300),
            { initialProps: { value: 'initial' } }
        );

        rerender({ value: 'updated' });
        unmount();

        expect(clearTimeoutSpy).toHaveBeenCalled();
        clearTimeoutSpy.mockRestore();
    });
});
