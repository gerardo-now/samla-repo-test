"use client";

import { useState } from "react";
import { UI } from "@/lib/copy/uiStrings";
import { ConversationList } from "@/components/inbox/conversation-list";
import { ConversationDetail } from "@/components/inbox/conversation-detail";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

type ChannelFilter = "all" | "whatsapp" | "phone";
type StatusFilter = "all" | "open" | "closed";

export function InboxView() {
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex h-full">
      {/* Conversation List Sidebar */}
      <div className="w-80 border-r border-border flex flex-col bg-background">
        {/* Filters */}
        <div className="p-4 space-y-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={UI.common.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Channel Filter */}
          <div className="flex gap-1">
            <button
              onClick={() => setChannelFilter("all")}
              className={cn(
                "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                channelFilter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {UI.common.all}
            </button>
            <button
              onClick={() => setChannelFilter("whatsapp")}
              className={cn(
                "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1",
                channelFilter === "whatsapp"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <MessageSquare className="h-3 w-3" />
              {UI.inbox.channels.whatsapp}
            </button>
            <button
              onClick={() => setChannelFilter("phone")}
              className={cn(
                "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1",
                channelFilter === "phone"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <Phone className="h-3 w-3" />
              {UI.inbox.channels.phone}
            </button>
          </div>

          {/* Status Filter */}
          <Tabs
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                {UI.inbox.tabs.all}
              </TabsTrigger>
              <TabsTrigger value="open" className="flex-1">
                {UI.inbox.tabs.open}
              </TabsTrigger>
              <TabsTrigger value="closed" className="flex-1">
                {UI.inbox.tabs.closed}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <ConversationList
            channelFilter={channelFilter}
            statusFilter={statusFilter}
            searchQuery={searchQuery}
            selectedId={selectedConversationId}
            onSelect={setSelectedConversationId}
          />
        </div>
      </div>

      {/* Conversation Detail */}
      <div className="flex-1 flex flex-col">
        <ConversationDetail conversationId={selectedConversationId} />
      </div>
    </div>
  );
}

