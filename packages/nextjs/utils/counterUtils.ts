/**
 * Utility functions for counter contract interactions
 */

// STRK token decimals
export const STRK_DECIMALS = 18n;

// Convert STRK to FRI (smallest unit)
export const strkToFri = (amount: number): bigint => {
  return BigInt(amount) * (10n ** STRK_DECIMALS);
};

// Convert FRI to STRK
export const friToStrk = (amount: bigint): number => {
  return Number(amount) / Number(10n ** STRK_DECIMALS);
};

// Format STRK amount for display
export const formatStrk = (amount: bigint, decimals: number = 4): string => {
  const strkAmount = friToStrk(amount);
  return strkAmount.toFixed(decimals);
};

// STRK token address on devnet
export const STRK_TOKEN_ADDRESS = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

// Reset payment amount (1 STRK)
export const RESET_PAYMENT_AMOUNT = strkToFri(1);

// Contract addresses
export const CONTRACT_ADDRESSES = {
  STRK: STRK_TOKEN_ADDRESS,
} as const;

// Event reason mapping
export const CHANGE_REASON_LABELS = {
  Increase: "Increased",
  Decrease: "Decreased", 
  Reset: "Reset",
  Set: "Set by Owner",
} as const;

export type ChangeReason = keyof typeof CHANGE_REASON_LABELS;
