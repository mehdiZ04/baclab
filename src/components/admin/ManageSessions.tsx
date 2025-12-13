"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Trash2, Video, Calendar } from "lucide-react";

interface LiveSession {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  attendees: number;
  maxAttendees: number;
  status: string;
  meetingLink?: string;
}

interface RecordedSession {
  id: string;
  title: string;
  recordedDate: string;
  duration: string;
  views: number;
  size: string;
  category: string;
  videoUrl: string;
}

export default function ManageSessions() {
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [recordedSessions, setRecordedSessions] = useState<RecordedSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const [liveRes, recordedRes] = await Promise.all([
        fetch("/api/live-sessions"),
        fetch("/api/recorded-sessions"),
      ]);

      const liveData = await liveRes.json();
      const recordedData = await recordedRes.json();

      setLiveSessions(liveData);
      setRecordedSessions(recordedData);
    } catch (err) {
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteLiveSession = async (id: string) => {
    if (!confirm("Are you sure you want to delete this live session?")) return;

    try {
      const response = await fetch(`/api/live-sessions/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setLiveSessions(liveSessions.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error("Error deleting session:", err);
    }
  };

  const deleteRecordedSession = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recorded session?")) return;

    try {
      const response = await fetch(`/api/recorded-sessions/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setRecordedSessions(recordedSessions.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error("Error deleting recording:", err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="live" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="live">Live Sessions ({liveSessions.length})</TabsTrigger>
        <TabsTrigger value="recorded">Recordings ({recordedSessions.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="live" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Manage Live Sessions</CardTitle>
            <CardDescription>View and delete scheduled live sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {liveSessions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No live sessions scheduled</p>
              </div>
            ) : (
              <div className="space-y-4">
                {liveSessions.map((session) => (
                  <Card key={session.id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{session.title}</h3>
                            <Badge>{session.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {new Date(session.date).toLocaleDateString()} at {session.time}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Duration: {session.duration} • Attendees: {session.attendees}/{session.maxAttendees}
                          </p>
                          {session.meetingLink && (
                            <p className="text-sm text-blue-600 mt-1 truncate">
                              {session.meetingLink}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteLiveSession(session.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="recorded" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Manage Recorded Sessions</CardTitle>
            <CardDescription>View and delete recorded videos</CardDescription>
          </CardHeader>
          <CardContent>
            {recordedSessions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Video className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No recorded sessions available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recordedSessions.map((session) => (
                  <Card key={session.id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{session.title}</h3>
                            <Badge variant="outline">{session.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Recorded: {new Date(session.recordedDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Duration: {session.duration} • Size: {session.size} • Views: {session.views}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteRecordedSession(session.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
