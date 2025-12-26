"use client";

import { useState } from "react";
import { UI } from "@/lib/copy/uiStrings";
import { ConversationList } from "@/components/inbox/conversation-list";
import { ConversationDetail } from "@/components/inbox/conversation-detail";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MessageSquare, Phone, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type ChannelFilter = "all" | "whatsapp" | "phone";
type StatusFilter = "all" | "open" | "closed";

export function InboxView() {
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Mobile: show detail view when conversation is selected
  const showDetail = selectedConversationId !== null;

  return (
    <div className="flex h-full">
      {/* Conversation List Sidebar */}
      <div
        className={cn(
          "w-full md:w-80 border-r border-border flex flex-col bg-background",
          showDetail && "hidden md:flex"
        )}
      >
        {/* Filters */}
        <div className="p-3 md:p-4 space-y-3 md:space-y-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={UI.common.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
            />
          </div>

          {/* Channel Filter */}
          <div className="flex gap-1">
            <button
              onClick={() => setChannelFilter("all")}
              className={cn(
                "flex-1 px-2 md:px-3 py-2 text-xs font-medium rounded-md transition-colors",
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
                "flex-1 px-2 md:px-3 py-2 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1",
                channelFilter === "whatsapp"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <MessageSquare className="h-3 w-3" />
              <span className="hidden sm:inline">{UI.inbox.channels.whatsapp}</span>
            </button>
            <button
              onClick={() => setChannelFilter("phone")}
              className={cn(
                "flex-1 px-2 md:px-3 py-2 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1",
                channelFilter === "phone"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <Phone className="h-3 w-3" />
              <span className="hidden sm:inline">{UI.inbox.channels.phone}</span>
            </button>
          </div>

          {/* Status Filter */}
          <Tabs
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1 text-xs md:text-sm">
                {UI.inbox.tabs.all}
              </TabsTrigger>
              <TabsTrigger value="open" className="flex-1 text-xs md:text-sm">
                {UI.inbox.tabs.open}
              </TabsTrigger>
              <TabsTrigger value="closed" className="flex-1 text-xs md:text-sm">
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
      <div
        className={cn(
          "flex-1 flex flex-col",
          !showDetail && "hidden md:flex"
        )}
      >
        {/* Mobile back button */}
        {showDetail && (
          <div className="md:hidden p-3 border-b border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedConversationId(null)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </div>
        )}
        <ConversationDetail conversationId={selectedConversationId} />
      </div>
    </div>
  );
}
