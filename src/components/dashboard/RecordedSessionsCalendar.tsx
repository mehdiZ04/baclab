"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Clock, Eye, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

interface RecordedSession {
  id: string;
  title: string;
  recordedDate: string;
  duration: string;
  views: number;
  size: string;
  thumbnail?: string;
  category: string;
  videoUrl: string;
  downloadUrl?: string;
  description?: string;
}

export default function RecordedSessionsCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedRecordings, setSelectedRecordings] = useState<RecordedSession[]>([]);
  const [allRecordings, setAllRecordings] = useState<RecordedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  // Fetch all recordings on mount
  useEffect(() => {
    fetchAllRecordings();
  }, []);

  // Fetch recordings for selected date
  useEffect(() => {
    if (date) {
      fetchRecordingsByDate(date);
    }
  }, [date]);

  const fetchAllRecordings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/recorded-sessions");
      
      if (!response.ok) {
        throw new Error("Failed to fetch recordings");
      }
      
      const data = await response.json();
      setAllRecordings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load recordings");
      console.error("Error fetching recordings:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecordingsByDate = async (selectedDate: Date) => {
    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const response = await fetch(`/api/recorded-sessions?date=${dateStr}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch recordings for date");
      }
      
      const data = await response.json();
      setSelectedRecordings(data);
    } catch (err) {
      console.error("Error fetching recordings by date:", err);
      setSelectedRecordings([]);
    }
  };



  // Filter recordings for the selected date
  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (!selectedDate) {
      setSelectedRecordings([]);
    }
  };

  // Get all recording dates for highlighting
  const recordingDates = allRecordings.map((recording) => new Date(recording.recordedDate));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Section */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
          <CardDescription>Choose a date to view recorded sessions</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            className="rounded-md border"
            modifiers={{
              recordingDay: recordingDates,
            }}
            modifiersClassNames={{
              recordingDay: "bg-purple-100 dark:bg-purple-900/20 font-bold",
            }}
          />
        </CardContent>
      </Card>

      {/* Recordings List Section */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Recorded Sessions</CardTitle>
          <CardDescription>
            {date
              ? `Recordings from ${date.toLocaleDateString()}`
              : "Select a date to view recordings"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="mx-auto h-12 w-12 mb-4 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading recordings...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p>{error}</p>
              <Button onClick={fetchAllRecordings} variant="outline" className="mt-4">
                Retry
              </Button>
            </div>
          ) : selectedRecordings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Play className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No recordings available for this date</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedRecordings.map((recording) => (
                <Card key={recording.id} className="border-l-4 border-l-purple-500">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold">
                            {recording.title}
                          </h3>
                          <Badge variant="secondary">{recording.category}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{recording.duration}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{recording.views} views</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{new Date(recording.recordedDate).toLocaleDateString()}</span>
                          </div>
                          <span className="text-xs">Size: {recording.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/watch/${recording.id}`}>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                          <Play className="h-4 w-4 mr-2" />
                          Watch Now
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Recordings Library */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Recording Library</CardTitle>
          <CardDescription>
            Browse all recorded sessions ({allRecordings.length} recordings)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allRecordings.map((recording) => (
              <Card
                key={recording.id}
                className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer"
              >
                <CardContent className="pt-6">
                  <div className="aspect-video bg-gradient-to-br from-purple-500 to-blue-600 rounded-md mb-3 flex items-center justify-center">
                    <Play className="h-12 w-12 text-white opacity-80" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold line-clamp-2 text-sm">
                        {recording.title}
                      </h4>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {recording.category}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{recording.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{recording.views}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        <span>{new Date(recording.recordedDate).toLocaleDateString()}</span>
                      </div>
                      <div className="text-xs font-medium">{recording.size}</div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Link href={`/watch/${recording.id}`} className="flex-1">
                        <Button size="sm" className="w-full text-xs h-8">
                          <Play className="h-3 w-3 mr-1" />
                          Watch
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
