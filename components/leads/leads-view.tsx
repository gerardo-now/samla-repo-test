"use client";

import { useState } from "react";
import { UI } from "@/lib/copy/uiStrings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Building2,
  MapPin,
  List,
  Plus,
  Download,
  Users,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadList {
  id: string;
  name: string;
  leadCount: number;
  createdAt: Date;
}

const mockLists: LeadList[] = [];

export function LeadsView() {
  const [activeTab, setActiveTab] = useState("b2b");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList>
        <TabsTrigger value="b2b" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          {UI.leads.b2b.title}
        </TabsTrigger>
        <TabsTrigger value="maps" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {UI.leads.maps.title}
        </TabsTrigger>
        <TabsTrigger value="lists" className="flex items-center gap-2">
          <List className="h-4 w-4" />
          {UI.leads.lists.title}
        </TabsTrigger>
      </TabsList>

      {/* B2B Search */}
      <TabsContent value="b2b" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{UI.leads.b2b.title}</CardTitle>
            <CardDescription>
              Busca empresas por industria, tamaño, ubicación y más
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar empresas (ej: tecnología, finanzas...)"
                  className="pl-9"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button>
                <Search className="h-4 w-4 mr-2" />
                {UI.leads.b2b.search}
              </Button>
            </div>

            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Ingresa criterios de búsqueda para encontrar empresas</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Maps Search */}
      <TabsContent value="maps" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{UI.leads.maps.title}</CardTitle>
            <CardDescription>
              Encuentra negocios locales por ubicación y categoría
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tipo de negocio (ej: restaurantes, gimnasios...)"
                  className="pl-9"
                />
              </div>
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ubicación (ej: CDMX, Monterrey...)"
                  className="pl-9"
                />
              </div>
              <Button>
                <Search className="h-4 w-4 mr-2" />
                {UI.leads.maps.search}
              </Button>
            </div>

            <div className="text-center py-12 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Ingresa tipo de negocio y ubicación para buscar</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Saved Lists */}
      <TabsContent value="lists" className="space-y-6">
        <div className="flex justify-end">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {UI.leads.lists.create}
          </Button>
        </div>

        {mockLists.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <List className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium">No hay listas guardadas</h3>
              <p className="text-muted-foreground mt-1 max-w-sm">
                Busca leads y guárdalos en listas para usarlos en campañas
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockLists.map((list) => (
              <Card key={list.id} className="cursor-pointer hover:shadow-md transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{list.name}</CardTitle>
                    <Badge variant="secondary">{list.leadCount} leads</Badge>
                  </div>
                  <CardDescription>
                    Creada {list.createdAt.toLocaleDateString("es-MX")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Users className="h-4 w-4 mr-2" />
                      {UI.leads.import}
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      {UI.common.export}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

