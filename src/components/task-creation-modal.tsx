"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Plus,
  X,
  Repeat,
  FileText,
  Layers,
  Palette,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { createClient } from "../../supabase/client";

interface Task {
  id: string;
  title: string;
  duration: number;
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
}

interface TaskCreationModalProps {
  open?: boolean;
  onClose?: () => void;
  isDarkMode?: boolean;
  selectedDate?: Date;
  editingTask?: Task | null;
}

const defaultCategories = [
  { name: "Work", color: "#3b82f6" },
  { name: "Personal", color: "#10b981" },
  { name: "Health", color: "#ef4444" },
  { name: "Learning", color: "#8b5cf6" },
  { name: "Social", color: "#ec4899" },
  { name: "Finance", color: "#eab308" },
];

const presetColors = [
  "#3b82f6", // blue
  "#10b981", // green
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#eab308", // yellow
  "#f97316", // orange
  "#6366f1", // indigo
  "#14b8a6", // teal
  "#06b6d4", // cyan
];

export default function TaskCreationModal({
  open = true,
  onClose = () => {},
  isDarkMode = true,
  selectedDate = new Date(),
  editingTask = null,
}: TaskCreationModalProps) {
  const [taskTitle, setTaskTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [taskDate, setTaskDate] = useState(
    selectedDate.toISOString().split("T")[0],
  );
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [category, setCategory] = useState("Work");
  const [customCategories, setCustomCategories] = useState(defaultCategories);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#3b82f6");
  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false);
  const [hasRepeat, setHasRepeat] = useState(false);
  const [repeatType, setRepeatType] = useState("daily");
  const [customRepeatInterval, setCustomRepeatInterval] = useState("1");
  const [hasEndDate, setHasEndDate] = useState(false);
  const [repeatEndDate, setRepeatEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const durationPresets = [
    { label: "15m", value: "15" },
    { label: "30m", value: "30" },
    { label: "45m", value: "45" },
    { label: "1hr", value: "60" },
  ];

  // Update the date when selectedDate prop changes
  useEffect(() => {
    if (selectedDate) {
      setTaskDate(selectedDate.toISOString().split("T")[0]);
    }
  }, [selectedDate]);

  // Populate form when editing a task
  useEffect(() => {
    if (editingTask) {
      setTaskTitle(editingTask.title);
      setDuration(editingTask.duration.toString());
      setTaskDate(editingTask.start_date);
      setSelectedTime(editingTask.start_time);
      setCategory(editingTask.category);
      setHasRepeat(editingTask.has_repeat || false);
      setRepeatType(editingTask.repeat_type || "daily");
      setCustomRepeatInterval(editingTask.repeat_interval?.toString() || "1");
      setHasEndDate(!!editingTask.repeat_end_date);
      setRepeatEndDate(editingTask.repeat_end_date || "");
      setNotes(editingTask.notes || "");
    } else {
      // Reset form for new task
      setTaskTitle("");
      setDuration("");
      setTaskDate(selectedDate.toISOString().split("T")[0]);
      setSelectedTime("09:00");
      setCategory("Work");
      setHasRepeat(false);
      setRepeatType("daily");
      setCustomRepeatInterval("1");
      setHasEndDate(false);
      setRepeatEndDate("");
      setNotes("");
    }
  }, [editingTask, selectedDate]);

  const addCustomCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Save to database
        const { error } = await supabase.from("categories").insert({
          user_id: user.id,
          name: newCategoryName.trim(),
          color: newCategoryColor,
        });

        if (error) {
          console.error("Error saving category:", error);
          return;
        }

        // Update local state
        setCustomCategories([
          ...customCategories,
          { name: newCategoryName.trim(), color: newCategoryColor },
        ]);
        setCategory(newCategoryName.trim());
        setNewCategoryName("");
        setShowCustomCategory(false);
        setShowCustomColorPicker(false);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const handleCreateTask = async () => {
    if (!taskTitle || !duration || !taskDate || !selectedTime) return;

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const taskData = {
        user_id: user.id,
        title: taskTitle,
        duration: parseInt(duration),
        start_date: taskDate,
        start_time: selectedTime,
        category,
        category_color:
          customCategories.find((c) => c.name === category)?.color || "#3b82f6",
        has_repeat: hasRepeat,
        repeat_type: hasRepeat ? repeatType : null,
        repeat_interval:
          hasRepeat && repeatType === "custom"
            ? parseInt(customRepeatInterval)
            : 1,
        repeat_end_date: hasRepeat && hasEndDate ? repeatEndDate : null,
        notes: notes || null,
      };

      if (editingTask) {
        // Update existing task
        const { error } = await supabase
          .from("tasks")
          .update(taskData)
          .eq("id", editingTask.id);

        if (error) {
          console.error("Error updating task:", error);
          return;
        }
      } else {
        // Create new task
        const { error } = await supabase.from("tasks").insert(taskData);

        if (error) {
          console.error("Error creating task:", error);
          return;
        }
      }

      onClose();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load user categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("categories")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error loading categories:", error);
          return;
        }

        if (data && data.length > 0) {
          setCustomCategories(data);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    if (open) {
      loadCategories();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={`max-w-2xl max-h-[90vh] overflow-y-auto ${
          isDarkMode
            ? "bg-slate-800 border-slate-700 text-white"
            : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        <DialogHeader>
          <DialogTitle
            className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            {editingTask ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Task Title */}
          <div className="space-y-2">
            <label
              className={`text-sm font-medium ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}
            >
              Task Title *
            </label>
            <Input
              placeholder="What needs to be done?"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className={
                isDarkMode
                  ? "bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
              }
            />
          </div>

          {/* Duration */}
          <div className="space-y-3">
            <label
              className={`text-sm font-medium ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}
            >
              Duration *
            </label>

            {/* Quick presets */}
            <div className="flex gap-2">
              {durationPresets.map((preset) => (
                <Button
                  key={preset.value}
                  variant={duration === preset.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDuration(preset.value)}
                  className={
                    duration === preset.value
                      ? "bg-coral-500 hover:bg-coral-400 text-white"
                      : isDarkMode
                        ? "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {/* Custom duration */}
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Custom duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className={`w-32 ${
                  isDarkMode
                    ? "bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                }`}
              />
              <span
                className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}
              >
                minutes
              </span>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                className={`text-sm font-medium flex items-center gap-2 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}
              >
                <Calendar className="w-4 h-4" />
                Date *
              </label>
              <Input
                type="date"
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
                className={
                  isDarkMode
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }
              />
            </div>

            <div className="space-y-2">
              <label
                className={`text-sm font-medium flex items-center gap-2 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}
              >
                <Clock className="w-4 h-4" />
                Time *
              </label>
              <Input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className={
                  isDarkMode
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label
                className={`text-sm font-medium ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}
              >
                Category *
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCustomCategory(!showCustomCategory)}
                className={
                  isDarkMode
                    ? "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Custom
              </Button>
            </div>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger
                className={
                  isDarkMode
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        customCategories.find((c) => c.name === category)
                          ?.color || "#3b82f6",
                    }}
                  ></div>
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent
                className={
                  isDarkMode
                    ? "bg-slate-700 border-slate-600"
                    : "bg-white border-gray-300"
                }
              >
                {customCategories.map((cat) => (
                  <SelectItem
                    key={cat.name}
                    value={cat.name}
                    className={
                      isDarkMode
                        ? "text-white hover:bg-slate-600"
                        : "text-gray-900 hover:bg-gray-100"
                    }
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      ></div>
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Custom Category Form */}
            {showCustomCategory && (
              <div
                className={`p-4 rounded-lg border ${
                  isDarkMode
                    ? "bg-slate-700 border-slate-600"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="space-y-3">
                  <Input
                    placeholder="Category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className={
                      isDarkMode
                        ? "bg-slate-600 border-slate-500 text-white placeholder:text-slate-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                    }
                  />

                  <div className="space-y-2">
                    <label
                      className={`text-xs font-medium ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}
                    >
                      Choose Color
                    </label>

                    {/* Preset Colors */}
                    <div className="flex gap-2 flex-wrap">
                      {presetColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setNewCategoryColor(color)}
                          className={`w-6 h-6 rounded-full border-2 ${
                            newCategoryColor === color
                              ? "border-coral-500"
                              : "border-gray-300"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}

                      {/* Custom Color Button */}
                      <button
                        onClick={() =>
                          setShowCustomColorPicker(!showCustomColorPicker)
                        }
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          showCustomColorPicker
                            ? "border-coral-500"
                            : "border-gray-300"
                        } ${isDarkMode ? "bg-slate-600" : "bg-white"}`}
                      >
                        <Palette className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Custom Color Picker */}
                    {showCustomColorPicker && (
                      <div className="flex items-center gap-3 mt-2">
                        <Input
                          type="color"
                          value={newCategoryColor}
                          onChange={(e) => setNewCategoryColor(e.target.value)}
                          className="w-12 h-8 p-1 border rounded cursor-pointer"
                        />
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: newCategoryColor }}
                        ></div>
                        <span
                          className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}
                        >
                          {newCategoryColor}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={addCustomCategory}
                      className="bg-coral-500 hover:bg-coral-400 text-white"
                    >
                      Add Category
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCustomCategory(false)}
                      className={
                        isDarkMode
                          ? "bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      }
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Repetition */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat
                  className={`w-4 h-4 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}
                />
                <label
                  className={`text-sm font-medium ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}
                >
                  Repeat task
                </label>
              </div>
              <Switch
                checked={hasRepeat}
                onCheckedChange={setHasRepeat}
                className="data-[state=checked]:bg-coral-500"
              />
            </div>

            {hasRepeat && (
              <div className="ml-6 space-y-3">
                <Select value={repeatType} onValueChange={setRepeatType}>
                  <SelectTrigger
                    className={
                      isDarkMode
                        ? "bg-slate-700 border-slate-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent
                    className={
                      isDarkMode
                        ? "bg-slate-700 border-slate-600"
                        : "bg-white border-gray-300"
                    }
                  >
                    <SelectItem
                      value="daily"
                      className={
                        isDarkMode
                          ? "text-white hover:bg-slate-600"
                          : "text-gray-900 hover:bg-gray-100"
                      }
                    >
                      Daily
                    </SelectItem>
                    <SelectItem
                      value="weekly"
                      className={
                        isDarkMode
                          ? "text-white hover:bg-slate-600"
                          : "text-gray-900 hover:bg-gray-100"
                      }
                    >
                      Weekly
                    </SelectItem>
                    <SelectItem
                      value="monthly"
                      className={
                        isDarkMode
                          ? "text-white hover:bg-slate-600"
                          : "text-gray-900 hover:bg-gray-100"
                      }
                    >
                      Monthly
                    </SelectItem>
                    <SelectItem
                      value="custom"
                      className={
                        isDarkMode
                          ? "text-white hover:bg-slate-600"
                          : "text-gray-900 hover:bg-gray-100"
                      }
                    >
                      Custom
                    </SelectItem>
                  </SelectContent>
                </Select>

                {repeatType === "custom" && (
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}
                    >
                      Every
                    </span>
                    <Input
                      type="number"
                      min="1"
                      value={customRepeatInterval}
                      onChange={(e) => setCustomRepeatInterval(e.target.value)}
                      className={`w-20 ${
                        isDarkMode
                          ? "bg-slate-700 border-slate-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                    <span
                      className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}
                    >
                      days
                    </span>
                  </div>
                )}

                {/* Repeat End Date */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      className={`text-sm font-medium ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}
                    >
                      End Date (Optional)
                    </label>
                    <Switch
                      checked={hasEndDate}
                      onCheckedChange={setHasEndDate}
                      className="data-[state=checked]:bg-coral-500"
                    />
                  </div>

                  {hasEndDate && (
                    <Input
                      type="date"
                      value={repeatEndDate}
                      onChange={(e) => setRepeatEndDate(e.target.value)}
                      min={taskDate} // Can't end before it starts
                      className={
                        isDarkMode
                          ? "bg-slate-700 border-slate-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label
              className={`text-sm font-medium flex items-center gap-2 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}
            >
              <FileText className="w-4 h-4" />
              Notes
            </label>
            <Textarea
              placeholder="Add any additional notes or details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`min-h-[80px] ${
                isDarkMode
                  ? "bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
              }`}
            />
          </div>
        </div>

        {/* Actions */}
        <div
          className={`flex justify-end gap-3 pt-4 border-t ${isDarkMode ? "border-slate-700" : "border-gray-200"}`}
        >
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className={
              isDarkMode
                ? "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateTask}
            disabled={
              !taskTitle || !duration || !taskDate || !selectedTime || loading
            }
            className="bg-coral-500 hover:bg-coral-400 text-white disabled:opacity-50"
          >
            {loading
              ? editingTask
                ? "Updating..."
                : "Creating..."
              : editingTask
                ? "Update Task"
                : "Create Task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
