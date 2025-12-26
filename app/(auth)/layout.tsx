// Force dynamic rendering for auth pages
export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary tracking-tight">SAMLA</h1>
          <p className="text-muted-foreground mt-2">Tu plataforma de conversaciones con IA</p>
        </div>
        {children}
      </div>
    </div>
  );
}

