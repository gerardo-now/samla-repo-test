import { NextRequest, NextResponse } from "next/server";

// TODO: Replace with actual Prisma and auth
// For now using in-memory storage for demo
const commentsStore: Map<string, Array<{
  id: string;
  contactId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  createdAt: string;
}>> = new Map();

// Initialize with some demo comments for all demo contacts
["contact_demo_1", "contact_demo_2", "contact_demo_3"].forEach((contactId, index) => {
  if (index === 0) {
    commentsStore.set(contactId, [
      {
        id: "comment-1",
        contactId,
        content: "Primera llamada realizada. Interesado en el producto.",
        authorId: "user-1",
        authorName: "María García",
        authorInitials: "MG",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "comment-2",
        contactId,
        content: "Enviada propuesta por email. Espera confirmación.",
        authorId: "user-2",
        authorName: "Juan Pérez",
        authorInitials: "JP",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ]);
  }
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contactId } = await params;
    const comments = commentsStore.get(contactId) || [];
    
    // Sort by newest first
    const sortedComments = [...comments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      comments: sortedComments,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener comentarios" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contactId } = await params;
    const { content } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: "El contenido es requerido" },
        { status: 400 }
      );
    }

    // TODO: Get actual user from auth
    const newComment = {
      id: `comment-${Date.now()}`,
      contactId,
      content: content.trim(),
      authorId: "current-user",
      authorName: "Usuario Actual",
      authorInitials: "UA",
      createdAt: new Date().toISOString(),
    };

    const existingComments = commentsStore.get(contactId) || [];
    commentsStore.set(contactId, [newComment, ...existingComments]);

    return NextResponse.json({
      success: true,
      comment: newComment,
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear comentario" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contactId } = await params;
    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get("commentId");

    if (!commentId) {
      return NextResponse.json(
        { success: false, error: "ID del comentario es requerido" },
        { status: 400 }
      );
    }

    const existingComments = commentsStore.get(contactId) || [];
    const filteredComments = existingComments.filter(c => c.id !== commentId);
    commentsStore.set(contactId, filteredComments);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar comentario" },
      { status: 500 }
    );
  }
}

