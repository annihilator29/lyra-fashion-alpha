'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { SORT_OPTIONS, type SortOption } from '@/types/product';

interface SortDropdownProps {
    value: SortOption;
    onValueChange: (value: SortOption) => void;
}

/**
 * SortDropdown Component
 *
 * Dropdown for selecting product sort order.
 * Options: newest, price low-high, price high-low, popularity, craft rating.
 */
export function SortDropdown({ value, onValueChange }: SortDropdownProps) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={value} onValueChange={onValueChange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
