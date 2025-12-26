"use client";

import { useState } from "react";
import { UI } from "@/lib/copy/uiStrings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Building2,
  MapPin,
  List,
  Plus,
  Download,
  Users,
  Filter,
  Loader2,
  Star,
  Phone,
  Globe,
  Linkedin,
  Mail,
  ExternalLink,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Types
interface B2BLead {
  id: string;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  company: {
    name: string;
    domain?: string;
    industry?: string;
    size?: string;
    location?: string;
  };
}

interface MapsLead {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
  placeUrl?: string;
}

interface LeadList {
  id: string;
  name: string;
  leadCount: number;
  createdAt: Date;
}

// Industry options
const industries = [
  { value: "technology", label: "Tecnología" },
  { value: "healthcare", label: "Salud" },
  { value: "finance", label: "Finanzas" },
  { value: "real_estate", label: "Inmobiliaria" },
  { value: "education", label: "Educación" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Manufactura" },
  { value: "legal", label: "Legal" },
  { value: "marketing", label: "Marketing" },
];

// Company size options
const companySizes = [
  { value: "1-10", label: "1-10 empleados" },
  { value: "11-50", label: "11-50 empleados" },
  { value: "51-200", label: "51-200 empleados" },
  { value: "201-500", label: "201-500 empleados" },
  { value: "501-1000", label: "501-1000 empleados" },
  { value: "1000+", label: "1000+ empleados" },
];

// Location presets for LATAM
const locationPresets = [
  { value: "Ciudad de México, México", label: "CDMX" },
  { value: "Monterrey, México", label: "Monterrey" },
  { value: "Guadalajara, México", label: "Guadalajara" },
  { value: "Bogotá, Colombia", label: "Bogotá" },
  { value: "Lima, Perú", label: "Lima" },
  { value: "Santiago, Chile", label: "Santiago" },
  { value: "Buenos Aires, Argentina", label: "Buenos Aires" },
  { value: "São Paulo, Brasil", label: "São Paulo" },
];

export function LeadsView() {
  const [activeTab, setActiveTab] = useState("b2b");
  
  // B2B Search State
  const [b2bQuery, setB2bQuery] = useState("");
  const [b2bIndustry, setB2bIndustry] = useState("");
  const [b2bSize, setB2bSize] = useState("");
  const [b2bLocation, setB2bLocation] = useState("");
  const [b2bLeads, setB2bLeads] = useState<B2BLead[]>([]);
  const [b2bLoading, setB2bLoading] = useState(false);
  const [b2bSelectedIds, setB2bSelectedIds] = useState<Set<string>>(new Set());

  // Maps Search State
  const [mapsQuery, setMapsQuery] = useState("");
  const [mapsLocation, setMapsLocation] = useState("");
  const [mapsLeads, setMapsLeads] = useState<MapsLead[]>([]);
  const [mapsLoading, setMapsLoading] = useState(false);
  const [mapsSelectedIds, setMapsSelectedIds] = useState<Set<string>>(new Set());

  // Lists State
  const [lists, setLists] = useState<LeadList[]>([]);

  // B2B Search Handler
  const handleB2BSearch = async () => {
    if (!b2bQuery && !b2bIndustry && !b2bLocation) {
      toast.error("Ingresa al menos un criterio de búsqueda");
      return;
    }

    setB2bLoading(true);
    try {
      const response = await fetch("/api/leads/search/b2b", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: b2bQuery,
          industries: b2bIndustry ? [b2bIndustry] : undefined,
          companySizes: b2bSize ? [b2bSize] : undefined,
          locations: b2bLocation ? [b2bLocation] : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setB2bLeads(data.leads);
        toast.success(`${data.leads.length} leads encontrados`);
      } else {
        toast.error(data.error || "Error en la búsqueda");
      }
    } catch (error) {
      console.error("B2B search error:", error);
      toast.error("Error al buscar leads");
    } finally {
      setB2bLoading(false);
    }
  };

  // Maps Search Handler
  const handleMapsSearch = async () => {
    if (!mapsQuery || !mapsLocation) {
      toast.error("Ingresa tipo de negocio y ubicación");
      return;
    }

    setMapsLoading(true);
    try {
      const response = await fetch("/api/leads/search/maps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchQuery: mapsQuery,
          location: mapsLocation,
          maxResults: 50,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMapsLeads(data.leads);
        toast.success(`${data.leads.length} negocios encontrados`);
      } else {
        toast.error(data.error || "Error en la búsqueda");
      }
    } catch (error) {
      console.error("Maps search error:", error);
      toast.error("Error al buscar negocios");
    } finally {
      setMapsLoading(false);
    }
  };

  // Selection handlers
  const toggleB2bSelection = (id: string) => {
    const newSelected = new Set(b2bSelectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setB2bSelectedIds(newSelected);
  };

  const toggleMapsSelection = (id: string) => {
    const newSelected = new Set(mapsSelectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setMapsSelectedIds(newSelected);
  };

  const selectAllB2b = () => {
    if (b2bSelectedIds.size === b2bLeads.length) {
      setB2bSelectedIds(new Set());
    } else {
      setB2bSelectedIds(new Set(b2bLeads.map(l => l.id)));
    }
  };

  const selectAllMaps = () => {
    if (mapsSelectedIds.size === mapsLeads.length) {
      setMapsSelectedIds(new Set());
    } else {
      setMapsSelectedIds(new Set(mapsLeads.map(l => l.id)));
    }
  };

  // Save to list handler
  const handleSaveToList = (type: "b2b" | "maps") => {
    const selectedCount = type === "b2b" ? b2bSelectedIds.size : mapsSelectedIds.size;
    if (selectedCount === 0) {
      toast.error("Selecciona al menos un lead");
      return;
    }
    
    // In production, this would open a dialog to create/select a list
    toast.success(`${selectedCount} leads guardados en lista`);
  };

  // Import to contacts handler
  const handleImportToContacts = (type: "b2b" | "maps") => {
    const selectedCount = type === "b2b" ? b2bSelectedIds.size : mapsSelectedIds.size;
    if (selectedCount === 0) {
      toast.error("Selecciona al menos un lead");
      return;
    }
    
    // In production, this would import leads as contacts
    toast.success(`${selectedCount} leads importados como contactos`);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
      <TabsList className="flex flex-wrap h-auto">
        <TabsTrigger value="b2b" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <span className="hidden sm:inline">{UI.leads.b2b.title}</span>
          <span className="sm:hidden">B2B</span>
        </TabsTrigger>
        <TabsTrigger value="maps" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span className="hidden sm:inline">{UI.leads.maps.title}</span>
          <span className="sm:hidden">Maps</span>
        </TabsTrigger>
        <TabsTrigger value="lists" className="flex items-center gap-2">
          <List className="h-4 w-4" />
          <span className="hidden sm:inline">{UI.leads.lists.title}</span>
          <span className="sm:hidden">Listas</span>
        </TabsTrigger>
      </TabsList>

      {/* B2B Search */}
      <TabsContent value="b2b" className="space-y-4 md:space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg md:text-xl">{UI.leads.b2b.title}</CardTitle>
            <CardDescription>
              Busca empresas y contactos por industria, tamaño y ubicación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Filters */}
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative sm:col-span-2 lg:col-span-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Palabras clave..."
                  value={b2bQuery}
                  onChange={(e) => setB2bQuery(e.target.value)}
                  className="pl-9 h-10"
                  onKeyDown={(e) => e.key === "Enter" && handleB2BSearch()}
                />
              </div>
              <Select value={b2bIndustry} onValueChange={setB2bIndustry}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Industria" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((ind) => (
                    <SelectItem key={ind.value} value={ind.value}>
                      {ind.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={b2bSize} onValueChange={setB2bSize}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Tamaño" />
                </SelectTrigger>
                <SelectContent>
                  {companySizes.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={b2bLocation} onValueChange={setB2bLocation}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Ubicación" />
                </SelectTrigger>
                <SelectContent>
                  {locationPresets.map((loc) => (
                    <SelectItem key={loc.value} value={loc.value}>
                      {loc.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center">
              <Button onClick={handleB2BSearch} disabled={b2bLoading}>
                {b2bLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                {UI.leads.b2b.search}
              </Button>

              {b2bLeads.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSaveToList("b2b")}
                    disabled={b2bSelectedIds.size === 0}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Guardar ({b2bSelectedIds.size})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleImportToContacts("b2b")}
                    disabled={b2bSelectedIds.size === 0}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Importar
                  </Button>
                </div>
              )}
            </div>

            {/* Results */}
            {b2bLeads.length > 0 ? (
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={b2bSelectedIds.size === b2bLeads.length}
                          onCheckedChange={selectAllB2b}
                        />
                      </TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead className="hidden md:table-cell">Cargo</TableHead>
                      <TableHead className="hidden lg:table-cell">Empresa</TableHead>
                      <TableHead className="hidden xl:table-cell">Industria</TableHead>
                      <TableHead>Contacto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {b2bLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <Checkbox
                            checked={b2bSelectedIds.has(lead.id)}
                            onCheckedChange={() => toggleB2bSelection(lead.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{lead.name}</p>
                            <p className="text-xs text-muted-foreground md:hidden">{lead.title}</p>
                            <p className="text-xs text-muted-foreground lg:hidden">{lead.company.name}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{lead.title}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div>
                            <p className="font-medium">{lead.company.name}</p>
                            <p className="text-xs text-muted-foreground">{lead.company.size}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <Badge variant="secondary">{lead.company.industry}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {lead.email && (
                              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                <a href={`mailto:${lead.email}`}>
                                  <Mail className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            {lead.linkedinUrl && (
                              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                <a href={lead.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                  <Linkedin className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Ingresa criterios de búsqueda para encontrar empresas</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Maps Search */}
      <TabsContent value="maps" className="space-y-4 md:space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg md:text-xl">{UI.leads.maps.title}</CardTitle>
            <CardDescription>
              Encuentra negocios locales por ubicación y categoría
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Filters */}
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tipo de negocio (ej: restaurantes)"
                  value={mapsQuery}
                  onChange={(e) => setMapsQuery(e.target.value)}
                  className="pl-9 h-10"
                  onKeyDown={(e) => e.key === "Enter" && handleMapsSearch()}
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ubicación (ej: CDMX)"
                  value={mapsLocation}
                  onChange={(e) => setMapsLocation(e.target.value)}
                  className="pl-9 h-10"
                  onKeyDown={(e) => e.key === "Enter" && handleMapsSearch()}
                />
              </div>
              <Button onClick={handleMapsSearch} disabled={mapsLoading} className="h-10">
                {mapsLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                {UI.leads.maps.search}
              </Button>
            </div>

            {mapsLeads.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center">
                <p className="text-sm text-muted-foreground">
                  {mapsLeads.length} negocios encontrados
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSaveToList("maps")}
                    disabled={mapsSelectedIds.size === 0}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Guardar ({mapsSelectedIds.size})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleImportToContacts("maps")}
                    disabled={mapsSelectedIds.size === 0}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Importar
                  </Button>
                </div>
              </div>
            )}

            {/* Results */}
            {mapsLeads.length > 0 ? (
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={mapsSelectedIds.size === mapsLeads.length}
                          onCheckedChange={selectAllMaps}
                        />
                      </TableHead>
                      <TableHead>Negocio</TableHead>
                      <TableHead className="hidden md:table-cell">Categoría</TableHead>
                      <TableHead className="hidden lg:table-cell">Dirección</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Contacto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mapsLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <Checkbox
                            checked={mapsSelectedIds.has(lead.id)}
                            onCheckedChange={() => toggleMapsSelection(lead.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{lead.name}</p>
                            <p className="text-xs text-muted-foreground md:hidden">{lead.category}</p>
                            <p className="text-xs text-muted-foreground lg:hidden truncate max-w-[200px]">
                              {lead.address}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="secondary">{lead.category}</Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <p className="truncate max-w-[250px]">{lead.address}</p>
                        </TableCell>
                        <TableCell>
                          {lead.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <span className="font-medium">{lead.rating.toFixed(1)}</span>
                              <span className="text-xs text-muted-foreground">
                                ({lead.reviewCount})
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {lead.phone && (
                              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                <a href={`tel:${lead.phone}`}>
                                  <Phone className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            {lead.website && (
                              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                <a href={lead.website} target="_blank" rel="noopener noreferrer">
                                  <Globe className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            {lead.placeUrl && (
                              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                <a href={lead.placeUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Ingresa tipo de negocio y ubicación para buscar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Saved Lists */}
      <TabsContent value="lists" className="space-y-4 md:space-y-6">
        <div className="flex justify-end">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {UI.leads.lists.create}
          </Button>
        </div>

        {lists.length === 0 ? (
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
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {lists.map((list) => (
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
