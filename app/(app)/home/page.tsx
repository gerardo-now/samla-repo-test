import { UI } from "@/lib/copy/uiStrings";
import { OnboardingChecklist } from "@/components/home/onboarding-checklist";
import { QuickStats } from "@/components/home/quick-stats";
import { RecentActivity } from "@/components/home/recent-activity";
import { OnboardingWizard } from "@/components/home/onboarding-wizard";

export default function HomePage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Onboarding wizard for first-time users */}
      <OnboardingWizard />

      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{UI.nav.home}</h1>
        <p className="text-muted-foreground">{UI.brand.slogan}</p>
      </div>

      {/* Onboarding Checklist */}
      <OnboardingChecklist />

      {/* Quick Stats */}
      <QuickStats />

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}
