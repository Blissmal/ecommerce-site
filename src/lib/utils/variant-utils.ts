// lib/utils/variant-utils.ts

/**
 * Generate variant SKU from product SKU and variant options
 * @param productSKU - Base product SKU
 * @param options - Variant options (color, size, storage)
 * @returns Generated SKU string
 * 
 * @example
 * generateVariantSKU("IP14", { storage: "256GB", color: "Blue" })
 * // Returns: "IP14-256GB-BLU"
 */
export function generateVariantSKU(
  productSKU: string,
  options: {
    color?: string | null;
    size?: string | null;
    storage?: string | null;
  }
): string {
  const parts = [productSKU];
  
  // Add storage first (e.g., 128GB, 256GB)
  if (options.storage) {
    parts.push(options.storage.replace(/\s/g, ''));
  }
  
  // Add color (first 3 letters, uppercase)
  if (options.color) {
    parts.push(options.color.substring(0, 3).toUpperCase());
  }
  
  // Add size (no spaces)
  if (options.size) {
    parts.push(options.size.replace(/\s/g, ''));
  }
  
  return parts.join('-');
}

/**
 * Parse variant SKU to extract components
 * @param sku - Full variant SKU
 * @returns Object with parsed components
 * 
 * @example
 * parseVariantSKU("IP14-256GB-BLU")
 * // Returns: { productSKU: "IP14", parts: ["256GB", "BLU"] }
 */
export function parseVariantSKU(sku: string): {
  productSKU: string;
  parts: string[];
} {
  const parts = sku.split('-');
  const productSKU = parts[0];
  const variantParts = parts.slice(1);
  
  return { productSKU, parts: variantParts };
}

/**
 * Validate if SKU format is correct
 * @param sku - SKU to validate
 * @returns True if valid SKU format
 */
export function isValidSKU(sku: string): boolean {
  // SKU should have at least product code and one variant part
  const parts = sku.split('-');
  return parts.length >= 1 && parts.every(part => part.length > 0);
}

/**
 * Format variant display name from options
 * @param options - Variant options
 * @returns Formatted display string
 * 
 * @example
 * formatVariantName({ color: "Blue", storage: "256GB" })
 * // Returns: "256GB, Blue"
 */
export function formatVariantName(options: {
  color?: string | null;
  size?: string | null;
  storage?: string | null;
}): string {
  const parts: string[] = [];
  
  if (options.storage) parts.push(options.storage);
  if (options.color) parts.push(options.color);
  if (options.size) parts.push(options.size);
  
  return parts.join(', ');
}

/**
 * Check if two variants are the same
 * @param variant1 - First variant options
 * @param variant2 - Second variant options
 * @returns True if variants match
 */
export function areVariantsEqual(
  variant1: {
    color?: string | null;
    size?: string | null;
    storage?: string | null;
  },
  variant2: {
    color?: string | null;
    size?: string | null;
    storage?: string | null;
  }
): boolean {
  return (
    variant1.color === variant2.color &&
    variant1.size === variant2.size &&
    variant1.storage === variant2.storage
  );
}