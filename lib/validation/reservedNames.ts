/**
 * Reserved Organization Names
 * 
 * These names cannot be used for customer workspaces.
 * They are reserved for SAMLA internal use.
 */

// Reserved names (case-insensitive)
const RESERVED_NAMES = [
  // SAMLA brand
  "samla",
  "mysamla",
  "samla.io",
  "samla.com",
  "samla.mx",
  "samlaai",
  "samla-ai",
  "samla ai",
  
  // Ghyperion brand
  "ghyperion",
  "hyperion",
  "g-hyperion",
  "ghyperion.com",
  
  // Common variations
  "admin",
  "administrator",
  "sistema",
  "system",
  "root",
  "superadmin",
  "super-admin",
  "support",
  "soporte",
  "help",
  "ayuda",
  "api",
  "app",
  "test",
  "demo",
  "staging",
  "production",
  "dev",
  "desarrollo",
];

// Reserved slugs (for URL paths)
const RESERVED_SLUGS = [
  "admin",
  "api",
  "app",
  "auth",
  "login",
  "signup",
  "register",
  "settings",
  "billing",
  "inbox",
  "agents",
  "contacts",
  "leads",
  "calendar",
  "triggers",
  "knowledge",
  "home",
  "dashboard",
  "samla",
  "ghyperion",
];

/**
 * Normalize a string for comparison
 */
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]/g, ""); // Remove special chars
}

/**
 * Check if a workspace name is reserved
 * @param name The workspace name to check
 * @returns Error message if reserved, null if allowed
 */
export function isReservedName(name: string): string | null {
  if (!name) return null;
  
  const normalized = normalize(name);
  
  // Check exact matches
  for (const reserved of RESERVED_NAMES) {
    const reservedNormalized = normalize(reserved);
    
    // Exact match
    if (normalized === reservedNormalized) {
      return "Este nombre está reservado y no puede ser utilizado";
    }
    
    // Contains the reserved name
    if (normalized.includes(reservedNormalized) && reservedNormalized.length >= 5) {
      // Only block if the reserved name is significant (5+ chars)
      if (reservedNormalized === "samla" || reservedNormalized === "ghyperion" || reservedNormalized === "hyperion") {
        return "Este nombre contiene una marca reservada y no puede ser utilizado";
      }
    }
  }
  
  return null;
}

/**
 * Check if a slug is reserved
 * @param slug The slug to check
 * @returns true if reserved, false if allowed
 */
export function isReservedSlug(slug: string): boolean {
  if (!slug) return false;
  
  const normalized = slug.toLowerCase().replace(/[^a-z0-9-]/g, "");
  
  return RESERVED_SLUGS.some(reserved => {
    const reservedLower = reserved.toLowerCase();
    return normalized === reservedLower || normalized.startsWith(`${reservedLower}-`);
  });
}

/**
 * Validate workspace name
 * @param name The name to validate
 * @returns Object with isValid and error message
 */
export function validateWorkspaceName(name: string): { isValid: boolean; error?: string } {
  if (!name || typeof name !== "string") {
    return { isValid: false, error: "El nombre es requerido" };
  }
  
  const trimmed = name.trim();
  
  if (trimmed.length < 2) {
    return { isValid: false, error: "El nombre debe tener al menos 2 caracteres" };
  }
  
  if (trimmed.length > 100) {
    return { isValid: false, error: "El nombre no puede tener más de 100 caracteres" };
  }
  
  const reservedError = isReservedName(trimmed);
  if (reservedError) {
    return { isValid: false, error: reservedError };
  }
  
  return { isValid: true };
}

