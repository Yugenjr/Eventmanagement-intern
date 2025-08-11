"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Info, ExternalLink } from "lucide-react";
import { isDemoMode } from "@/lib/demo-data";

export function DemoNotice() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isDemoMode() || !isVisible) {
    return null;
  }

  return (
    <Alert className="mb-6 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <Info className="h-4 w-4 text-orange-600 dark:text-orange-400" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <strong className="text-orange-800 dark:text-orange-200">Demo Mode:</strong>{" "}
          <span className="text-orange-700 dark:text-orange-300">
            Firebase is not configured. Using demo data. 
          </span>
          <a 
            href="/FIREBASE_SETUP.md" 
            target="_blank" 
            className="inline-flex items-center gap-1 ml-2 text-orange-600 dark:text-orange-400 hover:underline"
          >
            Setup Guide <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}
