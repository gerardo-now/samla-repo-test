"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Contact } from "./contacts-kanban-view";

interface ContactEditorDialogProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function ContactEditorDialog({
  contact,
  isOpen,
  onClose,
  onSaved,
}: ContactEditorDialogProps) {
  const [formFirstName, setFormFirstName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formStatus, setFormStatus] = useState<"prospect" | "client" | "lost">("prospect");
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when dialog opens/closes or contact changes
  useEffect(() => {
    if (isOpen) {
      if (contact) {
        setFormFirstName(contact.firstName);
        setFormLastName(contact.lastName);
        setFormPhone(contact.phone || "");
        setFormEmail(contact.email || "");
        setFormCompany(contact.company || "");
        setFormStatus(contact.status);
      } else {
        setFormFirstName("");
        setFormLastName("");
        setFormPhone("");
        setFormEmail("");
        setFormCompany("");
        setFormStatus("prospect");
      }
    }
  }, [isOpen, contact]);

  const handleSave = async () => {
    if (!formFirstName.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    setIsSaving(true);
    try {
      const contactData = {
        id: contact?.id,
        firstName: formFirstName.trim(),
        lastName: formLastName.trim(),
        phone: formPhone.trim() || undefined,
        email: formEmail.trim() || undefined,
        company: formCompany.trim() || undefined,
        status: formStatus,
      };

      const response = await fetch("/api/contacts", {
        method: contact ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(contact ? "Contacto actualizado" : "Contacto creado");
        onSaved();
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {contact ? "Editar contacto" : "Nuevo contacto"}
          </DialogTitle>
          <DialogDescription>
            {contact ? "Actualiza la información del contacto" : "Agrega un nuevo contacto a tu CRM"}
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
                <SelectItem value="prospect">Prospecto</SelectItem>
                <SelectItem value="client">Cliente</SelectItem>
                <SelectItem value="lost">Perdido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
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
  );
}

