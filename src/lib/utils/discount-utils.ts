// lib/discount-utils.ts
export const isDiscountActive = (
  discount: number | null,
  discountExpiry: string | null
): boolean => {
  if (!discount || discount === 0) return false;
  if (!discountExpiry) return true; // No expiry means discount is always active
  
  const now = new Date();
  const expiryDate = new Date(discountExpiry);
  
  return now < expiryDate;
};

export const getDiscountedPrice = (
  price: number,
  discount: number | null,
  discountExpiry: string | null
): number => {
  if (isDiscountActive(discount, discountExpiry)) {
    return price * (1 - (discount! / 100));
  }
  return price;
};

export const getTimeRemaining = (discountExpiry: string | null): string | null => {
  if (!discountExpiry) return null;
  
  const now = new Date();
  const expiry = new Date(discountExpiry);
  const diff = expiry.getTime() - now.getTime();
  
  if (diff <= 0) return "Expired";
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
};