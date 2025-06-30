import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parsePriceRange(priceRangeString: string | null | undefined): number {
  if (!priceRangeString) {
    return 0;
  }

  const range = priceRangeString.toLowerCase().replace(/\s/g, '');

  let multiplier = 1;
  if (range.includes('k')) {
    multiplier = 1000;
  } else if (range.includes('l')) {
    multiplier = 100000;
  } else if (range.includes('cr')) {
    multiplier = 10000000;
  }

  const numbers = range.replace(/[klcr>]/g, '').split('-').map(Number);

  if (numbers.some(isNaN)) {
    return 0; // Or throw an error, or handle more gracefully
  }

  if (range.startsWith('>')) {
    if (numbers.length === 1) {
      return numbers[0] * multiplier;
    }
  } else if (numbers.length === 1) {
    // Handles single values like "50k" or "1L"
    return numbers[0] * multiplier;
  } else if (numbers.length === 2) {
    return ((numbers[0] + numbers[1]) / 2) * multiplier;
  }

  return 0; // Default if format is not recognized
}
