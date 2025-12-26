"use client";

import { UI } from "@/lib/copy/uiStrings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Phone, Link2, Unlink } from "lucide-react";
import { cn } from "@/lib/utils";

interface Channel {
  id: string;
  type: "whatsapp" | "phone";
  name: string;
  isConnected: boolean;
  details?: string;
}

const channels: Channel[] = [
  {
    id: "whatsapp",
    type: "whatsapp",
    name: UI.inbox.channels.whatsapp,
    isConnected: false,
  },
  {
    id: "phone",
    type: "phone",
    name: UI.inbox.channels.phone,
    isConnected: false,
  },
];

const channelIcons = {
  whatsapp: MessageSquare,
  phone: Phone,
};

const channelColors = {
  whatsapp: "text-green-600 bg-green-500/10",
  phone: "text-blue-600 bg-blue-500/10",
};

export function ChannelsSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Canales de comunicación</CardTitle>
          <CardDescription>
            Conecta los canales por los que te comunicas con tus clientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {channels.map((channel) => {
            const Icon = channelIcons[channel.type];
            return (
              <div
                key={channel.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      channelColors[channel.type]
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-medium">{channel.name}</p>
                    {channel.details && (
                      <p className="text-sm text-muted-foreground">
                        {channel.details}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant={channel.isConnected ? "default" : "secondary"}>
                    {channel.isConnected ? "Conectado" : "Desconectado"}
                  </Badge>
                  <Button variant={channel.isConnected ? "outline" : "default"}>
                    {channel.isConnected ? (
                      <>
                        <Unlink className="h-4 w-4 mr-2" />
                        Desconectar
                      </>
                    ) : (
                      <>
                        <Link2 className="h-4 w-4 mr-2" />
                        Conectar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

