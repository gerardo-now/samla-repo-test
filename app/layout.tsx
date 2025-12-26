import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SAMLA - Plataforma de Conversaciones con IA",
  description: "Tu plataforma de conversaciones con IA. Una bandeja. Cada conversación.",
  icons: {
    icon: "/favicon.ico",
  },
};

// Force dynamic rendering to avoid static generation issues with auth
export const dynamic = "force-dynamic";

function isValidClerkKey(key: string | undefined): boolean {
  if (!key) return false;
  if (!key.startsWith('pk_')) return false;
  // Detect placeholder keys
  if (key.includes('placeholder') || key.includes('xxx') || key.length < 50) return false;
  return true;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hasClerkKey = isValidClerkKey(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  const content = (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );

  // Only wrap with ClerkProvider if we have a valid key
  if (hasClerkKey) {
    return (
      <ClerkProvider localization={esES}>
        {content}
      </ClerkProvider>
    );
  }

  return content;
}
