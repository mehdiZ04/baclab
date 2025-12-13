"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Eye, BookOpen, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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

export default function CoursesTab() {
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [selectedChapter, setSelectedChapter] = useState<CourseChapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/courses");
      
      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }
      
      const data = await response.json();
      setModules(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load courses");
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const handleWatchChapter = async (chapter: CourseChapter) => {
    setSelectedChapter(chapter);
    
    // Increment view count
    try {
      await fetch("/api/courses/chapters", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId: chapter.id }),
      });
      
      // Update local state
      setModules(modules.map(module => ({
        ...module,
        chapters: module.chapters.map(ch => 
          ch.id === chapter.id ? { ...ch, views: ch.views + 1 } : ch
        ),
      })));
    } catch (err) {
      console.error("Error updating views:", err);
    }
  };

  const getYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const getEmbedUrl = (url: string): string => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = getYouTubeVideoId(url);
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    } else if (url.includes('vimeo.com')) {
      const match = url.match(/vimeo\.com\/(\d+)/);
      return match ? `https://player.vimeo.com/video/${match[1]}` : url;
    } else if (url.includes('drive.google.com')) {
      return url.replace('/view', '/preview');
    }
    return url;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="mx-auto h-12 w-12 mb-4 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        <p>{error}</p>
        <Button onClick={fetchCourses} variant="outline" className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>No courses available yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Course Modules List */}
      <Card className="lg:col-span-1 max-h-[calc(100vh-200px)] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Course Curriculum
          </CardTitle>
          <CardDescription>{modules.length} modules available</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {modules.map((module) => (
            <div key={module.id} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {expandedModules.has(module.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <div className="text-left">
                    <div className="font-semibold">Module {module.moduleNumber}</div>
                    <div className="text-sm text-muted-foreground">{module.title}</div>
                  </div>
                </div>
                <Badge variant="secondary">{module.chapters.length}</Badge>
              </button>
              
              {expandedModules.has(module.id) && (
                <div className="border-t bg-muted/20">
                  {module.chapters.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground text-center">
                      No chapters yet
                    </p>
                  ) : (
                    module.chapters.map((chapter) => (
                      <button
                        key={chapter.id}
                        onClick={() => handleWatchChapter(chapter)}
                        className={`w-full p-3 flex items-start gap-3 hover:bg-muted/50 transition-colors border-b last:border-b-0 ${
                          selectedChapter?.id === chapter.id ? "bg-primary/10" : ""
                        }`}
                      >
                        <Play className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium line-clamp-2">{chapter.title}</div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            {chapter.duration && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {chapter.duration}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {chapter.views}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Video Player */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            {selectedChapter ? selectedChapter.title : "Select a chapter to watch"}
          </CardTitle>
          {selectedChapter?.description && (
            <CardDescription>{selectedChapter.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {selectedChapter ? (
            <div className="space-y-4">
              <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                {selectedChapter.videoUrl.includes('youtube.com') || selectedChapter.videoUrl.includes('youtu.be') ? (
                  <iframe
                    className="w-full h-full"
                    src={getEmbedUrl(selectedChapter.videoUrl)}
                    title={selectedChapter.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : selectedChapter.videoUrl.includes('vimeo.com') ? (
                  <iframe
                    className="w-full h-full"
                    src={getEmbedUrl(selectedChapter.videoUrl)}
                    title={selectedChapter.title}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : selectedChapter.videoUrl.includes('drive.google.com') ? (
                  <iframe
                    className="w-full h-full"
                    src={getEmbedUrl(selectedChapter.videoUrl)}
                    title={selectedChapter.title}
                    allow="autoplay"
                    allowFullScreen
                  />
                ) : (
                  <video
                    className="w-full h-full"
                    controls
                    controlsList="nodownload"
                    src={selectedChapter.videoUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {selectedChapter.duration && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{selectedChapter.duration}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{selectedChapter.views} views</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <Play className="mx-auto h-16 w-16 mb-4 opacity-50" />
              <p>Select a chapter from the curriculum to start learning</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
