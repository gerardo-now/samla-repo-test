"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  Trash2,
  Pencil,
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
  borderColor: string;
}

const columns: KanbanColumn[] = [
  { 
    id: "prospect", 
    title: "Prospectos", 
    color: "text-amber-700 dark:text-amber-400", 
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800"
  },
  { 
    id: "client", 
    title: "Clientes", 
    color: "text-emerald-700 dark:text-emerald-400", 
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800"
  },
  { 
    id: "lost", 
    title: "Perdidos", 
    color: "text-rose-700 dark:text-rose-400", 
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
    borderColor: "border-rose-200 dark:border-rose-800"
  },
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
  
  // Drag state
  const [draggedContact, setDraggedContact] = useState<Contact | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragImageRef = useRef<HTMLDivElement>(null);

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
  const handleDragStart = (e: React.DragEvent, contact: Contact) => {
    setDraggedContact(contact);
    setIsDragging(true);
    
    // Custom drag image
    if (dragImageRef.current) {
      e.dataTransfer.setDragImage(dragImageRef.current, 0, 0);
    }
    
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", contact.id);
  };

  const handleDragEnd = () => {
    setDraggedContact(null);
    setDragOverColumn(null);
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only reset if leaving the column entirely
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    
    if (!draggedContact || draggedContact.status === columnId) {
      handleDragEnd();
      return;
    }

    // Optimistic update
    const oldStatus = draggedContact.status;
    const contactToMove = draggedContact;
    
    setContacts(prev =>
      prev.map(c =>
        c.id === contactToMove.id ? { ...c, status: columnId as Contact["status"] } : c
      )
    );

    handleDragEnd();

    try {
      const response = await fetch("/api/contacts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: contactToMove.id,
          status: columnId,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        // Revert on error
        setContacts(prev =>
          prev.map(c =>
            c.id === contactToMove.id ? { ...c, status: oldStatus } : c
          )
        );
        toast.error("Error al mover el contacto");
      } else {
        const columnName = columns.find(c => c.id === columnId)?.title;
        toast.success(`Movido a ${columnName}`);
      }
    } catch {
      // Revert on error
      setContacts(prev =>
        prev.map(c =>
          c.id === contactToMove.id ? { ...c, status: oldStatus } : c
        )
      );
      toast.error("Error al mover el contacto");
    }
  };

  const handleContactClick = (contact: Contact) => {
    if (!isDragging) {
      setSelectedContact(contact);
      setIsDetailOpen(true);
    }
  };

  const handleAddContact = () => {
    setEditingContact(null);
    setIsEditorOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setIsEditorOpen(true);
  };

  const handleDeleteContact = async (contact: Contact) => {
    try {
      const response = await fetch(`/api/contacts?id=${contact.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        setContacts(prev => prev.filter(c => c.id !== contact.id));
        toast.success("Contacto eliminado");
      } else {
        toast.error("Error al eliminar");
      }
    } catch {
      toast.error("Error al eliminar el contacto");
    }
  };

  const handleContactSaved = () => {
    setIsEditorOpen(false);
    fetchContacts();
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
      {/* Hidden drag image */}
      <div 
        ref={dragImageRef} 
        className="fixed -left-[9999px] bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium shadow-lg"
      >
        {draggedContact ? `${draggedContact.firstName} ${draggedContact.lastName}` : ""}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar contactos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>

        <div className="flex items-center gap-2 sm:ml-auto">
          {/* View Toggle - Notion Style */}
          <div className="flex bg-muted rounded-md p-0.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange("kanban")}
              className={cn(
                "h-7 px-2.5 rounded-sm transition-all",
                viewMode === "kanban" 
                  ? "bg-background shadow-sm text-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-transparent"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewModeChange("table")}
              className={cn(
                "h-7 px-2.5 rounded-sm transition-all",
                viewMode === "table" 
                  ? "bg-background shadow-sm text-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-transparent"
              )}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={handleAddContact} size="sm" className="h-8">
            <Plus className="h-4 w-4 mr-1.5" />
            Nuevo
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <ScrollArea className="w-full -mx-4 px-4">
        <div className="flex gap-3 pb-4">
          {columns.map((column) => {
            const columnContacts = getContactsByStatus(column.id);
            const isDropTarget = dragOverColumn === column.id && draggedContact?.status !== column.id;
            
            return (
              <div
                key={column.id}
                className={cn(
                  "flex-shrink-0 w-72 md:w-80 rounded-lg transition-all duration-200",
                  "bg-muted/40 dark:bg-muted/20",
                  isDropTarget && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                )}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column Header */}
                <div className={cn(
                  "px-3 py-2.5 flex items-center justify-between rounded-t-lg",
                  column.bgColor
                )}>
                  <div className="flex items-center gap-2">
                    <span className={cn("font-medium text-sm", column.color)}>
                      {column.title}
                    </span>
                    <span className="text-xs text-muted-foreground bg-background/60 px-1.5 py-0.5 rounded">
                      {columnContacts.length}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={handleAddContact}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Column Content */}
                <div className={cn(
                  "p-1.5 space-y-1.5 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto",
                  "transition-colors duration-200",
                  isDropTarget && "bg-primary/5"
                )}>
                  {columnContacts.length === 0 ? (
                    <div className={cn(
                      "flex items-center justify-center h-24 rounded-md border-2 border-dashed",
                      "text-muted-foreground text-sm transition-colors",
                      isDropTarget 
                        ? "border-primary/50 bg-primary/10" 
                        : "border-muted-foreground/20"
                    )}>
                      {isDropTarget ? "Soltar aquí" : "Sin contactos"}
                    </div>
                  ) : (
                    columnContacts.map((contact) => (
                      <ContactCard
                        key={contact.id}
                        contact={contact}
                        isDragging={draggedContact?.id === contact.id}
                        onDragStart={(e) => handleDragStart(e, contact)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleContactClick(contact)}
                        onEdit={() => handleEditContact(contact)}
                        onDelete={() => handleDeleteContact(contact)}
                      />
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

// Contact Card Component
interface ContactCardProps {
  contact: Contact;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function ContactCard({
  contact,
  isDragging,
  onDragStart,
  onDragEnd,
  onClick,
  onEdit,
  onDelete,
}: ContactCardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn(
        "group bg-background rounded-md border shadow-sm cursor-pointer",
        "transition-all duration-150",
        "hover:shadow-md hover:border-primary/30",
        "active:scale-[0.98] active:shadow-sm",
        isDragging && "opacity-40 scale-95 rotate-1"
      )}
    >
      <div className="p-3">
        <div className="flex items-start gap-2">
          {/* Drag Handle */}
          <div 
            className={cn(
              "mt-1 cursor-grab active:cursor-grabbing",
              "opacity-0 group-hover:opacity-100 transition-opacity",
              "-ml-1"
            )}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground/50" />
          </div>

          {/* Avatar & Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className="text-[10px] font-medium bg-primary/10 text-primary">
                  {`${contact.firstName?.[0] || ""}${contact.lastName?.[0] || ""}`.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate leading-tight">
                  {contact.firstName} {contact.lastName}
                </p>
                {contact.company && (
                  <p className="text-xs text-muted-foreground truncate leading-tight">
                    {contact.company}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Details */}
            {(contact.phone || contact.email) && (
              <div className="mt-2 space-y-0.5">
                {contact.phone && (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Phone className="h-3 w-3 shrink-0" />
                    <span className="truncate">{contact.phone}</span>
                  </p>
                )}
                {contact.email && (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </p>
                )}
              </div>
            )}

            {/* Activity Badges */}
            {((contact.commentsCount ?? 0) > 0 || (contact.tasksCount ?? 0) > 0) && (
              <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                {(contact.commentsCount ?? 0) > 0 && (
                  <span className="flex items-center gap-1 bg-muted/50 px-1.5 py-0.5 rounded">
                    <MessageSquare className="h-3 w-3" />
                    {contact.commentsCount}
                  </span>
                )}
                {(contact.tasksCount ?? 0) > 0 && (
                  <span className="flex items-center gap-1 bg-muted/50 px-1.5 py-0.5 rounded">
                    <CheckSquare className="h-3 w-3" />
                    {contact.pendingTasksCount ?? 0}/{contact.tasksCount}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-6 w-6 shrink-0",
                  "opacity-0 group-hover:opacity-100 transition-opacity"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                <Pencil className="h-3.5 w-3.5 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
