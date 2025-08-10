"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EventCard } from "@/components/events/event-card";
import { useAuth } from "@/contexts/auth-context";
import { Event } from "@/types";
import {
  Calendar,
  Users,
  TrendingUp,
  Plus,
  BarChart3,
  Clock,
  MapPin,
  Edit,
  Trash2,
} from "lucide-react";

// Mock data
const mockUserEvents: Event[] = [
  {
    id: "1",
    title: "Tech Conference 2024",
    description: "Join industry leaders for the latest in technology trends and innovations.",
    date: { toDate: () => new Date("2024-03-15T10:00:00") } as any,
    location: "San Francisco, CA",
    category: "technology",
    bannerUrl: "",
    createdBy: "current-user",
    createdAt: { toDate: () => new Date() } as any,
    updatedAt: { toDate: () => new Date() } as any,
    registrationCount: 250,
    maxAttendees: 500,
    isPublic: true,
    tags: ["AI", "Blockchain", "Cloud"],
  },
  {
    id: "2",
    title: "Design Workshop",
    description: "Learn modern design principles and hands-on techniques from experts.",
    date: { toDate: () => new Date("2024-03-20T14:00:00") } as any,
    location: "New York, NY",
    category: "education",
    bannerUrl: "",
    createdBy: "current-user",
    createdAt: { toDate: () => new Date() } as any,
    updatedAt: { toDate: () => new Date() } as any,
    registrationCount: 50,
    maxAttendees: 100,
    isPublic: true,
    tags: ["Design", "UI/UX", "Workshop"],
  },
];

const mockRegisteredEvents: Event[] = [
  {
    id: "3",
    title: "Startup Networking",
    description: "Connect with entrepreneurs, investors, and fellow startup enthusiasts.",
    date: { toDate: () => new Date("2024-03-25T18:00:00") } as any,
    location: "Austin, TX",
    category: "business",
    bannerUrl: "",
    createdBy: "other-user",
    createdAt: { toDate: () => new Date() } as any,
    updatedAt: { toDate: () => new Date() } as any,
    registrationCount: 120,
    maxAttendees: 200,
    isPublic: true,
    tags: ["Networking", "Startup", "Business"],
  },
];

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [userEvents, setUserEvents] = useState<Event[]>(mockUserEvents);
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>(mockRegisteredEvents);
  const [activeTab, setActiveTab] = useState<"created" | "registered">("created");

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const totalRegistrations = userEvents.reduce((sum, event) => sum + event.registrationCount, 0);
  const upcomingEvents = userEvents.filter(event => event.date.toDate() > new Date());
  const pastEvents = userEvents.filter(event => event.date.toDate() <= new Date());

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.displayName}! Manage your events and track your activity.
          </p>
        </div>
        <Button asChild>
          <Link href="/events/create">
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingEvents.length} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRegistrations}</div>
            <p className="text-xs text-muted-foreground">
              Across all events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registered For</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registeredEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              Events you're attending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userEvents.length > 0 ? Math.round(totalRegistrations / userEvents.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Per event
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        <Button
          variant={activeTab === "created" ? "default" : "ghost"}
          onClick={() => setActiveTab("created")}
        >
          My Events ({userEvents.length})
        </Button>
        <Button
          variant={activeTab === "registered" ? "default" : "ghost"}
          onClick={() => setActiveTab("registered")}
        >
          Registered Events ({registeredEvents.length})
        </Button>
      </div>

      {/* Content */}
      {activeTab === "created" && (
        <div className="space-y-8">
          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Upcoming Events
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => (
                  <Card key={event.id} className="overflow-hidden">
                    <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5" />
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="capitalize">
                          {event.category}
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="w-4 h-4 mr-1" />
                          {event.registrationCount}
                        </div>
                      </div>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {event.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-2" />
                          {event.date.toDate().toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 mr-2" />
                          {event.location}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild className="flex-1">
                          <Link href={`/events/${event.id}`}>
                            View
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild className="flex-1">
                          <Link href={`/events/${event.id}/edit`}>
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-muted-foreground">
                Past Events
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.map((event) => (
                  <EventCard key={event.id} event={event} showActions={false} />
                ))}
              </div>
            </div>
          )}

          {/* No Events */}
          {userEvents.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first event to get started.
              </p>
              <Button asChild>
                <Link href="/events/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Event
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === "registered" && (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Events You're Attending</h2>
          {registeredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registeredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No registered events</h3>
              <p className="text-muted-foreground mb-4">
                Browse events and register for ones that interest you.
              </p>
              <Button asChild>
                <Link href="/events">
                  Browse Events
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
