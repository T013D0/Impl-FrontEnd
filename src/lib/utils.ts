import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCLP(
  value: number | string,
  includeSymbol = true
): string {
  // Convert to number if string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  // Handle NaN or invalid values
  if (isNaN(numValue)) return includeSymbol ? '$0' : '0';

  // Format with thousands separator (dot in CLP format)
  const formattedValue = Math.round(numValue)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Return with or without currency symbol
  return includeSymbol ? `$${formattedValue}` : formattedValue;
}
