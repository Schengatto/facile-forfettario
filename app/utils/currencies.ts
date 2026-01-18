export const formatCurrency = (value: number | string) => {
    return `${Number(value).toLocaleString('it-IT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })} €`;
}
