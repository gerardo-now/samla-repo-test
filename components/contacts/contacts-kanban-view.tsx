"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  MoreHorizontal,
  Phone,
  Mail,
  Building2,
  GripVertical,
  MessageSquare,
  CheckSquare,
  Loader2,
  LayoutGrid,
  List,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ContactDetailPanel } from "./contact-detail-panel";
import { ContactEditorDialog } from "./contact-editor-dialog";

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  company?: string;
  status: "prospect" | "client" | "lost";
  lastContactAt?: string;
  commentsCount?: number;
  tasksCount?: number;
  pendingTasksCount?: number;
}

interface KanbanColumn {
  id: "prospect" | "client" | "lost";
  title: string;
  color: string;
  bgColor: string;
}

const columns: KanbanColumn[] = [
  { id: "prospect", title: "Prospectos", color: "text-amber-600", bgColor: "bg-amber-500/10" },
  { id: "client", title: "Clientes", color: "text-green-600", bgColor: "bg-green-500/10" },
  { id: "lost", title: "Perdidos", color: "text-red-600", bgColor: "bg-red-500/10" },
];

interface ContactsKanbanViewProps {
  viewMode: "kanban" | "table";
  onViewModeChange: (mode: "kanban" | "table") => void;
}

export function ContactsKanbanView({ viewMode, onViewModeChange }: ContactsKanbanViewProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [draggedContact, setDraggedContact] = useState<Contact | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);

      const response = await fetch(`/api/contacts?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchContacts();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchContacts]);

  // Drag and drop handlers
  const handleDragStart = (contact: Contact) => {
    setDraggedContact(contact);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (columnId: string) => {
    if (!draggedContact || draggedContact.status === columnId) {
      setDraggedContact(null);
      setDragOverColumn(null);
      return;
    }

    // Optimistic update
    const oldStatus = draggedContact.status;
    setContacts(prev =>
      prev.map(c =>
        c.id === draggedContact.id ? { ...c, status: columnId as Contact["status"] } : c
      )
    );

    try {
      const response = await fetch("/api/contacts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: draggedContact.id,
          status: columnId,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        // Revert on error
        setContacts(prev =>
          prev.map(c =>
            c.id === draggedContact.id ? { ...c, status: oldStatus } : c
          )
        );
        toast.error("Error al mover el contacto");
      } else {
        toast.success(`Movido a ${columns.find(c => c.id === columnId)?.title}`);
      }
    } catch (error) {
      // Revert on error
      setContacts(prev =>
        prev.map(c =>
          c.id === draggedContact.id ? { ...c, status: oldStatus } : c
        )
      );
      toast.error("Error al mover el contacto");
    }

    setDraggedContact(null);
    setDragOverColumn(null);
  };

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDetailOpen(true);
  };

  const handleAddContact = (status?: Contact["status"]) => {
    setEditingContact(null);
    setIsEditorOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setIsEditorOpen(true);
  };

  const handleContactSaved = () => {
    setIsEditorOpen(false);
    fetchContacts();
    if (selectedContact) {
      // Refresh selected contact
      fetchContacts();
    }
  };

  const handleContactUpdated = (updatedContact: Contact) => {
    setContacts(prev =>
      prev.map(c => (c.id === updatedContact.id ? updatedContact : c))
    );
    if (selectedContact?.id === updatedContact.id) {
      setSelectedContact(updatedContact);
    }
  };

  const getContactsByStatus = (status: string) => {
    return contacts.filter(c => c.status === status);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar contactos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            <Button
              variant={viewMode === "kanban" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("kanban")}
              className="rounded-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange("table")}
              className="rounded-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={() => handleAddContact()}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo contacto
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4 min-w-max">
          {columns.map((column) => {
            const columnContacts = getContactsByStatus(column.id);
            return (
              <div
                key={column.id}
                className={cn(
                  "flex-shrink-0 w-80 rounded-xl border transition-all",
                  dragOverColumn === column.id
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border bg-muted/30"
                )}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(column.id)}
              >
                {/* Column Header */}
                <div className={cn("p-3 border-b flex items-center justify-between", column.bgColor)}>
                  <div className="flex items-center gap-2">
                    <span className={cn("font-semibold", column.color)}>{column.title}</span>
                    <Badge variant="secondary" className="text-xs">
                      {columnContacts.length}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleAddContact(column.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Column Content */}
                <div className="p-2 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
                  {columnContacts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Arrastra contactos aquí
                    </div>
                  ) : (
                    columnContacts.map((contact) => (
                      <div
                        key={contact.id}
                        draggable
                        onDragStart={() => handleDragStart(contact)}
                        onClick={() => handleContactClick(contact)}
                        className={cn(
                          "group bg-background rounded-lg border p-3 cursor-pointer transition-all hover:shadow-md hover:border-primary/50",
                          draggedContact?.id === contact.id && "opacity-50 scale-95"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8 shrink-0">
                                <AvatarFallback className="text-xs">
                                  {`${contact.firstName?.[0] || ""}${contact.lastName?.[0] || ""}`.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {contact.firstName} {contact.lastName}
                                </p>
                                {contact.company && (
                                  <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                                    <Building2 className="h-3 w-3 shrink-0" />
                                    {contact.company}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Contact info */}
                            <div className="mt-2 space-y-1">
                              {contact.phone && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {contact.phone}
                                </p>
                              )}
                              {contact.email && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                                  <Mail className="h-3 w-3 shrink-0" />
                                  {contact.email}
                                </p>
                              )}
                            </div>

                            {/* Activity indicators */}
                            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                              {(contact.commentsCount ?? 0) > 0 && (
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="h-3 w-3" />
                                  {contact.commentsCount}
                                </span>
                              )}
                              {(contact.tasksCount ?? 0) > 0 && (
                                <span className="flex items-center gap-1">
                                  <CheckSquare className="h-3 w-3" />
                                  {contact.pendingTasksCount ?? 0}/{contact.tasksCount}
                                </span>
                              )}
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleEditContact(contact);
                              }}>
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Contact Detail Panel */}
      <ContactDetailPanel
        contact={selectedContact}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedContact(null);
        }}
        onContactUpdated={handleContactUpdated}
        onRefresh={fetchContacts}
      />

      {/* Contact Editor Dialog */}
      <ContactEditorDialog
        contact={editingContact}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSaved={handleContactSaved}
      />
    </div>
  );
}

