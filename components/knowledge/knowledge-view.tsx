"use client";

import { useState } from "react";
import { UI } from "@/lib/copy/uiStrings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  BookOpen,
  FileText,
  Globe,
  HelpCircle,
  AlignLeft,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface KnowledgeCollection {
  id: string;
  name: string;
  description?: string;
  sourceCount: number;
  chunkCount: number;
  isActive: boolean;
}

interface KnowledgeSource {
  id: string;
  collectionId: string;
  type: "pdf" | "url" | "faq" | "text";
  name: string;
  status: "pending" | "processing" | "ready" | "failed";
  chunkCount: number;
}

const mockCollections: KnowledgeCollection[] = [];

const sourceTypeConfig = {
  pdf: { label: UI.knowledge.sourceTypes.pdf, icon: FileText, color: "text-red-600 bg-red-500/10" },
  url: { label: UI.knowledge.sourceTypes.url, icon: Globe, color: "text-blue-600 bg-blue-500/10" },
  faq: { label: UI.knowledge.sourceTypes.faq, icon: HelpCircle, color: "text-purple-600 bg-purple-500/10" },
  text: { label: UI.knowledge.sourceTypes.text, icon: AlignLeft, color: "text-green-600 bg-green-500/10" },
};

const statusConfig = {
  pending: { label: UI.knowledge.status.pending, variant: "secondary" as const },
  processing: { label: UI.knowledge.status.processing, variant: "default" as const },
  ready: { label: UI.knowledge.status.ready, variant: "default" as const },
  failed: { label: UI.knowledge.status.failed, variant: "destructive" as const },
};

export function KnowledgeView() {
  const [isAddCollectionOpen, setIsAddCollectionOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<KnowledgeCollection | null>(null);

  return (
    <div className="space-y-6">
      {/* Empty State or Grid */}
      {mockCollections.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium">Crea tu primera colección</h3>
            <p className="text-muted-foreground mt-1 max-w-sm">
              Agrega documentos, páginas web o preguntas frecuentes para que tus agentes respondan con información precisa
            </p>
            <Button className="mt-6" onClick={() => setIsAddCollectionOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {UI.knowledge.addCollection}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex justify-end">
            <Button onClick={() => setIsAddCollectionOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {UI.knowledge.addCollection}
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockCollections.map((collection) => (
              <Card
                key={collection.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  !collection.isActive && "opacity-60"
                )}
                onClick={() => setSelectedCollection(collection)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{collection.name}</CardTitle>
                        {collection.description && (
                          <CardDescription className="line-clamp-1">
                            {collection.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>{UI.common.edit}</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          {UI.common.delete}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{collection.sourceCount} fuentes</span>
                    <span>{collection.chunkCount} fragmentos</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Add Collection Dialog */}
      <Dialog open={isAddCollectionOpen} onOpenChange={setIsAddCollectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{UI.knowledge.addCollection}</DialogTitle>
            <DialogDescription>
              Una colección agrupa material relacionado para tus agentes
            </DialogDescription>
          </DialogHeader>
          {/* Collection form would go here */}
          <div className="space-y-4 py-4">
            <p className="text-muted-foreground text-center">
              Formulario de colección
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

