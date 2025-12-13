"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.adminPanel": "Admin Panel",
    "nav.logout": "Logout",
    "nav.backToDashboard": "Back to Dashboard",
    
    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.welcome": "Welcome back",
    "dashboard.liveSessions": "Live Sessions",
    "dashboard.recordedSessions": "Recorded Sessions",
    "dashboard.courses": "Courses",
    
    // Live Sessions
    "live.title": "Live Sessions",
    "live.selectDate": "Select Date",
    "live.chooseDate": "Choose a date to view live sessions",
    "live.noSessions": "No live sessions scheduled for this date",
    "live.upcoming": "Upcoming",
    "live.live": "Live",
    "live.completed": "Completed",
    "live.join": "Join Session",
    "live.leave": "Leave Session",
    "live.attendees": "Attendees",
    "live.duration": "Duration",
    
    // Recorded Sessions
    "recorded.title": "Recorded Sessions",
    "recorded.library": "Recording Library",
    "recorded.browseAll": "Browse all recorded sessions",
    "recorded.noRecordings": "No recordings available for this date",
    "recorded.watch": "Watch Now",
    "recorded.views": "views",
    "recorded.recordings": "recordings",
    
    // Courses
    "courses.title": "Course Curriculum",
    "courses.modulesAvailable": "modules available",
    "courses.noCourses": "No courses available yet",
    "courses.selectChapter": "Select a chapter to watch",
    "courses.noChapters": "No chapters yet",
    "courses.module": "Module",
    
    // Admin Panel
    "admin.title": "Admin Panel",
    "admin.subtitle": "Manage live sessions and recorded videos",
    "admin.scheduleSession": "Schedule Session",
    "admin.uploadRecording": "Upload Recording",
    "admin.manageSessions": "Manage Sessions",
    "admin.createUser": "Create User",
    "admin.manageCourses": "Manage Courses",
    
    // Schedule Session
    "schedule.title": "Schedule Live Session",
    "schedule.description": "Create a new live session for students",
    "schedule.sessionTitle": "Session Title",
    "schedule.sessionDescription": "Description",
    "schedule.date": "Date",
    "schedule.time": "Time",
    "schedule.duration": "Duration",
    "schedule.maxAttendees": "Max Attendees",
    "schedule.meetingLink": "Meeting Link",
    "schedule.schedule": "Schedule Session",
    "schedule.scheduling": "Scheduling...",
    "schedule.success": "Session scheduled successfully!",
    
    // Upload Recording
    "upload.title": "Upload Recorded Video",
    "upload.description": "Add a new recorded session to the library",
    "upload.videoTitle": "Video Title",
    "upload.videoDescription": "Description",
    "upload.recordedDate": "Recorded Date",
    "upload.duration": "Duration",
    "upload.videoUrl": "Video URL",
    "upload.thumbnailUrl": "Thumbnail URL",
    "upload.upload": "Upload Recording",
    "upload.uploading": "Uploading...",
    "upload.success": "Recording uploaded successfully!",
    
    // Create User
    "user.title": "Create New User",
    "user.description": "Add a new student, instructor, or admin to the platform",
    "user.fullName": "Full Name",
    "user.email": "Email",
    "user.password": "Password",
    "user.role": "Role",
    "user.student": "Student",
    "user.instructor": "Instructor",
    "user.admin": "Admin",
    "user.create": "Create User",
    "user.creating": "Creating...",
    "user.success": "User created successfully!",
    "user.selectedRole": "Selected Role",
    
    // Manage Courses
    "manageCourses.title": "Add Chapter Video",
    "manageCourses.description": "Add a new video to a course module",
    "manageCourses.selectModule": "Select Module",
    "manageCourses.chapterTitle": "Chapter Title",
    "manageCourses.existingChapters": "Existing Chapters",
    "manageCourses.manageDescription": "Manage all course chapters",
    "manageCourses.chapters": "chapters",
    "manageCourses.add": "Add Chapter",
    "manageCourses.adding": "Adding...",
    
    // Common
    "common.loading": "Loading...",
    "common.retry": "Retry",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.close": "Close",
    "common.required": "Required",
    "common.optional": "Optional",
    "common.success": "Success!",
    "common.error": "Error",
    "common.yes": "Yes",
    "common.no": "No",
  },
  ar: {
    // Navigation
    "nav.dashboard": "لوحة التحكم",
    "nav.adminPanel": "لوحة الإدارة",
    "nav.logout": "تسجيل الخروج",
    "nav.backToDashboard": "العودة إلى لوحة التحكم",
    
    // Dashboard
    "dashboard.title": "لوحة التحكم",
    "dashboard.welcome": "مرحباً بعودتك",
    "dashboard.liveSessions": "الحصص المباشرة",
    "dashboard.recordedSessions": "الحصص المسجلة",
    "dashboard.courses": "الدورات",
    
    // Live Sessions
    "live.title": "الحصص المباشرة",
    "live.selectDate": "اختر التاريخ",
    "live.chooseDate": "اختر تاريخاً لعرض الحصص المباشرة",
    "live.noSessions": "لا توجد حصص مباشرة مجدولة في هذا التاريخ",
    "live.upcoming": "قادم",
    "live.live": "مباشر",
    "live.completed": "منتهي",
    "live.join": "انضم للحصة",
    "live.leave": "مغادرة الحصة",
    "live.attendees": "الحضور",
    "live.duration": "المدة",
    
    // Recorded Sessions
    "recorded.title": "الحصص المسجلة",
    "recorded.library": "مكتبة التسجيلات",
    "recorded.browseAll": "تصفح جميع الحصص المسجلة",
    "recorded.noRecordings": "لا توجد تسجيلات متاحة لهذا التاريخ",
    "recorded.watch": "شاهد الآن",
    "recorded.views": "مشاهدة",
    "recorded.recordings": "تسجيل",
    
    // Courses
    "courses.title": "المنهج الدراسي",
    "courses.modulesAvailable": "وحدة متاحة",
    "courses.noCourses": "لا توجد دورات متاحة حتى الآن",
    "courses.selectChapter": "اختر فصلاً للمشاهدة",
    "courses.noChapters": "لا توجد فصول بعد",
    "courses.module": "الوحدة",
    
    // Admin Panel
    "admin.title": "لوحة الإدارة",
    "admin.subtitle": "إدارة الحصص المباشرة والفيديوهات المسجلة",
    "admin.scheduleSession": "جدولة حصة",
    "admin.uploadRecording": "رفع تسجيل",
    "admin.manageSessions": "إدارة الحصص",
    "admin.createUser": "إنشاء مستخدم",
    "admin.manageCourses": "إدارة الدورات",
    
    // Schedule Session
    "schedule.title": "جدولة حصة مباشرة",
    "schedule.description": "إنشاء حصة مباشرة جديدة للطلاب",
    "schedule.sessionTitle": "عنوان الحصة",
    "schedule.sessionDescription": "الوصف",
    "schedule.date": "التاريخ",
    "schedule.time": "الوقت",
    "schedule.duration": "المدة",
    "schedule.maxAttendees": "الحد الأقصى للحضور",
    "schedule.meetingLink": "رابط الاجتماع",
    "schedule.schedule": "جدولة الحصة",
    "schedule.scheduling": "جاري الجدولة...",
    "schedule.success": "تم جدولة الحصة بنجاح!",
    
    // Upload Recording
    "upload.title": "رفع فيديو مسجل",
    "upload.description": "إضافة حصة مسجلة جديدة إلى المكتبة",
    "upload.videoTitle": "عنوان الفيديو",
    "upload.videoDescription": "الوصف",
    "upload.recordedDate": "تاريخ التسجيل",
    "upload.duration": "المدة",
    "upload.videoUrl": "رابط الفيديو",
    "upload.thumbnailUrl": "رابط الصورة المصغرة",
    "upload.upload": "رفع التسجيل",
    "upload.uploading": "جاري الرفع...",
    "upload.success": "تم رفع التسجيل بنجاح!",
    
    // Create User
    "user.title": "إنشاء مستخدم جديد",
    "user.description": "إضافة طالب أو مدرس أو مسؤول جديد إلى المنصة",
    "user.fullName": "الاسم الكامل",
    "user.email": "البريد الإلكتروني",
    "user.password": "كلمة المرور",
    "user.role": "الدور",
    "user.student": "طالب",
    "user.instructor": "مدرس",
    "user.admin": "مسؤول",
    "user.create": "إنشاء مستخدم",
    "user.creating": "جاري الإنشاء...",
    "user.success": "تم إنشاء المستخدم بنجاح!",
    "user.selectedRole": "الدور المختار",
    
    // Manage Courses
    "manageCourses.title": "إضافة فيديو فصل",
    "manageCourses.description": "إضافة فيديو جديد إلى وحدة الدورة",
    "manageCourses.selectModule": "اختر الوحدة",
    "manageCourses.chapterTitle": "عنوان الفصل",
    "manageCourses.existingChapters": "الفصول الموجودة",
    "manageCourses.manageDescription": "إدارة جميع فصول الدورة",
    "manageCourses.chapters": "فصول",
    "manageCourses.add": "إضافة فصل",
    "manageCourses.adding": "جاري الإضافة...",
    
    // Common
    "common.loading": "جاري التحميل...",
    "common.retry": "إعادة المحاولة",
    "common.cancel": "إلغاء",
    "common.save": "حفظ",
    "common.delete": "حذف",
    "common.edit": "تعديل",
    "common.close": "إغلاق",
    "common.required": "مطلوب",
    "common.optional": "اختياري",
    "common.success": "نجح!",
    "common.error": "خطأ",
    "common.yes": "نعم",
    "common.no": "لا",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    // Load language from localStorage
    const savedLang = localStorage.getItem("language") as Language;
    if (savedLang && (savedLang === "en" || savedLang === "ar")) {
      setLanguageState(savedLang);
      document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = savedLang;
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
