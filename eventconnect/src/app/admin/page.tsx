"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { getEvents, updateEvent, deleteEvent } from "@/lib/events";
import { Event, EventRegistration } from "@/types";
import { Calendar, Plus, Users } from "lucide-react";
import { subscribeToEventRegistrations } from "@/lib/registrations";

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [registrationsCount, setRegistrationsCount] = useState<Record<string, number>>({});
  const [recentLogins, setRecentLogins] = useState<Array<{uid:string; email:string; displayName:string; when:string}>>([]);
  const [editing, setEditing] = useState<Event | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "",
    maxAttendees: "",
    isPublic: true,
    isPaid: false,
    price: "",
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    if (!editing) return;
    const d = editing.date.toDate();
    setEditForm({
      title: editing.title,
      description: editing.description,
      date: d.toISOString().split("T")[0],
      time: d.toTimeString().slice(0, 5),
      location: editing.location,
      category: editing.category,
      maxAttendees: (editing.maxAttendees ?? "").toString(),
      isPublic: editing.isPublic,
      isPaid: editing.isPaid ?? false,
      price: (editing.price ?? "").toString(),
    });
  }, [editing]);

  // Recent logins from RTDB (polling the provided URL)
  useEffect(() => {
    const dbUrl = "https://event-d540a-default-rtdb.asia-southeast1.firebasedatabase.app/";
    const endpoint = `${dbUrl.replace(/\/$/, "")}/recentLogins.json`;

    let mounted = true;
    const fetchLogins = async () => {
      try {
        const res = await fetch(endpoint);
        const data = await res.json();
        if (!mounted || !data) return;
        const items = Object.values<any>(data)
          .map((v: any) => ({ uid: v.uid, email: v.email, displayName: v.displayName || "", when: v.when }))
          .sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime())
          .slice(0, 10);
        setRecentLogins(items);
      } catch {}
    };

    fetchLogins();
    const id = setInterval(fetchLogins, 10000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
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
        {user.role === "admin" && (
          <Button asChild>
            <Link href="/events/create">
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Link>
          </Button>
        )}
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Recent Logins from RTDB */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Recent Logins</CardTitle>
          </CardHeader>
          <CardContent>
            {recentLogins.length === 0 ? (
              <div className="text-sm text-muted-foreground">No login activity yet.</div>
            ) : (
              <ul className="space-y-2">
                {recentLogins.map((u, idx) => (
                  <li key={idx} className="flex items-center justify-between text-sm">
                    <div className="truncate">
                      <div className="font-medium truncate">{u.displayName || u.email}</div>
                      <div className="text-muted-foreground truncate">{u.email}</div>
                    </div>
                    <div className="text-muted-foreground text-xs whitespace-nowrap ml-2">{new Date(u.when).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
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
                {user.role === "admin" && (
                  <>
                    <Button variant="outline" className="flex-1" onClick={() => setEditing(ev)}>Edit</Button>
                    <Button variant="destructive" className="flex-1" onClick={() => setDeletingId(ev.id)}>Delete</Button>
                  </>
                )}
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

