import { formatDistanceToNow, parseISO } from 'date-fns';

export function formatIndianCurrency(amount: number): string {
  if (isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCrore(amount: number): string {
  if (isNaN(amount)) return '₹0.00 Cr';
  const crores = amount / 10000000;
  return `₹${crores.toFixed(2)} Cr`;
}

export function timeAgo(dateString: string): string {
  if (!dateString) return '';
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch (err) {
    return dateString;
  }
}

export function truncateHash(hash: string, chars = 16): string {
  if (!hash) return '';
  if (hash.length <= chars) return hash;
  return `${hash.substring(0, chars)}...`;
}

export function formatArea(sqft: number): string {
  if (isNaN(sqft)) return '0 sq ft';
  return new Intl.NumberFormat('en-IN').format(sqft) + ' sq ft';
}
