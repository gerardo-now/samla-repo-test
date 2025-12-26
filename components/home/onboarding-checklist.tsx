"use client";

import { UI } from "@/lib/copy/uiStrings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Phone,
  Calendar,
  Bot,
  Mic,
  BookOpen,
  Radio,
  CreditCard,
  Check,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

const checklistItems = [
  {
    id: "whatsapp",
    label: UI.onboarding.steps.whatsapp,
    icon: MessageSquare,
    href: "/settings?tab=channels",
    completed: false,
  },
  {
    id: "phone",
    label: UI.onboarding.steps.phone,
    icon: Phone,
    href: "/settings?tab=channels",
    completed: false,
  },
  {
    id: "calendar",
    label: UI.onboarding.steps.calendar,
    icon: Calendar,
    href: "/settings?tab=calendar",
    completed: false,
  },
  {
    id: "agent",
    label: UI.onboarding.steps.agent,
    icon: Bot,
    href: "/agents",
    completed: false,
  },
  {
    id: "voice",
    label: UI.onboarding.steps.voice,
    icon: Mic,
    href: "/settings?tab=voices",
    completed: false,
  },
  {
    id: "knowledge",
    label: UI.onboarding.steps.knowledge,
    icon: BookOpen,
    href: "/knowledge",
    completed: false,
  },
  {
    id: "liveMode",
    label: UI.onboarding.steps.liveMode,
    icon: Radio,
    href: "/home",
    completed: false,
  },
  {
    id: "billing",
    label: UI.onboarding.steps.billing,
    icon: CreditCard,
    href: "/settings?tab=billing",
    completed: false,
  },
];

export function OnboardingChecklist() {
  const completedCount = checklistItems.filter((item) => item.completed).length;
  const progress = (completedCount / checklistItems.length) * 100;
  const isComplete = completedCount === checklistItems.length;

  if (isComplete) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {UI.onboarding.title}
        </CardTitle>
        <CardDescription>
          {UI.onboarding.subtitle} ({completedCount}/{checklistItems.length})
        </CardDescription>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {checklistItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all",
                item.completed
                  ? "bg-muted/50 border-muted"
                  : "bg-background border-border hover:border-primary/50 hover:shadow-sm"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full shrink-0",
                  item.completed
                    ? "bg-green-500/10 text-green-600"
                    : "bg-primary/10 text-primary"
                )}
              >
                {item.completed ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <item.icon className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium truncate",
                    item.completed && "text-muted-foreground line-through"
                  )}
                >
                  {item.label}
                </p>
              </div>
              {!item.completed && (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

