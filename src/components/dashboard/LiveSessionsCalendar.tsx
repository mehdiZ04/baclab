"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Clock, Users, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface LiveSession {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  attendees: number;
  status: "upcoming" | "live" | "completed" | "cancelled";
  meetingLink?: string;
  description?: string;
}

export default function LiveSessionsCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedSessions, setSelectedSessions] = useState<LiveSession[]>([]);
  const [allSessions, setAllSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const { t } = useLanguage();

  // Fetch all sessions on mount
  useEffect(() => {
    fetchAllSessions();
    
    // Update statuses every 30 seconds
    const interval = setInterval(() => {
      updateSessionStatuses();
      fetchAllSessions();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Fetch sessions for selected date
  useEffect(() => {
    if (date) {
      fetchSessionsByDate(date);
    }
  }, [date]);

  const fetchAllSessions = async () => {
    try {
      setLoading(true);
      
      // Update statuses first
      await updateSessionStatuses();
      
      const response = await fetch("/api/live-sessions");
      
      if (!response.ok) {
        throw new Error("Failed to fetch sessions");
      }
      
      const data = await response.json();
      setAllSessions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sessions");
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateSessionStatuses = async () => {
    try {
      await fetch("/api/live-sessions/update-status", {
        method: "POST",
      });
    } catch (err) {
      console.error("Error updating session statuses:", err);
    }
  };

  const fetchSessionsByDate = async (selectedDate: Date) => {
    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const response = await fetch(`/api/live-sessions?date=${dateStr}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch sessions for date");
      }
      
      const data = await response.json();
      setSelectedSessions(data);
    } catch (err) {
      console.error("Error fetching sessions by date:", err);
      setSelectedSessions([]);
    }
  };

  // Filter sessions for the selected date
  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (!selectedDate) {
      setSelectedSessions([]);
    }
  };

  // Get all session dates for highlighting
  const sessionDates = allSessions.map((session) => new Date(session.date));

  const getStatusColor = (status: LiveSession["status"]) => {
    switch (status) {
      case "live":
        return "bg-red-500 hover:bg-red-600";
      case "upcoming":
        return "bg-blue-500 hover:bg-blue-600";
      case "completed":
        return "bg-gray-500 hover:bg-gray-600";
      case "cancelled":
        return "bg-orange-500 hover:bg-orange-600";
      default:
        return "bg-gray-500";
    }
  };

  const isSessionLive = (session: LiveSession) => {
    const sessionDate = new Date(session.date);
    const now = new Date();
    
    // Session is live if it's within 15 minutes before or after the scheduled time
    const fifteenMinutesBefore = new Date(sessionDate.getTime() - 15 * 60000);
    const fifteenMinutesAfter = new Date(sessionDate.getTime() + 15 * 60000);
    
    return now >= fifteenMinutesBefore && now <= fifteenMinutesAfter;
  };

  const handleJoinSession = async (session: LiveSession) => {
    try {
      // Check if user can join
      const checkResponse = await fetch(`/api/active-session?sessionId=${session.id}`);
      const checkData = await checkResponse.json();

      if (!checkData.canJoin) {
        alert(checkData.message || "You are already in another session. Please leave that session first.");
        return;
      }

      // Mark user as joining the session
      const joinResponse = await fetch("/api/active-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id }),
      });

      if (!joinResponse.ok) {
        const errorData = await joinResponse.json();
        alert(errorData.error || "Failed to join session");
        return;
      }

      // Store active session ID locally
      setActiveSessionId(session.id);

      // Open the meeting link
      if (session.meetingLink) {
        window.open(session.meetingLink, '_blank');
      }
    } catch (error) {
      console.error("Error joining session:", error);
      alert("Failed to join session");
    }
  };

  const handleLeaveSession = async () => {
    try {
      const response = await fetch("/api/active-session", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to leave session");
      }

      // Clear active session ID
      setActiveSessionId(null);
      alert("You have left the session. You can now join another session.");
    } catch (error) {
      console.error("Error leaving session:", error);
      alert("Failed to leave session");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Section */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>{t("live.selectDate")}</CardTitle>
          <CardDescription>{t("live.chooseDate")}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            className="rounded-md border"
            modifiers={{
              sessionDay: sessionDates,
            }}
            modifiersClassNames={{
              sessionDay: "bg-primary/10 font-bold",
            }}
          />
        </CardContent>
      </Card>

      {/* Sessions List Section */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("live.title")}</CardTitle>
              <CardDescription>
                {date
                  ? `${t("live.chooseDate")} ${date.toLocaleDateString()}`
                  : t("live.chooseDate")}
              </CardDescription>
            </div>
            {activeSessionId && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleLeaveSession}
              >
                <Video className="h-4 w-4 mr-2" />
                {t("live.leave")}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="mx-auto h-12 w-12 mb-4 animate-spin text-primary" />
              <p className="text-muted-foreground">{t("common.loading")}</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p>{error}</p>
              <Button onClick={fetchAllSessions} variant="outline" className="mt-4">
                {t("common.retry")}
              </Button>
            </div>
          ) : selectedSessions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Video className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>{t("live.noSessions")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedSessions.map((session) => (
                <Card key={session.id} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">
                          {session.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {session.time} ({session.duration})
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{session.attendees} {t("live.attendees")}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      {(session.status === "live" || isSessionLive(session)) && session.meetingLink && (
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleJoinSession(session)}
                        >
                          <Video className="h-4 w-4 mr-2" />
                          {t("live.join")}
                        </Button>
                      )}
                      {session.status === "upcoming" && !isSessionLive(session) && (
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      )}
                      {session.status === "completed" && (
                        <Button size="sm" variant="secondary">
                          View Recording
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Upcoming Sessions */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>All Upcoming Sessions</CardTitle>
          <CardDescription>
            All scheduled live sessions across all dates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allSessions
                .filter((s: LiveSession) => s.status === "upcoming")
                .map((session: LiveSession) => (
                  <Card key={session.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline">
                          {new Date(session.date).toLocaleDateString()}
                        </Badge>
                        <Badge className={getStatusColor(session.status)}>
                          {session.status}
                        </Badge>
                      </div>
                      <h4 className="font-semibold mb-2">{session.title}</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {session.time} ({session.duration})
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{session.attendees} registered</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
