import { NextRequest, NextResponse } from "next/server";

// TODO: Replace with actual Prisma and auth
// For now using in-memory storage for demo
const tasksStore: Map<string, Array<{
  id: string;
  contactId: string;
  title: string;
  description?: string;
  assigneeId?: string;
  assigneeName?: string;
  assigneeInitials?: string;
  dueDate?: string;
  isCompleted: boolean;
  createdAt: string;
}>> = new Map();

// Team members mock data
const teamMembers: Record<string, { name: string; initials: string }> = {
  "1": { name: "Juan Pérez", initials: "JP" },
  "2": { name: "María García", initials: "MG" },
  "3": { name: "Carlos López", initials: "CL" },
};

// Initialize with some demo tasks for first demo contact
tasksStore.set("contact_demo_1", [
  {
    id: "task-1",
    contactId: "contact_demo_1",
    title: "Llamar para seguimiento de propuesta",
    description: "Confirmar si recibió la cotización y resolver dudas",
    assigneeId: "1",
    assigneeName: "Juan Pérez",
    assigneeInitials: "JP",
    dueDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    isCompleted: false,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "task-2",
    contactId: "contact_demo_1",
    title: "Enviar contrato final",
    assigneeId: "2",
    assigneeName: "María García",
    assigneeInitials: "MG",
    isCompleted: true,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
]);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contactId } = await params;
    const tasks = tasksStore.get(contactId) || [];
    
    // Sort: pending first (by due date), then completed
    const sortedTasks = [...tasks].sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({
      success: true,
      tasks: sortedTasks,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener tareas" },
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
    const { title, description, assigneeId, dueDate } = await req.json();

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "El título es requerido" },
        { status: 400 }
      );
    }

    const assignee = assigneeId ? teamMembers[assigneeId] : null;

    const newTask = {
      id: `task-${Date.now()}`,
      contactId,
      title: title.trim(),
      description: description?.trim() || undefined,
      assigneeId: assigneeId || undefined,
      assigneeName: assignee?.name || undefined,
      assigneeInitials: assignee?.initials || undefined,
      dueDate: dueDate || undefined,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    const existingTasks = tasksStore.get(contactId) || [];
    tasksStore.set(contactId, [newTask, ...existingTasks]);

    return NextResponse.json({
      success: true,
      task: newTask,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { success: false, error: "Error al crear tarea" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: contactId } = await params;
    const { taskId, isCompleted, title, description, assigneeId, dueDate } = await req.json();

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: "ID de la tarea es requerido" },
        { status: 400 }
      );
    }

    const existingTasks = tasksStore.get(contactId) || [];
    const taskIndex = existingTasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Tarea no encontrada" },
        { status: 404 }
      );
    }

    const task = existingTasks[taskIndex];
    
    // Update fields
    if (isCompleted !== undefined) {
      task.isCompleted = isCompleted;
    }
    if (title !== undefined) {
      task.title = title.trim();
    }
    if (description !== undefined) {
      task.description = description.trim() || undefined;
    }
    if (assigneeId !== undefined) {
      const assignee = assigneeId ? teamMembers[assigneeId] : null;
      task.assigneeId = assigneeId || undefined;
      task.assigneeName = assignee?.name || undefined;
      task.assigneeInitials = assignee?.initials || undefined;
    }
    if (dueDate !== undefined) {
      task.dueDate = dueDate || undefined;
    }

    existingTasks[taskIndex] = task;
    tasksStore.set(contactId, existingTasks);

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { success: false, error: "Error al actualizar tarea" },
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
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: "ID de la tarea es requerido" },
        { status: 400 }
      );
    }

    const existingTasks = tasksStore.get(contactId) || [];
    const filteredTasks = existingTasks.filter(t => t.id !== taskId);
    tasksStore.set(contactId, filteredTasks);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { success: false, error: "Error al eliminar tarea" },
      { status: 500 }
    );
  }
}

