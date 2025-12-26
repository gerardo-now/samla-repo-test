/**
 * Super Admin Authorization
 * 
 * This module handles authorization for SAMLA internal employees only.
 * The Global Admin panel is NOT accessible to regular customers.
 * 
 * IMPORTANT: Only SAMLA team members with @samla.io emails or explicitly
 * whitelisted users can access the admin panel.
 * 
 * Customers NEVER see the admin panel. It's for SAMLA operations only:
 * - Manage pricing plans
 * - View usage/margins
 * - Configure global settings
 * - Override customer quotas
 * - Audit all platform activity
 */

// SAMLA internal domains - only these can be super admins
const SAMLA_DOMAINS = [
  "samla.io",
  "samla.com",
  "samla.mx",
  "samla.co",
  // Add more internal domains as needed
];

// Explicitly whitelisted super admin emails (for founders/early team)
// Configure via environment variable for security
const WHITELISTED_EMAILS: string[] = (() => {
  const envEmails = process.env.SAMLA_ADMIN_EMAILS;
  if (!envEmails) return [];
  return envEmails.split(",").map(e => e.toLowerCase().trim()).filter(Boolean);
})();

/**
 * Check if an email belongs to SAMLA's internal team
 */
export function isSamlaEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  
  const emailLower = email.toLowerCase().trim();
  
  // Check whitelist first
  if (WHITELISTED_EMAILS.includes(emailLower)) {
    return true;
  }
  
  // Check domain
  const domain = emailLower.split("@")[1];
  if (!domain) return false;
  
  return SAMLA_DOMAINS.includes(domain);
}

/**
 * Check if user has super admin access
 * This combines database flag check with email domain validation
 */
export function canAccessAdminPanel(user: {
  email?: string | null;
  isSuperAdmin?: boolean;
} | null | undefined): boolean {
  if (!user) return false;
  
  // Must have super admin flag enabled in database
  if (!user.isSuperAdmin) return false;
  
  // Double-check: must also have SAMLA email
  // This prevents accidental super admin flag on customer accounts
  return isSamlaEmail(user.email);
}

/**
 * Validate request for admin API routes
 * Returns error message if unauthorized, null if authorized
 */
export function validateAdminAccess(user: {
  email?: string | null;
  isSuperAdmin?: boolean;
} | null | undefined): string | null {
  if (!user) {
    return "No autorizado";
  }
  
  if (!user.isSuperAdmin) {
    return "Acceso denegado: No tienes permisos de administrador";
  }
  
  if (!isSamlaEmail(user.email)) {
    return "Acceso denegado: Solo el equipo interno de SAMLA puede acceder";
  }
  
  return null;
}

