"use client";

import { useState } from "react";
import { UI } from "@/lib/copy/uiStrings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Plus, MoreHorizontal, Phone, Mail, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  company?: string;
  status: "prospect" | "client" | "lost";
  lastContactAt?: Date;
}

const mockContacts: Contact[] = [];

const statusConfig = {
  prospect: { label: UI.contacts.status.prospect, variant: "secondary" as const },
  client: { label: UI.contacts.status.client, variant: "default" as const },
  lost: { label: UI.contacts.status.lost, variant: "destructive" as const },
};

export function ContactsView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredContacts = mockContacts.filter((contact) => {
    if (statusFilter !== "all" && contact.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        contact.firstName?.toLowerCase().includes(query) ||
        contact.lastName?.toLowerCase().includes(query) ||
        contact.phone?.includes(query) ||
        contact.email?.toLowerCase().includes(query) ||
        contact.company?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={UI.common.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
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

        <Button className="ml-auto">
          <Plus className="h-4 w-4 mr-2" />
          {UI.contacts.addNew}
        </Button>
      </div>

      {/* Contacts Table */}
      <Card>
        <CardContent className="p-0">
          {filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="font-medium text-muted-foreground">
                {UI.common.noResults}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Agrega tu primer cliente para empezar
              </p>
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                {UI.contacts.addNew}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{UI.contacts.fields.name}</TableHead>
                  <TableHead>{UI.contacts.fields.phone}</TableHead>
                  <TableHead>{UI.contacts.fields.email}</TableHead>
                  <TableHead>{UI.contacts.fields.company}</TableHead>
                  <TableHead>{UI.contacts.fields.status}</TableHead>
                  <TableHead>{UI.contacts.fields.lastContact}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {`${contact.firstName?.[0] || ""}${contact.lastName?.[0] || ""}`.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {contact.firstName} {contact.lastName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {contact.phone && (
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {contact.phone}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {contact.email && (
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {contact.email}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{contact.company}</TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[contact.status].variant}>
                        {statusConfig[contact.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {contact.lastContactAt?.toLocaleDateString("es-MX")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>{UI.common.edit}</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            {UI.common.delete}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

