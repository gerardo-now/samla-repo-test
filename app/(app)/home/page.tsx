import { UI } from "@/lib/copy/uiStrings";
import { OnboardingChecklist } from "@/components/home/onboarding-checklist";
import { QuickStats } from "@/components/home/quick-stats";
import { RecentActivity } from "@/components/home/recent-activity";
import { WelcomeModal } from "@/components/home/welcome-modal";

export default function HomePage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Modal for first-time users */}
      <WelcomeModal />

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
