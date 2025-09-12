// utils/extractReason.ts
export function extractReason(reason: any): string | null {
    if (!reason) return null;
  
    // Case 1: already a string
    if (typeof reason === "string") return reason;
  
    // Case 2: object with `.variant`
    if (reason.variant && typeof reason.variant === "object") {
      for (const [key, val] of Object.entries(reason.variant)) {
        if (val !== undefined && val !== null) return key;
      }
    }
  
    // Case 3: direct keys (Increase/Decrease/Reset/Set) on the object
    for (const key of ["Increase", "Decrease", "Reset", "Set"]) {
      if (reason[key] !== undefined && reason[key] !== null) return key;
    }
  
    // Case 4: fallback properties some serializers use
    if (typeof reason.type === "string") return reason.type;
    if (typeof reason.kind === "string") return reason.kind;
    if (typeof reason.__kind === "string") return reason.__kind;
  
    return null;
  }
  