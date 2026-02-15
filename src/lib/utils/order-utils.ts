
export type OrderStatus = 
  | "PENDING" 
  | "PROCESSING" 
  | "PAID" 
  | "FAILED" 
  | "CANCELLED" 
  | "SHIPPED" 
  | "DELIVERED";

export const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["PROCESSING", "PAID", "FAILED", "CANCELLED"],
  PAID: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
  FAILED: ["PENDING"],
};

export interface StatusTransitionResult {
  canTransition: boolean;
  reason?: string;
}

export function canTransitionStatus(
  currentStatus: OrderStatus,
  targetStatus: OrderStatus
): StatusTransitionResult {
  if (currentStatus === targetStatus) {
    return { canTransition: false, reason: "Order already has this status" };
  }

  const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];
  
  if (!allowedTransitions.includes(targetStatus)) {
    return {
      canTransition: false,
      reason: `Cannot transition from ${currentStatus} to ${targetStatus}.`
    };
  }

  return { canTransition: true };
}