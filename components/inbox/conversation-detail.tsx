"use client";

import { UI } from "@/lib/copy/uiStrings";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Video,
  MoreVertical,
  Send,
  Paperclip,
  Calendar,
  User,
  Clock,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ConversationDetailProps {
  conversationId: string | null;
}

interface Message {
  id: string;
  content: string;
  direction: "inbound" | "outbound";
  senderType: "contact" | "agent" | "user" | "system";
  timestamp: Date;
  status?: "sent" | "delivered" | "read";
}

export function ConversationDetail({ conversationId }: ConversationDetailProps) {
  if (!conversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <MessageSquare className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">Selecciona una conversación</h3>
        <p className="text-muted-foreground mt-1">
          Elige una conversación de la lista para ver los mensajes
        </p>
      </div>
    );
  }

  const messages: Message[] = [];

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>??</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">Contacto</h3>
            <p className="text-sm text-muted-foreground">+52 ...</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Calendar className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground">
              No hay mensajes en esta conversación
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.direction === "outbound" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[70%] rounded-lg px-4 py-2",
                    message.direction === "outbound"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {message.senderType === "agent" && (
                    <Badge variant="outline" className="mb-1 text-xs">
                      {UI.inbox.message.agent}
                    </Badge>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <div
                    className={cn(
                      "flex items-center gap-1 mt-1 text-xs",
                      message.direction === "outbound"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    )}
                  >
                    <Clock className="h-3 w-3" />
                    <span>
                      {message.timestamp.toLocaleTimeString("es-MX", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-end gap-2">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Textarea
            placeholder="Escribe un mensaje..."
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
          />
          <Button size="icon" className="shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

