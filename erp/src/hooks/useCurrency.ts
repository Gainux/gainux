import { useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

export const useCurrency = () => {
    const { organization } = useAuth();

    const currencyCode = organization?.currency || 'INR';
    const symbol = organization?.settings?.currency_symbol || '₹';

    const formatAmount = useCallback((amount: number | null | undefined) => {
        if (amount === undefined || amount === null) return `${symbol} 0.00`;

        // Format number with commas, forcing 2 decimal places
        const formattedNum = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);

        return `${symbol} ${formattedNum}`;
    }, [symbol]);

    return {
        currency: currencyCode,
        symbol,
        formatAmount
    };
};
