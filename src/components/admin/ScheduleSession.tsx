"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

export default function ScheduleSession() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: "",
    maxAttendees: "",
    meetingLink: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      // Combine date and time into a single datetime
      const datetime = new Date(`${formData.date}T${formData.time}`);
      
      // Format time to 12-hour format
      const timeFormatted = new Date(`2000-01-01T${formData.time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      const response = await fetch("/api/live-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          date: datetime.toISOString(),
          time: timeFormatted,
          duration: formData.duration,
          maxAttendees: parseInt(formData.maxAttendees),
          meetingLink: formData.meetingLink,
          status: "upcoming",
          attendees: 0,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to schedule session");
      }

      setSuccess(true);
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        duration: "",
        maxAttendees: "",
        meetingLink: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to schedule session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Schedule a Live Session</CardTitle>
        <CardDescription>Create a new live session with Google Meet link</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Session Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Introduction to React Hooks"
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
              placeholder="Describe what this session will cover..."
              value={formData.description}
              onChange={handleChange}
              className="w-full min-h-[100px] px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration *</Label>
              <Input
                id="duration"
                name="duration"
                placeholder="e.g., 1 hour, 30 minutes"
                value={formData.duration}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAttendees">Max Attendees *</Label>
              <Input
                id="maxAttendees"
                name="maxAttendees"
                type="number"
                placeholder="e.g., 50"
                value={formData.maxAttendees}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meetingLink">Google Meet Link *</Label>
            <Input
              id="meetingLink"
              name="meetingLink"
              type="url"
              placeholder="https://meet.google.com/xxx-xxxx-xxx"
              value={formData.meetingLink}
              onChange={handleChange}
              required
            />
          </div>

          {success && (
            <div className="p-4 bg-green-50 text-green-700 rounded-md">
              Session scheduled successfully!
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
                Scheduling...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Session
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
