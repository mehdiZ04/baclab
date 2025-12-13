"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLanguage(language === "en" ? "ar" : "en")}
      className="gap-2"
    >
      <Languages className="h-4 w-4" />
      <span className="font-medium">{language === "en" ? "العربية" : "English"}</span>
    </Button>
  );
}
