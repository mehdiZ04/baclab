"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import LiveSessionsCalendar from "@/components/dashboard/LiveSessionsCalendar";
import RecordedSessionsCalendar from "@/components/dashboard/RecordedSessionsCalendar";
import CoursesTab from "@/components/dashboard/CoursesTab";
import { signOut } from "next-auth/react";
import { Loader2, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground">
            {t("dashboard.welcome")}, {session.user?.name || session.user?.email}
          </p>
        </div>
        <div className="flex gap-2">
          <LanguageToggle />
          {((session.user as any)?.role === "admin" || (session.user as any)?.role === "instructor") && (
            <Link href="/admin">
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                {t("nav.adminPanel")}
              </Button>
            </Link>
          )}
          <Button
            variant="outline"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t("nav.logout")}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="live">{t("dashboard.liveSessions")}</TabsTrigger>
          <TabsTrigger value="recorded">{t("dashboard.recordedSessions")}</TabsTrigger>
          <TabsTrigger value="courses">{t("dashboard.courses")}</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="mt-6">
          <LiveSessionsCalendar />
        </TabsContent>

        <TabsContent value="recorded" className="mt-6">
          <RecordedSessionsCalendar />
        </TabsContent>

        <TabsContent value="courses" className="mt-6">
          <CoursesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
