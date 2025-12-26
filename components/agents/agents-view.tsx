"use client";

import { useState } from "react";
import { UI } from "@/lib/copy/uiStrings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Bot, MessageSquare, Calendar, Tag, ClipboardList, Play, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { AgentEditor } from "@/components/agents/agent-editor";

interface Agent {
  id: string;
  name: string;
  template: "sales" | "support" | "collections" | "custom";
  tone: string;
  isActive: boolean;
  voiceName?: string;
  conversationCount: number;
}

const mockAgents: Agent[] = [];

const templateConfig = {
  sales: { label: UI.agents.templates.sales, color: "bg-green-500/10 text-green-700" },
  support: { label: UI.agents.templates.support, color: "bg-blue-500/10 text-blue-700" },
  collections: { label: UI.agents.templates.collections, color: "bg-orange-500/10 text-orange-700" },
  custom: { label: UI.agents.templates.custom, color: "bg-purple-500/10 text-purple-700" },
};

const toolIcons = {
  sendWhatsapp: MessageSquare,
  scheduleMeeting: Calendar,
  createTask: ClipboardList,
  tagContact: Tag,
};

export function AgentsView() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const handleCreateAgent = () => {
    setEditingAgent(null);
    setIsEditorOpen(true);
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setIsEditorOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Empty State or Grid */}
      {mockAgents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium">Crea tu primer agente</h3>
            <p className="text-muted-foreground mt-1 max-w-sm">
              Los agentes responden automáticamente a tus clientes por WhatsApp y llamadas
            </p>
            <Button className="mt-6" onClick={handleCreateAgent}>
              <Plus className="h-4 w-4 mr-2" />
              {UI.agents.addNew}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex justify-end">
            <Button onClick={handleCreateAgent}>
              <Plus className="h-4 w-4 mr-2" />
              {UI.agents.addNew}
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockAgents.map((agent) => (
              <Card
                key={agent.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  !agent.isActive && "opacity-60"
                )}
                onClick={() => handleEditAgent(agent)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{agent.name}</CardTitle>
                        <Badge
                          variant="secondary"
                          className={cn("mt-1 text-xs", templateConfig[agent.template].color)}
                        >
                          {templateConfig[agent.template].label}
                        </Badge>
                      </div>
                    </div>
                    <Badge variant={agent.isActive ? "default" : "secondary"}>
                      {agent.isActive ? UI.common.active : UI.common.inactive}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Tono:</span>
                      <span className="font-medium text-foreground">{agent.tone}</span>
                    </div>
                    {agent.voiceName && (
                      <div className="flex items-center justify-between">
                        <span>Voz:</span>
                        <span className="font-medium text-foreground">{agent.voiceName}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span>Conversaciones:</span>
                      <span className="font-medium text-foreground">{agent.conversationCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Agent Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAgent ? `Editar ${editingAgent.name}` : UI.agents.addNew}
            </DialogTitle>
            <DialogDescription>
              Configura cómo responderá tu agente a los clientes
            </DialogDescription>
          </DialogHeader>
          <AgentEditor
            agent={editingAgent}
            onSave={() => setIsEditorOpen(false)}
            onCancel={() => setIsEditorOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

