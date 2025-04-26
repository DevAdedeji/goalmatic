export const convertToCurrency = (value: number | string) => {
    if (value === null || value === undefined) return;

    let parseAmount: number;

    if (typeof value !== 'number') {
        parseAmount = parseFloat((value as string).replace(',', '').replace(' ', ''));
    } else {
        parseAmount = value;
    }

    if (parseAmount === 0) {
        return 'Free';
    }

    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN'
    }).format(parseAmount);
}
