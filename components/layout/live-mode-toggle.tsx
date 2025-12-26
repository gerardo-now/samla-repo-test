"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { UI } from "@/lib/copy/uiStrings";
import { Radio } from "lucide-react";

interface LiveModeToggleProps {
  collapsed?: boolean;
}

export function LiveModeToggle({ collapsed }: LiveModeToggleProps) {
  const [enabled, setEnabled] = useState(false);

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg transition-colors",
        enabled ? "bg-green-500/10 border border-green-500/20" : "bg-muted"
      )}
    >
      <div
        className={cn(
          "relative flex items-center justify-center w-8 h-8 rounded-full",
          enabled ? "bg-green-500" : "bg-muted-foreground/20"
        )}
      >
        <Radio className={cn("h-4 w-4", enabled ? "text-white" : "text-muted-foreground")} />
        {enabled && (
          <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-30" />
        )}
      </div>

      {!collapsed && (
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{UI.liveMode.label}</span>
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {enabled ? UI.liveMode.on : UI.liveMode.off}
          </p>
        </div>
      )}

      {collapsed && (
        <Switch
          checked={enabled}
          onCheckedChange={setEnabled}
          className="data-[state=checked]:bg-green-500 sr-only"
        />
      )}
    </div>
  );
}

