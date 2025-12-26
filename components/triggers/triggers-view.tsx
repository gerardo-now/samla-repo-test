"use client";

import { useState } from "react";
import { UI } from "@/lib/copy/uiStrings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Zap,
  MessageSquare,
  Phone,
  ClipboardList,
  Clock,
  ArrowRight,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface TriggerRule {
  id: string;
  name: string;
  description?: string;
  triggerType: "keyword" | "callOutcome" | "noReply" | "overdueTask" | "newContact" | "scheduleEvent";
  actionType: "sendWhatsapp" | "startCall" | "createTask" | "scheduleFollowup";
  isActive: boolean;
  triggerCount: number;
}

const mockTriggers: TriggerRule[] = [];

const triggerTypeConfig = {
  keyword: { label: UI.triggers.triggerTypes.keyword, icon: MessageSquare },
  callOutcome: { label: UI.triggers.triggerTypes.callOutcome, icon: Phone },
  noReply: { label: UI.triggers.triggerTypes.noReply, icon: Clock },
  overdueTask: { label: UI.triggers.triggerTypes.overdueTask, icon: ClipboardList },
  newContact: { label: UI.triggers.triggerTypes.newContact, icon: Zap },
  scheduleEvent: { label: UI.triggers.triggerTypes.scheduleEvent, icon: Clock },
};

const actionTypeConfig = {
  sendWhatsapp: { label: UI.triggers.actions.sendWhatsapp, icon: MessageSquare },
  startCall: { label: UI.triggers.actions.startCall, icon: Phone },
  createTask: { label: UI.triggers.actions.createTask, icon: ClipboardList },
  scheduleFollowup: { label: UI.triggers.actions.scheduleFollowup, icon: Clock },
};

export function TriggersView() {
  const [isAddTriggerOpen, setIsAddTriggerOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Empty State or Grid */}
      {mockTriggers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium">Crea tu primera automatización</h3>
            <p className="text-muted-foreground mt-1 max-w-sm">
              Las automatizaciones ejecutan acciones automáticamente cuando ocurren ciertos eventos
            </p>
            <Button className="mt-6" onClick={() => setIsAddTriggerOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {UI.triggers.addNew}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex justify-end">
            <Button onClick={() => setIsAddTriggerOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {UI.triggers.addNew}
            </Button>
          </div>

          <div className="space-y-4">
            {mockTriggers.map((trigger) => {
              const TriggerIcon = triggerTypeConfig[trigger.triggerType].icon;
              const ActionIcon = actionTypeConfig[trigger.actionType].icon;

              return (
                <Card
                  key={trigger.id}
                  className={cn(
                    "transition-all hover:shadow-sm",
                    !trigger.isActive && "opacity-60"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Trigger */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                          <TriggerIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{trigger.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {UI.triggers.conditions.if}: {triggerTypeConfig[trigger.triggerType].label}
                          </p>
                        </div>
                      </div>

                      {/* Arrow */}
                      <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />

                      {/* Action */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                          <ActionIcon className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-muted-foreground">
                            {UI.triggers.conditions.then}: {actionTypeConfig[trigger.actionType].label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {trigger.triggerCount} ejecuciones
                          </p>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Switch checked={trigger.isActive} />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>{UI.common.edit}</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              {UI.common.delete}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Add Trigger Dialog */}
      <Dialog open={isAddTriggerOpen} onOpenChange={setIsAddTriggerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{UI.triggers.addNew}</DialogTitle>
            <DialogDescription>
              Define cuándo y qué acción ejecutar automáticamente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <p className="text-muted-foreground text-center">
              Editor de automatización
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

