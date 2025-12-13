"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, BookOpen, Plus, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CourseChapter {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  duration: string | null;
  views: number;
  order: number;
}

interface CourseModule {
  id: string;
  moduleNumber: number;
  title: string;
  description: string | null;
  order: number;
  chapters: CourseChapter[];
}

export default function ManageCourses() {
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [chapterForm, setChapterForm] = useState({
    title: "",
    description: "",
    videoUrl: "",
    duration: "",
    order: 0,
  });

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await fetch("/api/courses");
      if (response.ok) {
        const data = await response.json();
        setModules(data);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedModule) {
      setMessage({ type: "error", text: "Please select a module" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/courses/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId: selectedModule,
          ...chapterForm,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add chapter");
      }

      setMessage({ type: "success", text: "Chapter added successfully!" });
      setChapterForm({
        title: "",
        description: "",
        videoUrl: "",
        duration: "",
        order: 0,
      });
      fetchModules();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to add chapter",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm("Are you sure you want to delete this chapter?")) {
      return;
    }

    try {
      const response = await fetch(`/api/courses/chapters?id=${chapterId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete chapter");
      }

      setMessage({ type: "success", text: "Chapter deleted successfully!" });
      fetchModules();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to delete chapter",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Chapter Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Chapter Video
          </CardTitle>
          <CardDescription>Add a new video to a course module</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddChapter} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="module">Select Module *</Label>
              <select
                id="module"
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="">-- Select Module --</option>
                {modules.map((module) => (
                  <option key={module.id} value={module.id}>
                    Module {module.moduleNumber}: {module.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Chapter Title *</Label>
                <Input
                  id="title"
                  value={chapterForm.title}
                  onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                  placeholder="Introduction to Variables"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={chapterForm.duration}
                  onChange={(e) => setChapterForm({ ...chapterForm, duration: e.target.value })}
                  placeholder="15:30"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="videoUrl">Video URL *</Label>
                <Input
                  id="videoUrl"
                  value={chapterForm.videoUrl}
                  onChange={(e) => setChapterForm({ ...chapterForm, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={chapterForm.description}
                  onChange={(e) => setChapterForm({ ...chapterForm, description: e.target.value })}
                  placeholder="Brief description of the chapter"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Order (for sorting)</Label>
                <Input
                  id="order"
                  type="number"
                  value={chapterForm.order}
                  onChange={(e) => setChapterForm({ ...chapterForm, order: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>
            </div>

            {message && (
              <div
                className={`flex items-center gap-2 p-4 rounded-md ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <p>{message.text}</p>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Chapter
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Chapters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Existing Chapters
          </CardTitle>
          <CardDescription>Manage all course chapters</CardDescription>
        </CardHeader>
        <CardContent>
          {modules.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No modules available</p>
          ) : (
            <div className="space-y-6">
              {modules.map((module) => (
                <div key={module.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">Module {module.moduleNumber}</h3>
                      <p className="text-sm text-muted-foreground">{module.title}</p>
                    </div>
                    <Badge>{module.chapters.length} chapters</Badge>
                  </div>
                  
                  {module.chapters.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No chapters yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {module.chapters.map((chapter) => (
                        <div
                          key={chapter.id}
                          className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-sm">{chapter.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {chapter.duration && `${chapter.duration} • `}
                              {chapter.views} views
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteChapter(chapter.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
