"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { EventForm } from "@/components/forms/event-form";
import { useAuth } from "@/contexts/auth-context";

export default function CreateEventPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <EventForm />;
}
