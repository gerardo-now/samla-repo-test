"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Phone, Calendar, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "message" | "call" | "meeting" | "agent";
  title: string;
  description: string;
  time: string;
}

const activityItems: ActivityItem[] = [];

const typeIcons = {
  message: MessageSquare,
  call: Phone,
  meeting: Calendar,
  agent: Bot,
};

const typeColors = {
  message: "text-green-600 bg-green-500/10",
  call: "text-blue-600 bg-blue-500/10",
  meeting: "text-purple-600 bg-purple-500/10",
  agent: "text-orange-600 bg-orange-500/10",
};

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad reciente</CardTitle>
      </CardHeader>
      <CardContent>
        {activityItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay actividad reciente</p>
            <p className="text-sm mt-1">Las conversaciones aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activityItems.map((item) => {
              const Icon = typeIcons[item.type];
              const colorClass = typeColors[item.type];
              return (
                <div key={item.id} className="flex items-start gap-4">
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full shrink-0",
                      colorClass
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {item.description}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {item.time}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

