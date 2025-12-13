"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from "lucide-react";

export default function UploadRecording() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    recordedDate: "",
    duration: "",
    videoUrl: "",
    thumbnailUrl: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/recorded-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          views: 0,
          size: "N/A",
          category: "General",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload recording");
      }

      setSuccess(true);
      setFormData({
        title: "",
        description: "",
        recordedDate: "",
        duration: "",
        videoUrl: "",
        thumbnailUrl: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload recording");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Recorded Session</CardTitle>
        <CardDescription>Add a recorded video to the library</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Video Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., React State Management Deep Dive"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe what this recording covers..."
              value={formData.description}
              onChange={handleChange}
              className="w-full min-h-[100px] px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recordedDate">Recorded Date *</Label>
              <Input
                id="recordedDate"
                name="recordedDate"
                type="date"
                value={formData.recordedDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration *</Label>
              <Input
                id="duration"
                name="duration"
                placeholder="e.g., 1:45:30"
                value={formData.duration}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoUrl">Video URL *</Label>
            <Input
              id="videoUrl"
              name="videoUrl"
              type="url"
              placeholder="YouTube, Vimeo, Google Drive, or direct video URL"
              value={formData.videoUrl}
              onChange={handleChange}
              required
            />
            <p className="text-xs text-muted-foreground">
              Supports: YouTube, Vimeo, Google Drive (public), or direct MP4 links
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
            <Input
              id="thumbnailUrl"
              name="thumbnailUrl"
              type="url"
              placeholder="https://example.com/thumbnails/thumb.jpg"
              value={formData.thumbnailUrl}
              onChange={handleChange}
            />
          </div>

          {success && (
            <div className="p-4 bg-green-50 text-green-700 rounded-md">
              Recording uploaded successfully!
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Recording
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
