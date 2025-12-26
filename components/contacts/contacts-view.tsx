"use client";

import { useState, useEffect, useCallback } from "react";
import { UI } from "@/lib/copy/uiStrings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Search, Plus, MoreHorizontal, Phone, Mail, Users, Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  company?: string;
  status: "prospect" | "client" | "lost";
  lastContactAt?: string;
}

const statusConfig = {
  prospect: { label: UI.contacts.status.prospect, variant: "secondary" as const },
  client: { label: UI.contacts.status.client, variant: "default" as const },
  lost: { label: UI.contacts.status.lost, variant: "destructive" as const },
};

export function ContactsView() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Dialog states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deleteContact, setDeleteContact] = useState<Contact | null>(null);

  // Form states
  const [formFirstName, setFormFirstName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formStatus, setFormStatus] = useState<"prospect" | "client" | "lost">("prospect");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
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
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchContacts();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchContacts]);

  const handleOpenEditor = (contact?: Contact) => {
    if (contact) {
      setEditingContact(contact);
      setFormFirstName(contact.firstName);
      setFormLastName(contact.lastName);
      setFormPhone(contact.phone || "");
      setFormEmail(contact.email || "");
      setFormCompany(contact.company || "");
      setFormStatus(contact.status);
    } else {
      setEditingContact(null);
      setFormFirstName("");
      setFormLastName("");
      setFormPhone("");
      setFormEmail("");
      setFormCompany("");
      setFormStatus("prospect");
    }
    setIsEditorOpen(true);
  };

  const handleSaveContact = async () => {
    if (!formFirstName.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    setIsSaving(true);
    try {
      const contactData = {
        id: editingContact?.id,
        firstName: formFirstName.trim(),
        lastName: formLastName.trim(),
        phone: formPhone.trim() || undefined,
        email: formEmail.trim() || undefined,
        company: formCompany.trim() || undefined,
        status: formStatus,
      };

      const response = await fetch("/api/contacts", {
        method: editingContact ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingContact ? "Contacto actualizado" : "Contacto creado");
        setIsEditorOpen(false);
        fetchContacts();
      } else {
        toast.error(data.error || "Error al guardar");
      }
    } catch (error) {
      console.error("Error saving contact:", error);
      toast.error("Error al guardar el contacto");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteContact = async () => {
    if (!deleteContact) return;

    try {
      const response = await fetch(`/api/contacts?id=${deleteContact.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Contacto eliminado");
        fetchContacts();
      } else {
        toast.error(data.error || "Error al eliminar");
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("Error al eliminar el contacto");
    } finally {
      setDeleteContact(null);
    }
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
            placeholder={UI.common.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {["all", "prospect", "client", "lost"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status === "all"
                ? UI.common.all
                : statusConfig[status as keyof typeof statusConfig].label}
            </Button>
          ))}
        </div>

        <Button className="sm:ml-auto" onClick={() => handleOpenEditor()}>
          <Plus className="h-4 w-4 mr-2" />
          {UI.contacts.addNew}
        </Button>
      </div>

      {/* Contacts Table */}
      <Card>
        <CardContent className="p-0">
          {contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="font-medium text-muted-foreground">
                {searchQuery || statusFilter !== "all" ? UI.common.noResults : "Sin contactos"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Agrega tu primer cliente para empezar
              </p>
              <Button className="mt-4" onClick={() => handleOpenEditor()}>
                <Plus className="h-4 w-4 mr-2" />
                {UI.contacts.addNew}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{UI.contacts.fields.name}</TableHead>
                    <TableHead className="hidden md:table-cell">{UI.contacts.fields.phone}</TableHead>
                    <TableHead className="hidden lg:table-cell">{UI.contacts.fields.email}</TableHead>
                    <TableHead className="hidden xl:table-cell">{UI.contacts.fields.company}</TableHead>
                    <TableHead>{UI.contacts.fields.status}</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow key={contact.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {`${contact.firstName?.[0] || ""}${contact.lastName?.[0] || ""}`.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium">
                              {contact.firstName} {contact.lastName}
                            </span>
                            <div className="md:hidden text-xs text-muted-foreground">
                              {contact.phone}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {contact.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {contact.phone}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {contact.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {contact.email}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">{contact.company}</TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[contact.status].variant}>
                          {statusConfig[contact.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenEditor(contact)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              {UI.common.edit}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteContact(contact)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {UI.common.delete}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingContact ? "Editar contacto" : "Nuevo contacto"}
            </DialogTitle>
            <DialogDescription>
              {editingContact ? "Actualiza la información del contacto" : "Agrega un nuevo contacto a tu CRM"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre *</Label>
                <Input
                  id="firstName"
                  value={formFirstName}
                  onChange={(e) => setFormFirstName(e.target.value)}
                  placeholder="Juan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  value={formLastName}
                  onChange={(e) => setFormLastName(e.target.value)}
                  placeholder="Pérez"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+52 55 1234 5678"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="juan@empresa.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                value={formCompany}
                onChange={(e) => setFormCompany(e.target.value)}
                placeholder="Mi Empresa S.A."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={formStatus} onValueChange={(v) => setFormStatus(v as typeof formStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospect">{UI.contacts.status.prospect}</SelectItem>
                  <SelectItem value="client">{UI.contacts.status.client}</SelectItem>
                  <SelectItem value="lost">{UI.contacts.status.lost}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditorOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSaveContact} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteContact} onOpenChange={() => setDeleteContact(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar contacto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El contacto &quot;{deleteContact?.firstName} {deleteContact?.lastName}&quot; será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteContact}
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
