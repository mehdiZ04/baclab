"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut, ArrowLeft } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import ScheduleSession from "@/components/admin/ScheduleSession";
import UploadRecording from "@/components/admin/UploadRecording";
import ManageSessions from "@/components/admin/ManageSessions";
import CreateUser from "@/components/admin/CreateUser";
import ManageCourses from "@/components/admin/ManageCourses";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";

declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: User & {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    // Check if user is admin or instructor
    if (status === "authenticated" && session?.user?.role !== "admin" && session?.user?.role !== "instructor") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!session || (session.user?.role !== "admin" && session.user?.role !== "instructor")) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">{t("admin.title")}</h1>
          <p className="text-muted-foreground">
            {t("admin.subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <LanguageToggle />
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("nav.backToDashboard")}
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t("nav.logout")}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full max-w-4xl grid-cols-5">
          <TabsTrigger value="schedule">{t("admin.scheduleSession")}</TabsTrigger>
          <TabsTrigger value="upload">{t("admin.uploadRecording")}</TabsTrigger>
          <TabsTrigger value="manage">{t("admin.manageSessions")}</TabsTrigger>
          <TabsTrigger value="users">{t("admin.createUser")}</TabsTrigger>
          <TabsTrigger value="courses">{t("admin.manageCourses")}</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="mt-6">
          <ScheduleSession />
        </TabsContent>

        <TabsContent value="upload" className="mt-6">
          <UploadRecording />
        </TabsContent>

        <TabsContent value="manage" className="mt-6">
          <ManageSessions />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <CreateUser />
        </TabsContent>

        <TabsContent value="courses" className="mt-6">
          <ManageCourses />
        </TabsContent>
      </Tabs>
    </div>
  );
}
