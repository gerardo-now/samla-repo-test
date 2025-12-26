import { NextRequest, NextResponse } from "next/server";

/**
 * Knowledge Base API
 *
 * CRUD operations for knowledge collections and documents
 */

// In-memory storage for demo
const collections: Map<string, CollectionData> = new Map();
const documents: Map<string, DocumentData> = new Map();

interface CollectionData {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  documentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface DocumentData {
  id: string;
  collectionId: string;
  type: "pdf" | "url" | "faq";
  title: string;
  content?: string;
  sourceUrl?: string;
  status: "processing" | "ready" | "error";
  createdAt: Date;
}

// GET /api/knowledge - List collections
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId") || "demo-workspace";
    const collectionId = searchParams.get("collectionId");

    // If collectionId provided, return documents
    if (collectionId) {
      const docs = Array.from(documents.values()).filter(
        (d) => d.collectionId === collectionId
      );
      return NextResponse.json({
        success: true,
        documents: docs,
        total: docs.length,
      });
    }

    // Return collections
    const result = Array.from(collections.values()).filter(
      (c) => c.workspaceId === workspaceId
    );

    return NextResponse.json({
      success: true,
      collections: result,
      total: result.length,
    });
  } catch (error) {
    console.error("Error listing knowledge:", error);
    return NextResponse.json(
      { error: "Error al obtener la base de conocimiento" },
      { status: 500 }
    );
  }
}

// POST /api/knowledge - Create collection or document
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type } = body; // "collection" or "document"

    if (type === "collection") {
      const { name, description, workspaceId = "demo-workspace" } = body;

      if (!name?.trim()) {
        return NextResponse.json(
          { error: "El nombre es requerido" },
          { status: 400 }
        );
      }

      const id = `col_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const newCollection: CollectionData = {
        id,
        workspaceId,
        name: name.trim(),
        description: description?.trim(),
        documentCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      collections.set(id, newCollection);

      return NextResponse.json({
        success: true,
        collection: newCollection,
      });
    }

    if (type === "document") {
      const { collectionId, docType, title, content, sourceUrl } = body;

      if (!collectionId) {
        return NextResponse.json(
          { error: "La colección es requerida" },
          { status: 400 }
        );
      }

      if (!title?.trim()) {
        return NextResponse.json(
          { error: "El título es requerido" },
          { status: 400 }
        );
      }

      const id = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const newDocument: DocumentData = {
        id,
        collectionId,
        type: docType || "faq",
        title: title.trim(),
        content: content?.trim(),
        sourceUrl: sourceUrl?.trim(),
        status: "ready", // In production, would be "processing" then updated
        createdAt: new Date(),
      };

      documents.set(id, newDocument);

      // Update collection document count
      const collection = collections.get(collectionId);
      if (collection) {
        collection.documentCount += 1;
        collections.set(collectionId, collection);
      }

      return NextResponse.json({
        success: true,
        document: newDocument,
      });
    }

    return NextResponse.json(
      { error: "Tipo no válido" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error creating knowledge:", error);
    return NextResponse.json(
      { error: "Error al crear" },
      { status: 500 }
    );
  }
}

// DELETE /api/knowledge?id=xxx&type=collection|document
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type") || "collection";

    if (!id) {
      return NextResponse.json(
        { error: "El ID es requerido" },
        { status: 400 }
      );
    }

    if (type === "collection") {
      if (!collections.has(id)) {
        return NextResponse.json(
          { error: "Colección no encontrada" },
          { status: 404 }
        );
      }

      // Delete all documents in collection
      Array.from(documents.values())
        .filter((d) => d.collectionId === id)
        .forEach((d) => documents.delete(d.id));

      collections.delete(id);

      return NextResponse.json({
        success: true,
        message: "Colección eliminada",
      });
    }

    if (type === "document") {
      const doc = documents.get(id);
      if (!doc) {
        return NextResponse.json(
          { error: "Documento no encontrado" },
          { status: 404 }
        );
      }

      documents.delete(id);

      // Update collection document count
      const collection = collections.get(doc.collectionId);
      if (collection) {
        collection.documentCount = Math.max(0, collection.documentCount - 1);
        collections.set(doc.collectionId, collection);
      }

      return NextResponse.json({
        success: true,
        message: "Documento eliminado",
      });
    }

    return NextResponse.json(
      { error: "Tipo no válido" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error deleting knowledge:", error);
    return NextResponse.json(
      { error: "Error al eliminar" },
      { status: 500 }
    );
  }
}

