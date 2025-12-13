"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Eye, Clock, Calendar } from "lucide-react";
import Link from "next/link";

interface RecordedSession {
  id: string;
  title: string;
  description: string;
  recordedDate: string;
  duration: string;
  views: number;
  size: string;
  category: string;
  videoUrl: string;
  thumbnailUrl?: string;
}

export default function WatchRecordingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [recording, setRecording] = useState<RecordedSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (params.id) {
      fetchRecording(params.id as string);
    }
  }, [params.id]);

  const fetchRecording = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/recorded-sessions/${id}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch recording");
      }
      
      const data = await response.json();
      setRecording(data);
      
      // Increment view count
      await fetch(`/api/recorded-sessions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ views: data.views + 1 }),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load recording");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Helper function to get YouTube video ID
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

  // Helper function to get proper embed URL
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

  if (error || !recording) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-destructive mb-4">{error || "Recording not found"}</p>
              <Link href="/dashboard">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{recording.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(recording.recordedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{recording.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{recording.views} views</span>
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-base">
              {recording.category}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Video Player */}
          <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
            {recording.videoUrl.includes('youtube.com') || recording.videoUrl.includes('youtu.be') ? (
              <iframe
                className="w-full h-full"
                src={getEmbedUrl(recording.videoUrl)}
                title={recording.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : recording.videoUrl.includes('vimeo.com') ? (
              <iframe
                className="w-full h-full"
                src={getEmbedUrl(recording.videoUrl)}
                title={recording.title}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            ) : recording.videoUrl.includes('drive.google.com') ? (
              <iframe
                className="w-full h-full"
                src={getEmbedUrl(recording.videoUrl)}
                title={recording.title}
                allow="autoplay"
                allowFullScreen
              />
            ) : (
              <video
                className="w-full h-full"
                controls
                controlsList="nodownload"
                poster={recording.thumbnailUrl}
              >
                <source src={recording.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xl font-semibold mb-2">About this recording</h3>
            <p className="text-muted-foreground">{recording.description}</p>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-semibold">{recording.category}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-semibold">{recording.duration}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recorded</p>
              <p className="font-semibold">{new Date(recording.recordedDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Views</p>
              <p className="font-semibold">{recording.views}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
