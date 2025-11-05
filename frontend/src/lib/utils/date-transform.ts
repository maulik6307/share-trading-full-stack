/**
 * Utility functions for transforming date strings to Date objects
 */

export function transformDates<T>(obj: T): T {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => transformDates(item)) as T;
    }

    if (typeof obj === 'object') {
        const transformed = { ...obj } as any;

        for (const key in transformed) {
            if (transformed.hasOwnProperty(key)) {
                const value = transformed[key];

                // Check if the key suggests it's a date field
                if (typeof value === 'string' && isDateField(key)) {
                    try {
                        const date = new Date(value);
                        if (!isNaN(date.getTime())) {
                            transformed[key] = date;
                        }
                    } catch (error) {
                        // Keep original value if date parsing fails
                        console.warn(`Failed to parse date for field ${key}:`, value);
                    }
                } else if (typeof value === 'object') {
                    transformed[key] = transformDates(value);
                }
            }
        }

        return transformed;
    }

    return obj;
}

function isDateField(key: string): boolean {
    const dateFields = [
        'createdAt',
        'updatedAt',
        'filledAt',
        'cancelledAt',
        'openedAt',
        'closedAt',
        'executedAt',
        'timestamp',
        'lastTradeTime',
        'triggeredAt',
        'expiresAt'
    ];

    return dateFields.includes(key) || key.toLowerCase().includes('date') || key.toLowerCase().includes('time');
}

export function formatSafeDate(date: Date | string | undefined | null, options?: Intl.DateTimeFormatOptions): string {
    if (!date) {
        return 'N/A';
    }

    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;

        if (isNaN(dateObj.getTime())) {
            return 'Invalid Date';
        }

        return new Intl.DateTimeFormat('en-IN', options || {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(dateObj);
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
    }
}
export function formatSafeNumber(value: number | undefined | null, decimals: number = 2): string {
    if (value === null || value === undefined || isNaN(value)) {
        return '0.00';
    }

    try {
        return value.toFixed(decimals);
    } catch (error) {
        console.error('Error formatting number:', error);
        return '0.00';
    }
}

export function formatSafeCurrency(value: number | undefined | null, currency: string = '₹'): string {
    const formattedNumber = formatSafeNumber(value, 2);
    return `${currency}${formattedNumber}`;
}