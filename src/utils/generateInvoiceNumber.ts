export function generateInvoiceNumber(prefix = 'INV', lastNumber = 0, digits = 6) {
  // Get current date components
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  // Generate sequential number with padding
  const sequence = String(lastNumber + 1).padStart(digits, '0');
  
  // Format: PREFIX-YYYYMM-SEQ
  return `${prefix}-${year}${month}-${sequence}`;
}