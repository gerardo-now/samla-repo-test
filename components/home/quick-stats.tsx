"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Phone, Calendar, Users } from "lucide-react";

const stats = [
  {
    label: "Conversaciones hoy",
    value: "0",
    change: "",
    icon: MessageSquare,
  },
  {
    label: "Llamadas hoy",
    value: "0",
    change: "",
    icon: Phone,
  },
  {
    label: "Citas esta semana",
    value: "0",
    change: "",
    icon: Calendar,
  },
  {
    label: "Clientes activos",
    value: "0",
    change: "",
    icon: Users,
  },
];

export function QuickStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.change && (
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

