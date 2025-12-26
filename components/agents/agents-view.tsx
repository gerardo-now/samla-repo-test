"use client";

import { useState, useEffect, useCallback } from "react";
import { UI } from "@/lib/copy/uiStrings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Bot, MoreVertical, Pencil, Trash2, Power, PowerOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AgentEditor } from "@/components/agents/agent-editor";
import { toast } from "sonner";

interface Agent {
  id: string;
  name: string;
  template: "sales" | "support" | "collections" | "custom";
  tone: string;
  language?: string;
  isActive: boolean;
  voiceId?: string;
  conversationCount: number;
  createdAt: string;
}

const templateConfig = {
  sales: { label: UI.agents.templates.sales, color: "bg-green-500/10 text-green-700" },
  support: { label: UI.agents.templates.support, color: "bg-blue-500/10 text-blue-700" },
  collections: { label: UI.agents.templates.collections, color: "bg-orange-500/10 text-orange-700" },
  custom: { label: UI.agents.templates.custom, color: "bg-purple-500/10 text-purple-700" },
};

const toneLabels: Record<string, string> = {
  professional: "Profesional",
  friendly: "Amigable",
  formal: "Formal",
  casual: "Casual",
};

export function AgentsView() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [deleteAgent, setDeleteAgent] = useState<Agent | null>(null);

  // Fetch agents
  const fetchAgents = useCallback(async () => {
    try {
      const response = await fetch("/api/agents");
      const data = await response.json();
      if (data.success) {
        setAgents(data.agents);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleCreateAgent = () => {
    setEditingAgent(null);
    setIsEditorOpen(true);
  };

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent);
    setIsEditorOpen(true);
  };

  const handleDeleteAgent = async () => {
    if (!deleteAgent) return;

    try {
      const response = await fetch(`/api/agents?id=${deleteAgent.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Agente eliminado");
        fetchAgents();
      } else {
        toast.error(data.error || "Error al eliminar");
      }
    } catch (error) {
      console.error("Error deleting agent:", error);
      toast.error("Error al eliminar el agente");
    } finally {
      setDeleteAgent(null);
    }
  };

  const handleToggleActive = async (agent: Agent) => {
    try {
      const response = await fetch("/api/agents", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: agent.id,
          isActive: !agent.isActive,
        }),
      });
      const data = await response.json();

      if (data.success) {
        toast.success(agent.isActive ? "Agente desactivado" : "Agente activado");
        fetchAgents();
      } else {
        toast.error(data.error || "Error al actualizar");
      }
    } catch (error) {
      console.error("Error toggling agent:", error);
      toast.error("Error al actualizar el agente");
    }
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    fetchAgents(); // Refresh list
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Empty State or Grid */}
      {agents.length === 0 ? (
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

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <Card
                key={agent.id}
                className={cn(
                  "transition-all hover:shadow-md",
                  !agent.isActive && "opacity-60"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">{agent.name}</h3>
                        <Badge
                          variant="secondary"
                          className={cn("mt-1 text-xs", templateConfig[agent.template]?.color)}
                        >
                          {templateConfig[agent.template]?.label || agent.template}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditAgent(agent)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(agent)}>
                          {agent.isActive ? (
                            <>
                              <PowerOff className="h-4 w-4 mr-2" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <Power className="h-4 w-4 mr-2" />
                              Activar
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteAgent(agent)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Estado:</span>
                      <Badge variant={agent.isActive ? "default" : "secondary"} className="text-xs">
                        {agent.isActive ? UI.common.active : UI.common.inactive}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tono:</span>
                      <span className="font-medium text-foreground">
                        {toneLabels[agent.tone] || agent.tone}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Conversaciones:</span>
                      <span className="font-medium text-foreground">{agent.conversationCount || 0}</span>
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
            onSave={handleEditorClose}
            onCancel={() => setIsEditorOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteAgent} onOpenChange={() => setDeleteAgent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar agente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El agente &quot;{deleteAgent?.name}&quot; será eliminado
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAgent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
