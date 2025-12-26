/**
 * Environment Variables Configuration
 * 
 * All environment variables used by SAMLA.
 * Never expose provider names in error messages.
 */

// Helper to safely get env vars
function getEnv(key, defaultValue = "") {
  if (typeof process !== "undefined" && process.env) {
    return process.env[key] || defaultValue;
  }
  return defaultValue;
}

export const env = {
  // App
  NEXT_PUBLIC_APP_URL: getEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
  NODE_ENV: getEnv("NODE_ENV", "development"),

  // Database
  DATABASE_URL: getEnv("DATABASE_URL"),
  
  // Redis
  REDIS_URL: getEnv("REDIS_URL"),

  // Authentication (Clerk)
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: getEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"),
  CLERK_SECRET_KEY: getEnv("CLERK_SECRET_KEY"),
  CLERK_WEBHOOK_SECRET: getEnv("CLERK_WEBHOOK_SECRET"),

  // Telephony (Twilio - internal only)
  TELEPHONY_ACCOUNT_SID: getEnv("TELEPHONY_ACCOUNT_SID") || getEnv("TWILIO_ACCOUNT_SID"),
  TELEPHONY_AUTH_TOKEN: getEnv("TELEPHONY_AUTH_TOKEN") || getEnv("TWILIO_AUTH_TOKEN"),
  TELEPHONY_WEBHOOK_SECRET: getEnv("TELEPHONY_WEBHOOK_SECRET"),

  // Voice AI (ElevenLabs - internal only)
  VOICE_API_KEY: getEnv("VOICE_API_KEY") || getEnv("ELEVENLABS_API_KEY"),
  VOICE_API_URL: getEnv("VOICE_API_URL", "https://api.elevenlabs.io/v1"),

  // WhatsApp (Kapso - internal only)
  WHATSAPP_API_KEY: getEnv("WHATSAPP_API_KEY") || getEnv("KAPSO_API_KEY"),
  WHATSAPP_API_URL: getEnv("WHATSAPP_API_URL") || getEnv("KAPSO_API_URL"),
  WHATSAPP_WEBHOOK_SECRET: getEnv("WHATSAPP_WEBHOOK_SECRET"),

  // Lead Generation
  APOLLO_API_KEY: getEnv("APOLLO_API_KEY"),
  APIFY_API_TOKEN: getEnv("APIFY_API_TOKEN"),

  // Billing (Stripe)
  STRIPE_SECRET_KEY: getEnv("STRIPE_SECRET_KEY"),
  STRIPE_PUBLISHABLE_KEY: getEnv("STRIPE_PUBLISHABLE_KEY") || getEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
  STRIPE_WEBHOOK_SECRET: getEnv("STRIPE_WEBHOOK_SECRET"),

  // Calendar
  GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: getEnv("GOOGLE_CLIENT_SECRET"),
  MICROSOFT_CLIENT_ID: getEnv("MICROSOFT_CLIENT_ID"),
  MICROSOFT_CLIENT_SECRET: getEnv("MICROSOFT_CLIENT_SECRET"),

  // Storage (S3-compatible)
  S3_BUCKET: getEnv("S3_BUCKET"),
  S3_REGION: getEnv("S3_REGION", "us-east-1"),
  S3_ACCESS_KEY_ID: getEnv("S3_ACCESS_KEY_ID") || getEnv("AWS_ACCESS_KEY_ID"),
  S3_SECRET_ACCESS_KEY: getEnv("S3_SECRET_ACCESS_KEY") || getEnv("AWS_SECRET_ACCESS_KEY"),
  S3_ENDPOINT: getEnv("S3_ENDPOINT"),

  // Super Admin
  SUPER_ADMIN_EMAILS: getEnv("SUPER_ADMIN_EMAILS", "").split(",").filter(Boolean),
};

// Validate required env vars in production
if (env.NODE_ENV === "production") {
  const requiredVars = [
    "DATABASE_URL",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
  ];

  for (const varName of requiredVars) {
    if (!env[varName]) {
      console.warn(`Warning: ${varName} is not set`);
    }
  }
}

