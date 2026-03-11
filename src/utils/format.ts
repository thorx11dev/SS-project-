export const formatCurrency = (amount: number | string | undefined | null) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (numAmount === undefined || numAmount === null || isNaN(numAmount)) {
    return 'Rs. 0.00';
  }
  
  return `Rs. ${numAmount.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
