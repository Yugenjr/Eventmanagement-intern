"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { getEvents } from "@/lib/events";
import { Event, EventRegistration } from "@/types";
import { Calendar, Plus, Users } from "lucide-react";
import { subscribeToEventRegistrations } from "@/lib/registrations";

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [registrationsCount, setRegistrationsCount] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!loading) {
      if (!user) router.push("/auth");
      else if (user.role !== "admin") router.push("/events");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const load = async () => {
      const res = await getEvents({}, { field: "createdAt", direction: "desc" }, { page: 1, limit: 100 });
      setEvents(res.events);
    };
    load();
  }, []);

  useEffect(() => {
    const unsubscribers: (() => void)[] = [];
    events.forEach((ev) => {
      const unsub = subscribeToEventRegistrations(ev.id, (regs: EventRegistration[]) => {
        setRegistrationsCount((prev) => ({ ...prev, [ev.id]: regs.length }));
      });
      unsubscribers.push(unsub);
    });
    return () => unsubscribers.forEach((u) => u());
  }, [events]);

  if (loading || !user || user.role !== "admin") return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-display">Admin Dashboard</h1>
        <Button asChild>
          <Link href="/events/create">
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((ev) => (
          <Card key={ev.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{ev.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" /> {ev.date.toDate().toLocaleString()}
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" /> Registrations: {registrationsCount[ev.id] ?? ev.registrationCount}
                </div>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" className="flex-1">
                  <Link href={`/events/${ev.id}`}>View</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href={`/events/${ev.id}/edit`}>Edit</Link>
                </Button>
                {/* Delete could be wired to a dialog + delete API */}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center text-muted-foreground">No events yet.</div>
      )}
    </div>
  );
}

