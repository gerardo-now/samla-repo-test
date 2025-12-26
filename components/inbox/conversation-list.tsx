"use client";

import { UI } from "@/lib/copy/uiStrings";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Phone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface ConversationListProps {
  channelFilter: "all" | "whatsapp" | "phone";
  statusFilter: "all" | "open" | "closed";
  searchQuery: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

interface ConversationPreview {
  id: string;
  contactName: string;
  contactPhone?: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
  channel: "whatsapp" | "phone";
  status: "open" | "closed";
}

const mockConversations: ConversationPreview[] = [];

export function ConversationList({
  channelFilter,
  statusFilter,
  searchQuery,
  selectedId,
  onSelect,
}: ConversationListProps) {
  const filteredConversations = mockConversations.filter((conv) => {
    if (channelFilter !== "all" && conv.channel !== channelFilter) return false;
    if (statusFilter !== "all" && conv.status !== statusFilter) return false;
    if (
      searchQuery &&
      !conv.contactName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !conv.contactPhone?.includes(searchQuery)
    ) {
      return false;
    }
    return true;
  });

  if (filteredConversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="font-medium text-muted-foreground">{UI.inbox.empty}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {UI.inbox.emptySubtitle}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {filteredConversations.map((conv) => (
        <button
          key={conv.id}
          onClick={() => onSelect(conv.id)}
          className={cn(
            "w-full flex items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50",
            selectedId === conv.id && "bg-muted"
          )}
        >
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback className="text-sm">
              {conv.contactName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium truncate">{conv.contactName}</span>
              <span className="text-xs text-muted-foreground shrink-0">
                {formatDistanceToNow(conv.lastMessageAt, {
                  addSuffix: false,
                  locale: es,
                })}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              {conv.channel === "whatsapp" ? (
                <MessageSquare className="h-3 w-3 text-green-600 shrink-0" />
              ) : (
                <Phone className="h-3 w-3 text-blue-600 shrink-0" />
              )}
              <p className="text-sm text-muted-foreground truncate">
                {conv.lastMessage}
              </p>
            </div>
          </div>

          {conv.unreadCount > 0 && (
            <Badge variant="default" className="shrink-0 h-5 min-w-5 px-1.5">
              {conv.unreadCount}
            </Badge>
          )}
        </button>
      ))}
    </div>
  );
}

