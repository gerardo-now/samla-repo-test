"use client";

import { UI } from "@/lib/copy/uiStrings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Phone, Check, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CallerId {
  id: string;
  phoneNumber: string;
  friendlyName?: string;
  isVerified: boolean;
  isDefault: boolean;
}

const mockCallerIds: CallerId[] = [];

export function CallerIdSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{UI.settings.callerId.title}</CardTitle>
              <CardDescription>
                Configura los números telefónicos que aparecerán como remitente en llamadas salientes
              </CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {UI.settings.callerId.add}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {mockCallerIds.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay números configurados</p>
              <p className="text-sm mt-1">
                Agrega un número para usarlo en llamadas salientes
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {mockCallerIds.map((callerId) => (
                <div
                  key={callerId.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium font-mono">{callerId.phoneNumber}</p>
                      {callerId.friendlyName && (
                        <p className="text-sm text-muted-foreground">
                          {callerId.friendlyName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {callerId.isDefault && (
                      <Badge variant="default">
                        <Check className="h-3 w-3 mr-1" />
                        {UI.settings.callerId.default}
                      </Badge>
                    )}
                    <Badge variant={callerId.isVerified ? "default" : "secondary"}>
                      {callerId.isVerified ? "Verificado" : "Pendiente"}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!callerId.isDefault && (
                          <DropdownMenuItem>Hacer predeterminado</DropdownMenuItem>
                        )}
                        {!callerId.isVerified && (
                          <DropdownMenuItem>{UI.settings.callerId.verify}</DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-destructive">
                          {UI.common.delete}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

