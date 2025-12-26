"use client";

import { useState } from "react";
import { UI } from "@/lib/copy/uiStrings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlansAdmin } from "@/components/admin/plans-admin";
import { UsageAdmin } from "@/components/admin/usage-admin";
import { CustomersAdmin } from "@/components/admin/customers-admin";
import { OverridesAdmin } from "@/components/admin/overrides-admin";
import { AuditAdmin } from "@/components/admin/audit-admin";

export function AdminView() {
  const [activeTab, setActiveTab] = useState("plans");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList>
        <TabsTrigger value="plans">{UI.admin.tabs.plans}</TabsTrigger>
        <TabsTrigger value="usage">{UI.admin.tabs.usage}</TabsTrigger>
        <TabsTrigger value="customers">{UI.admin.tabs.customers}</TabsTrigger>
        <TabsTrigger value="overrides">{UI.admin.tabs.overrides}</TabsTrigger>
        <TabsTrigger value="audit">{UI.admin.tabs.audit}</TabsTrigger>
      </TabsList>

      <TabsContent value="plans">
        <PlansAdmin />
      </TabsContent>

      <TabsContent value="usage">
        <UsageAdmin />
      </TabsContent>

      <TabsContent value="customers">
        <CustomersAdmin />
      </TabsContent>

      <TabsContent value="overrides">
        <OverridesAdmin />
      </TabsContent>

      <TabsContent value="audit">
        <AuditAdmin />
      </TabsContent>
    </Tabs>
  );
}

