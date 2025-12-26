"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X,
  Phone,
  Mail,
  Building2,
  Calendar,
  MessageSquare,
  CheckSquare,
  Plus,
  Send,
  Clock,
  User,
  Loader2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Contact } from "./contacts-kanban-view";

interface Comment {
  id: string;
  content: string;
  authorName: string;
  authorInitials: string;
  createdAt: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  assigneeName?: string;
  assigneeInitials?: string;
  dueDate?: string;
  isCompleted: boolean;
  createdAt: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  initials: string;
}

interface ContactDetailPanelProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onContactUpdated: (contact: Contact) => void;
  onRefresh: () => void;
}

export function ContactDetailPanel({
  contact,
  isOpen,
  onClose,
  onContactUpdated,
  onRefresh,
}: ContactDetailPanelProps) {
  const [activeTab, setActiveTab] = useState("comments");
  const [comments, setComments] = useState<Comment[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  
  // New comment form
  const [newComment, setNewComment] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  
  // New task form
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Fetch comments and tasks when contact changes
  useEffect(() => {
    if (contact && isOpen) {
      fetchComments();
      fetchTasks();
      fetchTeamMembers();
    }
  }, [contact?.id, isOpen]);

  const fetchComments = async () => {
    if (!contact) return;
    setIsLoadingComments(true);
    try {
      const response = await fetch(`/api/contacts/${contact.id}/comments`);
      const data = await response.json();
      if (data.success) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const fetchTasks = async () => {
    if (!contact) return;
    setIsLoadingTasks(true);
    try {
      const response = await fetch(`/api/contacts/${contact.id}/tasks`);
      const data = await response.json();
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch("/api/workspace/members");
      const data = await response.json();
      if (data.success) {
        setTeamMembers(data.members);
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
      // Use mock data
      setTeamMembers([
        { id: "1", name: "Juan Pérez", email: "juan@empresa.com", initials: "JP" },
        { id: "2", name: "María García", email: "maria@empresa.com", initials: "MG" },
        { id: "3", name: "Carlos López", email: "carlos@empresa.com", initials: "CL" },
      ]);
    }
  };

  const handleAddComment = async () => {
    if (!contact || !newComment.trim()) return;

    setIsAddingComment(true);
    try {
      const response = await fetch(`/api/contacts/${contact.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      const data = await response.json();
      if (data.success) {
        setComments([data.comment, ...comments]);
        setNewComment("");
        toast.success("Comentario agregado");
        onRefresh(); // Refresh to update comment count
      } else {
        toast.error(data.error || "Error al agregar comentario");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Error al agregar comentario");
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/contacts/${contact?.id}/comments?commentId=${commentId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        setComments(comments.filter(c => c.id !== commentId));
        toast.success("Comentario eliminado");
        onRefresh();
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Error al eliminar comentario");
    }
  };

  const handleAddTask = async () => {
    if (!contact || !newTaskTitle.trim()) return;

    setIsAddingTask(true);
    try {
      const response = await fetch(`/api/contacts/${contact.id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription || undefined,
          assigneeId: newTaskAssignee || undefined,
          dueDate: newTaskDueDate || undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setTasks([data.task, ...tasks]);
        setNewTaskTitle("");
        setNewTaskDescription("");
        setNewTaskAssignee("");
        setNewTaskDueDate("");
        setShowTaskForm(false);
        toast.success("Tarea creada");
        onRefresh();
      } else {
        toast.error(data.error || "Error al crear tarea");
      }
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Error al crear tarea");
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleToggleTask = async (task: Task) => {
    try {
      const response = await fetch(`/api/contacts/${contact?.id}/tasks`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          isCompleted: !task.isCompleted,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setTasks(tasks.map(t => 
          t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t
        ));
        toast.success(task.isCompleted ? "Tarea reabierta" : "Tarea completada");
        onRefresh();
      }
    } catch (error) {
      console.error("Error toggling task:", error);
      toast.error("Error al actualizar tarea");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/contacts/${contact?.id}/tasks?taskId=${taskId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        setTasks(tasks.filter(t => t.id !== taskId));
        toast.success("Tarea eliminada");
        onRefresh();
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Error al eliminar tarea");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusConfig = {
    prospect: { label: "Prospecto", color: "bg-amber-500" },
    client: { label: "Cliente", color: "bg-green-500" },
    lost: { label: "Perdido", color: "bg-red-500" },
  };

  if (!contact) return null;

  const pendingTasks = tasks.filter(t => !t.isCompleted);
  const completedTasks = tasks.filter(t => t.isCompleted);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="text-lg">
                  {`${contact.firstName?.[0] || ""}${contact.lastName?.[0] || ""}`.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle className="text-left">
                  {contact.firstName} {contact.lastName}
                </SheetTitle>
                <div className="flex items-center gap-2 mt-1">
                  <div className={cn("w-2 h-2 rounded-full", statusConfig[contact.status].color)} />
                  <span className="text-sm text-muted-foreground">
                    {statusConfig[contact.status].label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Contact Info */}
        <div className="px-6 py-4 space-y-2 border-b">
          {contact.company && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{contact.company}</span>
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{contact.phone}</span>
            </div>
          )}
          {contact.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{contact.email}</span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mx-6 mt-4 justify-start">
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comentarios
              {comments.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {comments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Tareas
              {pendingTasks.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {pendingTasks.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Comments Tab */}
          <TabsContent value="comments" className="flex-1 flex flex-col mt-0 px-6">
            {/* Add Comment */}
            <div className="py-4 border-b">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Escribe un comentario..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>
              <div className="flex justify-end mt-2">
                <Button
                  size="sm"
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isAddingComment}
                >
                  {isAddingComment ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {isLoadingComments ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Sin comentarios aún</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="group">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {comment.authorInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{comment.authorName}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.createdAt)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 ml-auto"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <Trash2 className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        </div>
                        <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="flex-1 flex flex-col mt-0 px-6">
            {/* Add Task Button */}
            <div className="py-4 border-b">
              {!showTaskForm ? (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowTaskForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva tarea
                </Button>
              ) : (
                <div className="space-y-3">
                  <Input
                    placeholder="Título de la tarea *"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                  />
                  <Textarea
                    placeholder="Descripción (opcional)"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    className="min-h-[60px] resize-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={newTaskAssignee} onValueChange={setNewTaskAssignee}>
                      <SelectTrigger>
                        <SelectValue placeholder="Asignar a..." />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[10px]">
                                  {member.initials}
                                </AvatarFallback>
                              </Avatar>
                              {member.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="date"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowTaskForm(false);
                        setNewTaskTitle("");
                        setNewTaskDescription("");
                        setNewTaskAssignee("");
                        setNewTaskDueDate("");
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAddTask}
                      disabled={!newTaskTitle.trim() || isAddingTask}
                    >
                      {isAddingTask ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Crear tarea"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Tasks List */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {isLoadingTasks ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Sin tareas asignadas</p>
                </div>
              ) : (
                <>
                  {/* Pending Tasks */}
                  {pendingTasks.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Pendientes ({pendingTasks.length})
                      </p>
                      {pendingTasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onToggle={() => handleToggleTask(task)}
                          onDelete={() => handleDeleteTask(task.id)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Completed Tasks */}
                  {completedTasks.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Completadas ({completedTasks.length})
                      </p>
                      {completedTasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onToggle={() => handleToggleTask(task)}
                          onDelete={() => handleDeleteTask(task.id)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

// Task Item Component
function TaskItem({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.isCompleted;

  return (
    <div
      className={cn(
        "group flex items-start gap-3 p-3 rounded-lg border transition-colors",
        task.isCompleted ? "bg-muted/50" : "bg-background hover:border-primary/50"
      )}
    >
      <Checkbox
        checked={task.isCompleted}
        onCheckedChange={onToggle}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium",
            task.isCompleted && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
        )}
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {task.assigneeName && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              {task.assigneeName}
            </span>
          )}
          {task.dueDate && (
            <span
              className={cn(
                "flex items-center gap-1 text-xs",
                isOverdue ? "text-red-500" : "text-muted-foreground"
              )}
            >
              <Clock className="h-3 w-3" />
              {new Date(task.dueDate).toLocaleDateString("es-MX", {
                day: "numeric",
                month: "short",
              })}
            </span>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100"
        onClick={onDelete}
      >
        <Trash2 className="h-3 w-3 text-muted-foreground" />
      </Button>
    </div>
  );
}

