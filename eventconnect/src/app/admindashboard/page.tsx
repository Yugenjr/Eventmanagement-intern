"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { getEvents, updateEvent, deleteEvent, createEvent } from "@/lib/events";
import { Event, EventRegistration } from "@/types";
import { Calendar, Plus, Users, Edit, Trash2, Eye, Save, X, Settings } from "lucide-react";
import { subscribeToEventRegistrations, getEventRegistrations } from "@/lib/registrations";
import { rtdbEvents, rtdbFeedback, rtdbUsers, rtdbRegistrations } from "@/lib/rtdb-events";
import toast from "react-hot-toast";

// Helper function for safe date conversion
const convertToDate = (dateValue: any): Date => {
  if (dateValue instanceof Date) return dateValue;
  if (dateValue?.toDate && typeof dateValue.toDate === 'function') return dateValue.toDate();
  if (dateValue?.seconds) return new Date(dateValue.seconds * 1000);
  if (typeof dateValue === 'string') return new Date(dateValue);
  return new Date();
};

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [registrationsCount, setRegistrationsCount] = useState<Record<string, number>>({});
  const [recentLogins, setRecentLogins] = useState<Array<{uid:string; email:string; displayName:string; when:string}>>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
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
  const [viewingRegistrations, setViewingRegistrations] = useState<string | null>(null);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);

  // Auth guard will handle authentication and role checking

  useEffect(() => {
    const load = async () => {
      const res = await getEvents({}, { field: "createdAt", direction: "desc" }, { page: 1, limit: 100 });
      setEvents(res.events);
    };
    load();
  }, []);

  useEffect(() => {
    if (!editing) return;

    // Safe date conversion
    const convertDate = (dateValue: any) => {
      if (dateValue instanceof Date) return dateValue;
      if (dateValue?.toDate && typeof dateValue.toDate === 'function') return dateValue.toDate();
      if (dateValue?.seconds) return new Date(dateValue.seconds * 1000);
      return new Date(dateValue);
    };

    const d = convertDate(editing.date);
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

  // Real-time subscriptions for RTDB data
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    // Subscribe to real-time events from RTDB events section
    const eventsUnsub = rtdbEvents.subscribeToEvents((rtdbEventsData) => {
      console.log("🔄 Real-time events received from RTDB events section:", rtdbEventsData.length, "events");
      console.log("📋 Events data:", rtdbEventsData);

      // Update events state with real-time data
      setEvents(rtdbEventsData);

      // Update registration counts for each event
      rtdbEventsData.forEach(event => {
        setRegistrationsCount(prev => ({
          ...prev,
          [event.id]: event.registrationCount || 0
        }));
      });
    });
    unsubscribers.push(eventsUnsub);

    // Subscribe to real-time feedback from RTDB feedback section
    const feedbackUnsub = rtdbFeedback.subscribeToFeedback((feedbackData) => {
      console.log("📝 Admin: Received user feedback from RTDB:", feedbackData.length, "items");
      setFeedback(feedbackData);
    });
    unsubscribers.push(feedbackUnsub);

    // Subscribe to real-time registrations from RTDB registrations section
    const registrationsUnsub = rtdbRegistrations.subscribeToAllRegistrations((registrationsData) => {
      console.log("🎫 Admin: Received user registrations from RTDB:", registrationsData.length, "registrations");
      // Update registration counts for events
      const eventCounts: Record<string, number> = {};
      registrationsData.forEach(reg => {
        eventCounts[reg.eventId] = (eventCounts[reg.eventId] || 0) + 1;
      });
      setRegistrationsCount(eventCounts);
    });
    unsubscribers.push(registrationsUnsub);

    // Subscribe to real-time user count
    const usersUnsub = rtdbUsers.subscribeToUsersCount((count) => {
      setTotalUsers(count);
    });
    unsubscribers.push(usersUnsub);

    return () => unsubscribers.forEach((unsub) => unsub());
  }, []);

  const handleEdit = (event: Event) => {
    setEditing(event);

    // Safe date conversion
    const convertDate = (dateValue: any) => {
      if (dateValue instanceof Date) return dateValue;
      if (dateValue?.toDate && typeof dateValue.toDate === 'function') return dateValue.toDate();
      if (dateValue?.seconds) return new Date(dateValue.seconds * 1000);
      return new Date(dateValue);
    };

    const d = convertDate(event.date);
    setEditForm({
      title: event.title,
      description: event.description,
      date: d.toISOString().split('T')[0],
      time: d.toTimeString().slice(0, 5),
      location: event.location,
      category: event.category,
      maxAttendees: event.maxAttendees?.toString() || "",
      isPublic: event.isPublic ?? true,
      isPaid: event.isPaid ?? false,
      price: event.price?.toString() || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editing) return;

    try {
      setSaving(true);
      const eventDateTime = new Date(`${editForm.date}T${editForm.time}`);

      const updatedEventData = {
        id: editing.id,
        title: editForm.title,
        description: editForm.description,
        date: eventDateTime,
        location: editForm.location,
        category: editForm.category as any,
        maxAttendees: editForm.maxAttendees ? parseInt(editForm.maxAttendees) : undefined,
        isPublic: editForm.isPublic,
        isPaid: editForm.isPaid,
        price: editForm.isPaid && editForm.price ? parseFloat(editForm.price) : undefined,
      };

      await updateEvent(updatedEventData, user?.uid || "");

      const updatedEvent = {
        ...editing,
        ...updatedEventData,
      };

      // Update local state
      setEvents(prev => prev.map(e => e.id === editing.id ? updatedEvent as any : e));

      // Also save to RTDB for real-time updates
      await rtdbEvents.saveEvent(updatedEvent as any);

      setEditing(null);
      toast.success("Event updated successfully!");
    } catch (error) {
      toast.error("Failed to update event");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    try {
      await deleteEvent(eventId, user?.uid || "");

      // Also delete from RTDB
      await rtdbEvents.deleteEvent(eventId);

      setEvents(prev => prev.filter(e => e.id !== eventId));
      setDeletingId(null);
      toast.success("Event deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete event");
    }
  };

  const handleViewRegistrations = async (eventId: string) => {
    try {
      const registrations = await getEventRegistrations(eventId);
      setEventRegistrations(registrations);
      setViewingRegistrations(eventId);
    } catch (error) {
      toast.error("Failed to load registrations");
    }
  };

  return (
    <AuthGuard requireAuth={true} requiredRole="admin">
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold font-display bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Welcome back, {user?.displayName}! Manage your events and monitor platform activity.
              </p>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Use the quick actions below to manage your platform
            </div>
          </div>
        </div>

        {/* Admin Quick Actions */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Admin Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button asChild variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <Link href="/events/create">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Event
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <Link href="/admin/events">
                    <Calendar className="w-4 h-4 mr-2" />
                    All Events & Registrations
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <Link href="/admin/feedback">
                    <Users className="w-4 h-4 mr-2" />
                    View User Feedback
                  </Link>
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      console.log("🎪 Creating demo event for users...");

                      // Create a demo event that users can see and register for
                      const demoEvent = {
                        id: `demo-event-${Date.now()}`,
                        title: "Tech Conference 2024 - AI & Innovation",
                        description: "Join us for an exciting tech conference featuring the latest in AI, machine learning, and innovation. Network with industry leaders, attend workshops, and discover cutting-edge technologies.\n\n🎯 What you'll learn:\n• Latest AI trends and applications\n• Machine learning best practices\n• Innovation in tech industry\n• Networking opportunities\n\n👥 Who should attend:\n• Developers and engineers\n• Tech entrepreneurs\n• Students and professionals\n• Anyone interested in AI",
                        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                        location: "Tech Hub Convention Center, Downtown",
                        category: "technology",
                        isPublic: true,
                        isPaid: false,
                        maxAttendees: 100,
                        registrationCount: 0,
                        createdBy: user?.uid || "admin",
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        tags: ["AI", "Technology", "Innovation", "Networking"],
                      };

                      // Save to RTDB events section
                      await rtdbEvents.saveEvent(demoEvent as any);

                      // Also save to Firestore for consistency
                      try {
                        await createEvent({
                          title: demoEvent.title,
                          description: demoEvent.description,
                          date: demoEvent.date,
                          location: demoEvent.location,
                          category: demoEvent.category as any,
                          maxAttendees: demoEvent.maxAttendees,
                          isPublic: demoEvent.isPublic,
                          isPaid: demoEvent.isPaid,
                          tags: demoEvent.tags,
                        }, user?.uid || "admin");
                      } catch (firestoreError) {
                        console.warn("Firestore save failed, but RTDB save succeeded");
                      }

                      toast.success("Demo event created! Users can now see and register for it.");
                      console.log("✅ Demo event created successfully");
                    } catch (error) {
                      console.error("❌ Demo event creation failed:", error);
                      toast.error("Failed to create demo event");
                    }
                  }}
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Demo Event
                </Button>
              </div>

              {/* Additional Demo Events */}
              <div className="mt-4">
                <Button
                  onClick={async () => {
                    try {
                      console.log("🎪 Creating multiple demo events...");

                      const demoEvents = [
                        {
                          id: `demo-workshop-${Date.now()}`,
                          title: "Web Development Workshop",
                          description: "Learn modern web development with React, Next.js, and TypeScript. Perfect for beginners and intermediate developers.\n\n📚 Topics covered:\n• React fundamentals\n• Next.js features\n• TypeScript basics\n• Project deployment\n\n🎯 Requirements:\n• Basic HTML/CSS knowledge\n• Laptop with internet connection",
                          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
                          location: "Online Workshop - Zoom Link Provided",
                          category: "workshop",
                          isPublic: true,
                          isPaid: false,
                          maxAttendees: 50,
                          registrationCount: 0,
                          tags: ["React", "Next.js", "TypeScript", "Web Development"],
                        },
                        {
                          id: `demo-networking-${Date.now() + 1}`,
                          title: "Professional Networking Meetup",
                          description: "Connect with professionals from various industries. Great opportunity to expand your network and discover new opportunities.\n\n🤝 What to expect:\n• Structured networking sessions\n• Industry insights\n• Career opportunities\n• Refreshments provided\n\n👔 Dress code: Business casual",
                          date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
                          location: "Business Center, Main Street",
                          category: "networking",
                          isPublic: true,
                          isPaid: false,
                          maxAttendees: 75,
                          registrationCount: 0,
                          tags: ["Networking", "Career", "Business", "Professional"],
                        },
                        {
                          id: `demo-startup-${Date.now() + 2}`,
                          title: "Startup Pitch Competition",
                          description: "Watch innovative startups pitch their ideas to investors and industry experts. Open to all entrepreneurs and startup enthusiasts.\n\n🚀 Event highlights:\n• 10 startup pitches\n• Expert panel feedback\n• Networking opportunities\n• Prize for best pitch\n\n💡 Great for: Entrepreneurs, investors, students",
                          date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
                          location: "Innovation Hub, Tech District",
                          category: "business",
                          isPublic: true,
                          isPaid: false,
                          maxAttendees: 120,
                          registrationCount: 0,
                          tags: ["Startup", "Entrepreneurship", "Innovation", "Pitch"],
                        }
                      ];

                      for (const event of demoEvents) {
                        await rtdbEvents.saveEvent({
                          ...event,
                          createdBy: user?.uid || "admin",
                          createdAt: new Date(),
                          updatedAt: new Date(),
                        } as any);
                      }

                      toast.success(`${demoEvents.length} demo events created! Users can now browse and register.`);
                      console.log("✅ Multiple demo events created successfully");
                    } catch (error) {
                      console.error("❌ Demo events creation failed:", error);
                      toast.error("Failed to create demo events");
                    }
                  }}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  🎪 Create Multiple Demo Events (Workshop, Networking, Startup)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Beautiful Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">Total Events</CardTitle>
              <Calendar className="h-6 w-6 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{events.length}</div>
              <p className="text-xs text-blue-100 mt-1">📡 Real-time from RTDB events section</p>
              <div className="text-xs text-blue-200 mt-1">🔄 Live updates enabled</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">Total Users</CardTitle>
              <Users className="h-6 w-6 text-purple-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalUsers}</div>
              <p className="text-xs text-purple-100 mt-1">Registered users</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">Feedback Received</CardTitle>
              <Users className="h-6 w-6 text-green-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{feedback.length}</div>
              <p className="text-xs text-green-100 mt-1">User feedback submissions</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Events - Takes 2 columns */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Recent Events
                  </CardTitle>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/events/create">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Event
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {events.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No events created yet</p>
                    <Button asChild className="mt-4">
                      <Link href="/events/create">Create Your First Event</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {events.slice(0, 5).map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{event.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>📅 {convertToDate(event.date).toLocaleDateString()}</span>
                            <span>📍 {event.location}</span>
                            <span>👥 {registrationsCount[event.id] || 0} registered</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditing(event)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setDeletingId(event.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Recent Activity */}
          <div className="space-y-6">
            {/* Recent Feedback */}
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Recent Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {feedback.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No feedback yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {feedback.slice(0, 3).map((item, index) => (
                      <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm text-gray-900 dark:text-white">{item.userName}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {item.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                          📧 {item.userEmail} • 📂 {item.category}
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300">{item.message}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Logins */}
            <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Recent Logins
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {recentLogins.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {recentLogins.slice(0, 5).map((login, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {login.displayName?.charAt(0) || login.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {login.displayName || login.email}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{login.when}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Event Management Section */}
        <div className="mt-8">
          <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="text-xl font-semibold">Event Management</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-6">
                {events.map((ev) => (
          <Card key={ev.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{ev.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" /> {convertToDate(ev.date).toLocaleString()}
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" /> Registrations: {registrationsCount[ev.id] ?? ev.registrationCount}
                </div>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/events/${ev.id}`}>
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleViewRegistrations(ev.id)}>
                  <Users className="w-4 h-4 mr-1" />
                  Registrations
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEdit(ev)}>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setDeletingId(ev.id)}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>


                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {events.length === 0 && (
          <div className="text-center text-muted-foreground py-8">No events yet.</div>
        )}

      {/* Edit Event Dialog */}
      {editing && (
        <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
              <DialogDescription>
                Update the event details below.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={editForm.location}
                    onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={editForm.time}
                    onChange={(e) => setEditForm(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setEditing(null)} className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} disabled={saving} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* View Registrations Dialog */}
      {viewingRegistrations && (
        <Dialog open={!!viewingRegistrations} onOpenChange={() => setViewingRegistrations(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Event Registrations</DialogTitle>
              <DialogDescription>
                View all registrations for this event.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {eventRegistrations.length > 0 ? (
                <div className="space-y-2">
                  {eventRegistrations.map((registration, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{registration.displayName}</p>
                        <p className="text-sm text-muted-foreground">{registration.email}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {registration.registeredAt && convertToDate(registration.registeredAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No registrations yet for this event.
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingId && (
        <Dialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Event</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this event? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setDeletingId(null)} className="flex-1">
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => handleDelete(deletingId)} className="flex-1">
                Delete Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      </div>
    </div>
    </AuthGuard>
  );
}

