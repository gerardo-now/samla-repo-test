import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isSamlaEmail } from "@/lib/auth/superAdmin";

/**
 * Admin Layout
 * 
 * Protects ALL /admin routes - only SAMLA internal team can access.
 * Regular customers will be redirected to home.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const email = user.emailAddresses?.[0]?.emailAddress;
  const hasAdminMetadata = user.publicMetadata?.isSuperAdmin === true;
  const isSamlaTeam = isSamlaEmail(email);

  // Only SAMLA internal team or users with explicit admin metadata can access
  if (!isSamlaTeam && !hasAdminMetadata) {
    redirect("/home");
  }

  return <>{children}</>;
}

