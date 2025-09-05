"use client";

import {
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Timer,
  MoreVertical,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface Task {
  id: string;
  title: string;
  duration: number; // in minutes
  startTime: string;
  completed: boolean;
  category: "planned" | "inbox";
  color: string;
}

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Morning standup meeting",
    duration: 30,
    startTime: "09:00",
    completed: true,
    category: "planned",
    color: "bg-blue-500",
  },
  {
    id: "2",
    title: "Review project requirements",
    duration: 45,
    startTime: "09:30",
    completed: false,
    category: "planned",
    color: "bg-coral-500",
  },
  {
    id: "3",
    title: "Design system updates",
    duration: 60,
    startTime: "10:15",
    completed: false,
    category: "planned",
    color: "bg-purple-500",
  },
  {
    id: "4",
    title: "Client call preparation",
    duration: 15,
    startTime: "11:15",
    completed: false,
    category: "inbox",
    color: "bg-green-500",
  },
];

export default function TaskTimeline() {
  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Today's Timeline
            </h1>
            <p className="text-slate-400">Tuesday, March 12, 2024</p>
          </div>
          <Button className="bg-coral-500 hover:bg-coral-400 text-slate-900">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-700"></div>

          {/* Time markers and tasks */}
          <div className="space-y-6">
            {mockTasks.map((task, index) => (
              <div key={task.id} className="relative flex items-start gap-6">
                {/* Time marker */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-slate-800 border-2 border-slate-600 rounded-full flex items-center justify-center relative z-10">
                    <Clock className="w-5 h-5 text-slate-300" />
                  </div>
                  <div className="text-sm text-slate-400 mt-2 font-mono">
                    {task.startTime}
                  </div>
                </div>

                {/* Task card */}
                <Card className="flex-1 bg-slate-800 border-slate-700 p-4 hover:bg-slate-750 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Task status */}
                      <button className="mt-1">
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-400 hover:text-coral-400" />
                        )}
                      </button>

                      {/* Task content */}
                      <div className="flex-1">
                        <h3
                          className={`font-medium ${task.completed ? "text-slate-400 line-through" : "text-white"}`}
                        >
                          {task.title}
                        </h3>

                        {/* Task metadata */}
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-sm text-slate-400">
                            <Timer className="w-3 h-3" />
                            <span>{task.duration}m</span>
                          </div>

                          <div
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              task.category === "planned"
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-orange-500/20 text-orange-400"
                            }`}
                          >
                            {task.category}
                          </div>

                          <div
                            className={`w-3 h-3 rounded-full ${task.color}`}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Task actions */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-white"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Add task prompt */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400">
            <Plus className="w-4 h-4" />
            <span>Add more tasks to your timeline</span>
          </div>
        </div>
      </div>
    </div>
  );
}
