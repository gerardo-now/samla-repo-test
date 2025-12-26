/**
 * Billing Regions Configuration
 * 
 * Maps countries to billing regions. Each region has different pricing.
 * If a customer operates in multiple regions, they must use Enterprise plan.
 */

export interface Country {
  code: string;
  name: string;
  nameEs: string;
  region: BillingRegion;
}

export type BillingRegion = "LATAM" | "NA" | "EU" | "APAC";

export const BILLING_REGIONS: Record<BillingRegion, { name: string; nameEs: string; currency: string }> = {
  LATAM: { name: "Latin America", nameEs: "Latinoamérica", currency: "USD" },
  NA: { name: "North America", nameEs: "Norteamérica", currency: "USD" },
  EU: { name: "Europe", nameEs: "Europa", currency: "EUR" },
  APAC: { name: "Asia Pacific", nameEs: "Asia Pacífico", currency: "USD" },
};

// Countries grouped by region
export const COUNTRIES: Country[] = [
  // LATAM
  { code: "MX", name: "Mexico", nameEs: "México", region: "LATAM" },
  { code: "CO", name: "Colombia", nameEs: "Colombia", region: "LATAM" },
  { code: "AR", name: "Argentina", nameEs: "Argentina", region: "LATAM" },
  { code: "CL", name: "Chile", nameEs: "Chile", region: "LATAM" },
  { code: "PE", name: "Peru", nameEs: "Perú", region: "LATAM" },
  { code: "EC", name: "Ecuador", nameEs: "Ecuador", region: "LATAM" },
  { code: "VE", name: "Venezuela", nameEs: "Venezuela", region: "LATAM" },
  { code: "GT", name: "Guatemala", nameEs: "Guatemala", region: "LATAM" },
  { code: "CU", name: "Cuba", nameEs: "Cuba", region: "LATAM" },
  { code: "DO", name: "Dominican Republic", nameEs: "República Dominicana", region: "LATAM" },
  { code: "HN", name: "Honduras", nameEs: "Honduras", region: "LATAM" },
  { code: "BO", name: "Bolivia", nameEs: "Bolivia", region: "LATAM" },
  { code: "SV", name: "El Salvador", nameEs: "El Salvador", region: "LATAM" },
  { code: "NI", name: "Nicaragua", nameEs: "Nicaragua", region: "LATAM" },
  { code: "CR", name: "Costa Rica", nameEs: "Costa Rica", region: "LATAM" },
  { code: "PA", name: "Panama", nameEs: "Panamá", region: "LATAM" },
  { code: "UY", name: "Uruguay", nameEs: "Uruguay", region: "LATAM" },
  { code: "PY", name: "Paraguay", nameEs: "Paraguay", region: "LATAM" },
  { code: "PR", name: "Puerto Rico", nameEs: "Puerto Rico", region: "LATAM" },
  { code: "BR", name: "Brazil", nameEs: "Brasil", region: "LATAM" },
  
  // North America
  { code: "US", name: "United States", nameEs: "Estados Unidos", region: "NA" },
  { code: "CA", name: "Canada", nameEs: "Canadá", region: "NA" },
  
  // Europe
  { code: "ES", name: "Spain", nameEs: "España", region: "EU" },
  { code: "PT", name: "Portugal", nameEs: "Portugal", region: "EU" },
  { code: "FR", name: "France", nameEs: "Francia", region: "EU" },
  { code: "DE", name: "Germany", nameEs: "Alemania", region: "EU" },
  { code: "IT", name: "Italy", nameEs: "Italia", region: "EU" },
  { code: "GB", name: "United Kingdom", nameEs: "Reino Unido", region: "EU" },
  { code: "NL", name: "Netherlands", nameEs: "Países Bajos", region: "EU" },
  { code: "BE", name: "Belgium", nameEs: "Bélgica", region: "EU" },
  { code: "CH", name: "Switzerland", nameEs: "Suiza", region: "EU" },
  { code: "AT", name: "Austria", nameEs: "Austria", region: "EU" },
  { code: "IE", name: "Ireland", nameEs: "Irlanda", region: "EU" },
  { code: "PL", name: "Poland", nameEs: "Polonia", region: "EU" },
  
  // Asia Pacific
  { code: "AU", name: "Australia", nameEs: "Australia", region: "APAC" },
  { code: "NZ", name: "New Zealand", nameEs: "Nueva Zelanda", region: "APAC" },
  { code: "JP", name: "Japan", nameEs: "Japón", region: "APAC" },
  { code: "SG", name: "Singapore", nameEs: "Singapur", region: "APAC" },
  { code: "HK", name: "Hong Kong", nameEs: "Hong Kong", region: "APAC" },
  { code: "KR", name: "South Korea", nameEs: "Corea del Sur", region: "APAC" },
];

/**
 * Get country by code
 */
export function getCountry(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code);
}

/**
 * Get region for a country code
 */
export function getRegionForCountry(countryCode: string): BillingRegion | undefined {
  const country = getCountry(countryCode);
  return country?.region;
}

/**
 * Get all countries for a region
 */
export function getCountriesForRegion(region: BillingRegion): Country[] {
  return COUNTRIES.filter(c => c.region === region);
}

/**
 * Check if multiple countries span multiple regions
 * If true, customer needs Enterprise plan
 */
export function requiresEnterprise(countryCodes: string[]): boolean {
  if (countryCodes.length === 0) return false;
  
  const regions = new Set<BillingRegion>();
  
  for (const code of countryCodes) {
    const region = getRegionForCountry(code);
    if (region) {
      regions.add(region);
    }
  }
  
  // More than one region = Enterprise required
  return regions.size > 1;
}

/**
 * Get the single region for a set of countries (if all same region)
 * Returns null if multiple regions
 */
export function getSingleRegion(countryCodes: string[]): BillingRegion | null {
  if (countryCodes.length === 0) return null;
  
  const regions = new Set<BillingRegion>();
  
  for (const code of countryCodes) {
    const region = getRegionForCountry(code);
    if (region) {
      regions.add(region);
    }
  }
  
  if (regions.size === 1) {
    return Array.from(regions)[0];
  }
  
  return null;
}

/**
 * Group countries by region for display
 */
export function getCountriesGroupedByRegion(lang: "en" | "es" = "es"): Record<string, Country[]> {
  const grouped: Record<string, Country[]> = {};
  
  for (const region of Object.keys(BILLING_REGIONS) as BillingRegion[]) {
    const regionName = lang === "es" ? BILLING_REGIONS[region].nameEs : BILLING_REGIONS[region].name;
    grouped[regionName] = getCountriesForRegion(region);
  }
  
  return grouped;
}

