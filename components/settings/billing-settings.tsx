"use client";

import { UI } from "@/lib/copy/uiStrings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, ExternalLink, Phone, MessageSquare, Users, Bot, Zap } from "lucide-react";

interface PlanInfo {
  code: string;
  name: string;
  price: number;
  currency: string;
  includedCallMinutes: number;
  includedWhatsappConversations: number;
  includedSeats?: number;
  includedAgents?: number;
}

interface UsageInfo {
  callMinutesUsed: number;
  whatsappConversationsUsed: number;
  seatsUsed: number;
  agentsUsed: number;
}

// Mock data - would come from API
const currentPlan: PlanInfo | null = null;
const usage: UsageInfo = {
  callMinutesUsed: 0,
  whatsappConversationsUsed: 0,
  seatsUsed: 1,
  agentsUsed: 0,
};
const nextRenewal = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

const availablePlans: PlanInfo[] = [
  {
    code: "starter",
    name: UI.billing.plans.starter,
    price: 499,
    currency: "MXN",
    includedCallMinutes: 100,
    includedWhatsappConversations: 500,
    includedSeats: 2,
    includedAgents: 1,
  },
  {
    code: "growth",
    name: UI.billing.plans.growth,
    price: 1499,
    currency: "MXN",
    includedCallMinutes: 500,
    includedWhatsappConversations: 2000,
    includedSeats: 5,
    includedAgents: 3,
  },
  {
    code: "pro",
    name: UI.billing.plans.pro,
    price: 3999,
    currency: "MXN",
    includedCallMinutes: 2000,
    includedWhatsappConversations: 10000,
    includedSeats: 10,
    includedAgents: 10,
  },
];

function UsageBar({
  label,
  used,
  included,
  icon: Icon,
}: {
  label: string;
  used: number;
  included: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const percentage = included > 0 ? Math.min((used / included) * 100, 100) : 0;
  const isWarning = percentage >= 80;
  const isExceeded = percentage >= 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {used.toLocaleString()} / {included.toLocaleString()}
        </span>
      </div>
      <Progress
        value={percentage}
        className={isExceeded ? "[&>div]:bg-destructive" : isWarning ? "[&>div]:bg-yellow-500" : ""}
      />
      {isWarning && !isExceeded && (
        <p className="text-xs text-yellow-600">{UI.billing.warnings.approaching}</p>
      )}
      {isExceeded && (
        <p className="text-xs text-destructive">{UI.billing.warnings.exceeded}</p>
      )}
    </div>
  );
}

export function BillingSettings() {
  if (!currentPlan) {
    // No subscription - show plans
    return (
      <div className="space-y-6">
        <Card className="border-primary/50 bg-gradient-to-br from-primary/5 via-background to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Elige tu plan
            </CardTitle>
            <CardDescription>
              Selecciona el plan que mejor se adapte a tus necesidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {availablePlans.map((plan) => (
                <Card key={plan.code} className="relative hover:shadow-lg transition-shadow">
                  {plan.code === "growth" && (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                      Popular
                    </Badge>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">
                        ${plan.price.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground"> {plan.currency}{UI.billing.perMonth}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{plan.includedCallMinutes.toLocaleString()} {UI.billing.callMinutes}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span>{plan.includedWhatsappConversations.toLocaleString()} {UI.billing.whatsappConversations}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{plan.includedSeats} {UI.billing.seats}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-muted-foreground" />
                        <span>{plan.includedAgents} {UI.billing.agents}</span>
                      </div>
                    </div>
                    <Button className="w-full">
                      {UI.billing.cta.subscribe}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Has subscription - show current plan and usage
  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{UI.billing.currentPlan}</CardTitle>
              <CardDescription>
                {UI.billing.nextRenewal}: {nextRenewal.toLocaleDateString("es-MX")}
              </CardDescription>
            </div>
            <Badge variant="default" className="text-lg px-4 py-1">
              {currentPlan.name}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Usage */}
          <div>
            <h4 className="font-medium mb-4">{UI.billing.usage}</h4>
            <div className="space-y-6">
              <UsageBar
                label={UI.billing.callMinutes}
                used={usage.callMinutesUsed}
                included={currentPlan.includedCallMinutes}
                icon={Phone}
              />
              <UsageBar
                label={UI.billing.whatsappConversations}
                used={usage.whatsappConversationsUsed}
                included={currentPlan.includedWhatsappConversations}
                icon={MessageSquare}
              />
              {currentPlan.includedSeats && (
                <UsageBar
                  label={UI.billing.seats}
                  used={usage.seatsUsed}
                  included={currentPlan.includedSeats}
                  icon={Users}
                />
              )}
              {currentPlan.includedAgents && (
                <UsageBar
                  label={UI.billing.agents}
                  used={usage.agentsUsed}
                  included={currentPlan.includedAgents}
                  icon={Bot}
                />
              )}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-4">
            <Button variant="outline">
              <CreditCard className="h-4 w-4 mr-2" />
              {UI.billing.manageBilling}
              <ExternalLink className="h-3 w-3 ml-2" />
            </Button>
            <Button>
              {UI.billing.changePlan}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

