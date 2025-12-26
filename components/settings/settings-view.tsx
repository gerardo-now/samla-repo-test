"use client";

import { useState } from "react";
import { UI } from "@/lib/copy/uiStrings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "@/components/settings/general-settings";
import { TeamSettings } from "@/components/settings/team-settings";
import { ChannelsSettings } from "@/components/settings/channels-settings";
import { CallerIdSettings } from "@/components/settings/caller-id-settings";
import { CalendarSettings } from "@/components/settings/calendar-settings";
import { VoicesSettings } from "@/components/settings/voices-settings";
import { TemplatesSettings } from "@/components/settings/templates-settings";
import { BillingSettings } from "@/components/settings/billing-settings";

export function SettingsView() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="flex-wrap h-auto gap-2">
        <TabsTrigger value="general">{UI.settings.tabs.general}</TabsTrigger>
        <TabsTrigger value="team">{UI.settings.tabs.team}</TabsTrigger>
        <TabsTrigger value="channels">{UI.settings.tabs.channels}</TabsTrigger>
        <TabsTrigger value="callerId">{UI.settings.tabs.callerId}</TabsTrigger>
        <TabsTrigger value="calendar">{UI.settings.tabs.calendar}</TabsTrigger>
        <TabsTrigger value="voices">{UI.settings.tabs.voices}</TabsTrigger>
        <TabsTrigger value="templates">{UI.settings.tabs.templates}</TabsTrigger>
        <TabsTrigger value="billing">{UI.settings.tabs.billing}</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <GeneralSettings />
      </TabsContent>

      <TabsContent value="team">
        <TeamSettings />
      </TabsContent>

      <TabsContent value="channels">
        <ChannelsSettings />
      </TabsContent>

      <TabsContent value="callerId">
        <CallerIdSettings />
      </TabsContent>

      <TabsContent value="calendar">
        <CalendarSettings />
      </TabsContent>

      <TabsContent value="voices">
        <VoicesSettings />
      </TabsContent>

      <TabsContent value="templates">
        <TemplatesSettings />
      </TabsContent>

      <TabsContent value="billing">
        <BillingSettings />
      </TabsContent>
    </Tabs>
  );
}

