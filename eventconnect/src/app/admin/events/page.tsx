"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, MapPin, Users, Eye, Edit, Trash2, Plus, Clock } from "lucide-react";
import Link from "next/link";
import { rtdbEvents } from "@/lib/rtdb-events";
import { Event } from "@/types/event";

export default function AdminEventsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [registrationsCount, setRegistrationsCount] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth");
      } else if (user.role !== "admin") {
        router.push("/userdashboard");
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === "admin") {
      // ADMIN-ONLY: Subscribe to all events and user registration data
      console.log("🔐 Admin accessing all events and user registration data");
      const unsubscribe = rtdbEvents.subscribeToEvents((eventsData) => {
        console.log("📅 Admin events view: Received events with user data:", eventsData.length, "events");
        setEvents(eventsData);

        // ADMIN-ONLY: Access to user registration counts and personal data
        eventsData.forEach(event => {
          setRegistrationsCount(prev => ({
            ...prev,
            [event.id]: event.registrationCount || 0
          }));
        });

        setIsLoading(false);
      });

      return () => unsubscribe();
    } else if (user && user.role !== "admin") {
      // Non-admin users should not access this page
      console.warn("🚫 Non-admin user attempted to access admin events data");
      router.push("/userdashboard");
    }
  }, [user, router]);

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    
    if (eventDate < now) {
      return { label: "Completed", color: "bg-gray-100 text-gray-800" };
    } else if (eventDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
      return { label: "Starting Soon", color: "bg-yellow-100 text-yellow-800" };
    } else {
      return { label: "Upcoming", color: "bg-green-100 text-green-800" };
    }
  };

  const formatDate = (date: any) => {
    try {
      const eventDate = date instanceof Date ? date : 
                       date?.toDate ? date.toDate() : 
                       new Date(date);
      return eventDate.toLocaleDateString() + " " + eventDate.toLocaleTimeString();
    } catch {
      return "Invalid Date";
    }
  };

  if (loading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  const totalRegistrations = Object.values(registrationsCount).reduce((sum, count) => sum + count, 0);
  const upcomingEvents = events.filter(event => new Date(event.date) > new Date());
  const completedEvents = events.filter(event => new Date(event.date) <= new Date());

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admindashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-display">All Events & Registrations</h1>
            <p className="text-muted-foreground">
              Manage all events and view registration details
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/events/create">
            <Plus className="w-4 h-4 mr-2" />
            Create New Event
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold">{upcomingEvents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Registrations</p>
                <p className="text-2xl font-bold">{totalRegistrations}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedEvents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {events.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events found</h3>
              <p className="text-muted-foreground mb-4">
                Start by creating your first event.
              </p>
              <Button asChild>
                <Link href="/events/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Event
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          events.map((event) => {
            const status = getEventStatus(event);
            const registrations = registrationsCount[event.id] || 0;
            const capacity = event.maxAttendees || 0;
            const occupancyRate = capacity > 0 ? (registrations / capacity) * 100 : 0;
            
            return (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{event.title}</CardTitle>
                        <Badge className={status.color}>
                          {status.label}
                        </Badge>
                        {event.isPublic ? (
                          <Badge variant="outline">Public</Badge>
                        ) : (
                          <Badge variant="secondary">Private</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-3">{event.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-green-600" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-purple-600" />
                          <span>
                            {registrations} / {capacity || "∞"} registered
                            {capacity > 0 && (
                              <span className="ml-1 text-muted-foreground">
                                ({occupancyRate.toFixed(0)}% full)
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/events/${event.id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/events/${event.id}/edit`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {/* Registration Progress Bar */}
                {capacity > 0 && (
                  <CardContent className="pt-0">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{registrations} registered</span>
                      <span>{capacity - registrations} spots remaining</span>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
