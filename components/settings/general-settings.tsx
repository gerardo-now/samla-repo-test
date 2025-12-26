"use client";

import { UI } from "@/lib/copy/uiStrings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const timezones = [
  { value: "America/Mexico_City", label: "Ciudad de México (GMT-6)" },
  { value: "America/Monterrey", label: "Monterrey (GMT-6)" },
  { value: "America/Tijuana", label: "Tijuana (GMT-8)" },
  { value: "America/Bogota", label: "Bogotá (GMT-5)" },
  { value: "America/Lima", label: "Lima (GMT-5)" },
  { value: "America/Santiago", label: "Santiago (GMT-4)" },
  { value: "America/Buenos_Aires", label: "Buenos Aires (GMT-3)" },
  { value: "Europe/Madrid", label: "Madrid (GMT+1)" },
];

export function GeneralSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{UI.settings.general.workspace}</CardTitle>
          <CardDescription>
            Configura la información básica de tu espacio de trabajo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">{UI.settings.general.name}</Label>
              <Input id="name" placeholder="Mi empresa" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">{UI.settings.general.timezone}</Label>
              <Select defaultValue="America/Mexico_City">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button>{UI.common.save}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

