"use client";

import { useState, useEffect } from "react";
import {
  Moon,
  Sun,
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  Timer,
  MoreVertical,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Repeat,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { createClient } from "../../supabase/client";
import TaskCreationModal from "./task-creation-modal";

interface Task {
  id: string;
  title: string;
  duration: number; // in minutes
  start_time: string;
  start_date: string;
  completed: boolean;
  category: string;
  category_color: string;
  notes?: string;
  has_repeat?: boolean;
  repeat_type?: string;
  repeat_interval?: number;
  repeat_end_date?: string;
  isRepeatInstance?: boolean; // Flag for generated repeat instances
}

export default function TaskDashboard() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const supabase = createClient();

  const fetchTasks = async (date: Date) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const dateString = date.toISOString().split("T")[0];

      // Fetch tasks for the specific date
      const { data: directTasks, error: directError } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("start_date", dateString)
        .order("start_time", { ascending: true });

      if (directError) {
        console.error("Error fetching direct tasks:", directError);
        return;
      }

      // Fetch repeating tasks that could apply to this date
      const { data: repeatingTasks, error: repeatError } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("has_repeat", true)
        .lte("start_date", dateString) // Only tasks that started before or on this date
        .order("start_time", { ascending: true });

      if (repeatError) {
        console.error("Error fetching repeating tasks:", repeatError);
        return;
      }

      // Generate repeat instances for the selected date
      const repeatInstances = generateRepeatInstances(
        repeatingTasks || [],
        date,
      );

      // Combine direct tasks and repeat instances, remove duplicates
      const allTasks = [...(directTasks || []), ...repeatInstances];

      // Sort by start time
      allTasks.sort((a, b) => a.start_time.localeCompare(b.start_time));

      setTasks(allTasks);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateRepeatInstances = (
    repeatingTasks: Task[],
    targetDate: Date,
  ): Task[] => {
    const instances: Task[] = [];
    const targetDateString = targetDate.toISOString().split("T")[0];

    repeatingTasks.forEach((task) => {
      const startDate = new Date(task.start_date);
      const endDate = task.repeat_end_date
        ? new Date(task.repeat_end_date)
        : null;

      // Check if target date is within repeat range
      if (endDate && targetDate > endDate) return;
      if (targetDate < startDate) return;

      // Skip if this is the original task date (already included in direct tasks)
      if (task.start_date === targetDateString) return;

      const shouldRepeat = checkIfShouldRepeat(task, startDate, targetDate);

      if (shouldRepeat) {
        instances.push({
          ...task,
          id: `${task.id}-repeat-${targetDateString}`, // Unique ID for repeat instance
          start_date: targetDateString,
          isRepeatInstance: true, // Flag to identify repeat instances
        });
      }
    });

    return instances;
  };

  const checkIfShouldRepeat = (
    task: Task,
    startDate: Date,
    targetDate: Date,
  ): boolean => {
    const daysDiff = Math.floor(
      (targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    switch (task.repeat_type) {
      case "daily":
        return daysDiff > 0;
      case "weekly":
        return daysDiff > 0 && daysDiff % 7 === 0;
      case "monthly":
        // Check if it's the same day of month
        return (
          daysDiff > 0 &&
          startDate.getDate() === targetDate.getDate() &&
          (targetDate.getMonth() !== startDate.getMonth() ||
            targetDate.getFullYear() !== startDate.getFullYear())
        );
      case "custom":
        const interval = task.repeat_interval || 1;
        return daysDiff > 0 && daysDiff % interval === 0;
      default:
        return false;
    }
  };

  const toggleTaskCompletion = async (taskId: string, completed: boolean) => {
    try {
      // Handle repeat instances differently
      if (taskId.includes("-repeat-")) {
        // For repeat instances, we could create a completion record or skip
        // For now, just update local state (completion won't persist for repeats)
        setTasks(
          tasks.map((task) =>
            task.id === taskId ? { ...task, completed: !completed } : task,
          ),
        );
        return;
      }

      const { error } = await supabase
        .from("tasks")
        .update({ completed: !completed })
        .eq("id", taskId);

      if (error) {
        console.error("Error updating task:", error);
        return;
      }

      // Update local state
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, completed: !completed } : task,
        ),
      );
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  useEffect(() => {
    setLoading(true);
    fetchTasks(selectedDate);
  }, [selectedDate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/sign-in";
  };

  const handleTaskCreated = () => {
    setShowTaskModal(false);
    setEditingTask(null);
    fetchTasks(selectedDate); // Refresh tasks after creation
  };

  const handleEditTask = (task: Task) => {
    // Don't allow editing repeat instances
    if (task.isRepeatInstance) {
      return;
    }
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    // Don't allow deleting repeat instances
    if (taskId.includes("-repeat-")) {
      return;
    }

    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);

      if (error) {
        console.error("Error deleting task:", error);
        return;
      }

      // Refresh tasks
      fetchTasks(selectedDate);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getDateLabel = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today's Timeline";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday's Timeline";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow's Timeline";
    } else {
      return `${formatDate(date)} Timeline`;
    }
  };

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-slate-900" : "bg-gray-50"}`}
    >
      {/* Transparent Header */}
      <header className="bg-transparent px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo placeholder */}
          <div
            className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            TaskFlow
          </div>

          <div className="flex items-center gap-4">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={
                isDarkMode
                  ? "text-slate-300 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              }
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={
                    isDarkMode
                      ? "text-slate-300 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }
                >
                  <User className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className={
                  isDarkMode
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-gray-200"
                }
              >
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className={
                    isDarkMode
                      ? "text-slate-300 hover:text-white hover:bg-slate-700"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  }
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content - Timeline */}
      <main className="p-6">
        <div className="max-w-2xl mx-auto">
          {/* Timeline Header with Navigation */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              {/* Date Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateDate("prev")}
                  className={
                    isDarkMode
                      ? "text-slate-300 hover:text-white hover:bg-slate-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="text-center">
                  <h1
                    className={`text-2xl font-bold mb-1 ${isDarkMode ? "text-white" : "text-gray-900"}`}
                  >
                    {getDateLabel(selectedDate)}
                  </h1>
                  <p
                    className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}
                  >
                    {formatDate(selectedDate)}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateDate("next")}
                  className={
                    isDarkMode
                      ? "text-slate-300 hover:text-white hover:bg-slate-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Today Button */}
              {!isToday(selectedDate) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                  className={
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }
                >
                  Today
                </Button>
              )}
            </div>

            <Button
              onClick={() => setShowTaskModal(true)}
              className={`${
                isDarkMode
                  ? "bg-coral-500 hover:bg-coral-400 text-slate-900"
                  : "bg-coral-500 hover:bg-coral-400 text-white"
              }`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Timeline line */}
            <div
              className={`absolute left-6 top-0 bottom-0 w-0.5 ${isDarkMode ? "bg-slate-700" : "bg-gray-300"}`}
            ></div>

            {/* Loading state */}
            {loading ? (
              <div
                className={`text-center py-8 ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}
              >
                Loading tasks...
              </div>
            ) : tasks.length === 0 ? (
              /* Empty state */
              <div className="text-center py-12">
                <div
                  className={`mb-4 ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}
                >
                  No tasks scheduled for{" "}
                  {isToday(selectedDate) ? "today" : "this day"}
                </div>
                <Button
                  onClick={() => setShowTaskModal(true)}
                  className="bg-coral-500 hover:bg-coral-400 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create your first task
                </Button>
              </div>
            ) : (
              /* Time markers and tasks */
              <div className="space-y-6">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="relative flex items-start gap-6"
                  >
                    {/* Time marker */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 border-2 rounded-full flex items-center justify-center relative z-10 ${
                          isDarkMode
                            ? "bg-slate-800 border-slate-600"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        <Clock
                          className={`w-5 h-5 ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}
                        />
                      </div>
                      <div
                        className={`text-sm mt-2 font-mono ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}
                      >
                        {task.start_time.slice(0, 5)}
                      </div>
                    </div>

                    {/* Task card */}
                    <Card
                      className={`flex-1 p-4 transition-colors ${
                        isDarkMode
                          ? "bg-slate-800 border-slate-700 hover:bg-slate-750"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {/* Task status */}
                          <button
                            className="mt-1"
                            onClick={() =>
                              toggleTaskCompletion(task.id, task.completed)
                            }
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-green-400" />
                            ) : (
                              <Circle
                                className={`w-5 h-5 hover:text-coral-400 ${isDarkMode ? "text-slate-400" : "text-gray-400"}`}
                              />
                            )}
                          </button>

                          {/* Task content */}
                          <div className="flex-1">
                            <h3
                              className={`font-medium ${
                                task.completed
                                  ? isDarkMode
                                    ? "text-slate-400 line-through"
                                    : "text-gray-400 line-through"
                                  : isDarkMode
                                    ? "text-white"
                                    : "text-gray-900"
                              }`}
                            >
                              {task.title}
                            </h3>

                            {/* Task metadata */}
                            <div className="flex items-center gap-4 mt-2">
                              <div
                                className={`flex items-center gap-1 text-sm ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}
                              >
                                <Timer className="w-3 h-3" />
                                <span>{task.duration}m</span>
                              </div>

                              <div
                                className={`px-2 py-1 rounded-full text-xs font-medium`}
                                style={{
                                  backgroundColor: `${task.category_color}20`,
                                  color: task.category_color,
                                }}
                              >
                                {task.category}
                              </div>

                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: task.category_color }}
                              ></div>

                              {/* Repeat indicator */}
                              {task.isRepeatInstance && (
                                <div
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    isDarkMode
                                      ? "bg-slate-700 text-slate-300"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  <Repeat className="w-3 h-3 inline mr-1" />
                                  Repeating
                                </div>
                              )}
                            </div>

                            {/* Notes */}
                            {task.notes && (
                              <p
                                className={`text-sm mt-2 ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}
                              >
                                {task.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Task actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={
                                isDarkMode
                                  ? "text-slate-400 hover:text-white"
                                  : "text-gray-400 hover:text-gray-900"
                              }
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className={
                              isDarkMode
                                ? "bg-slate-800 border-slate-700"
                                : "bg-white border-gray-200"
                            }
                          >
                            {!task.isRepeatInstance && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleEditTask(task)}
                                  className={
                                    isDarkMode
                                      ? "text-slate-300 hover:text-white hover:bg-slate-700"
                                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                                  }
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Task
                                </DropdownMenuItem>
                                <DropdownMenuSeparator
                                  className={
                                    isDarkMode ? "bg-slate-700" : "bg-gray-200"
                                  }
                                />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteTask(task.id)}
                                  className={
                                    isDarkMode
                                      ? "text-red-400 hover:text-red-300 hover:bg-slate-700"
                                      : "text-red-600 hover:text-red-700 hover:bg-gray-100"
                                  }
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Task
                                </DropdownMenuItem>
                              </>
                            )}
                            {task.isRepeatInstance && (
                              <DropdownMenuItem
                                disabled
                                className={
                                  isDarkMode
                                    ? "text-slate-500"
                                    : "text-gray-400"
                                }
                              >
                                Repeating task - edit original
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add task prompt */}
          {tasks.length > 0 && (
            <div className="mt-12 text-center">
              <button
                onClick={() => setShowTaskModal(true)}
                className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-opacity-80 transition-colors ${
                  isDarkMode
                    ? "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Add more tasks to your timeline</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Task Creation/Edit Modal */}
      <TaskCreationModal
        open={showTaskModal}
        onClose={handleTaskCreated}
        isDarkMode={isDarkMode}
        selectedDate={selectedDate}
        editingTask={editingTask}
      />
    </div>
  );
}
