// Prisma Configuration
// Uses dotenv for local development

import "dotenv/config";
import { defineConfig } from "prisma/config";

// Get DATABASE_URL with fallback for build time
const databaseUrl = process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/placeholder";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: databaseUrl,
  },
});
