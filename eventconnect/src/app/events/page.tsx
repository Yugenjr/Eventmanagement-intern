"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EventCard } from "@/components/events/event-card";
import { Event, EventCategory, EventFilters, EventSortOptions } from "@/types";
import { Search, Filter, Calendar, Grid, List, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { rtdbEvents } from "@/lib/rtdb-events";

const categories: EventCategory[] = [
  "technology",
  "business",
  "education",
  "health",
  "sports",
  "entertainment",
  "food",
  "travel",
  "art",
  "music",
  "networking",
  "workshop",
  "conference",
  "meetup",
  "other",
];

// Mock data for demonstration
const mockEvents: Event[] = [
  {
    id: "1",
    title: "Tech Conference 2024",
    description: "Join industry leaders for the latest in technology trends and innovations. This comprehensive conference covers AI, blockchain, cloud computing, and emerging technologies.",
    date: { toDate: () => new Date("2024-03-15T10:00:00") } as any,
    location: "San Francisco, CA",
    category: "technology",
    bannerUrl: "",
    createdBy: "user1",
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
    description: "Learn modern design principles and hands-on techniques from industry experts. Perfect for beginners and intermediate designers.",
    date: { toDate: () => new Date("2024-03-20T14:00:00") } as any,
    location: "New York, NY",
    category: "education",
    bannerUrl: "",
    createdBy: "user2",
    createdAt: { toDate: () => new Date() } as any,
    updatedAt: { toDate: () => new Date() } as any,
    registrationCount: 50,
    maxAttendees: 100,
    isPublic: true,
    tags: ["Design", "UI/UX", "Workshop"],
  },
  {
    id: "3",
    title: "Startup Networking",
    description: "Connect with entrepreneurs, investors, and fellow startup enthusiasts. Great opportunity to build meaningful business relationships.",
    date: { toDate: () => new Date("2024-03-25T18:00:00") } as any,
    location: "Austin, TX",
    category: "business",
    bannerUrl: "",
    createdBy: "user3",
    createdAt: { toDate: () => new Date() } as any,
    updatedAt: { toDate: () => new Date() } as any,
    registrationCount: 120,
    maxAttendees: 200,
    isPublic: true,
    tags: ["Networking", "Startup", "Business"],
  },
];

// Helper function for safe date conversion
const convertToDate = (dateValue: any): Date => {
  if (dateValue instanceof Date) return dateValue;
  if (dateValue?.toDate && typeof dateValue.toDate === 'function') return dateValue.toDate();
  if (dateValue?.seconds) return new Date(dateValue.seconds * 1000);
  if (typeof dateValue === 'string') return new Date(dateValue);
  return new Date();
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "all">("all");
  const [sortBy, setSortBy] = useState<"date" | "created" | "popular">("date");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();

  // Load real events from RTDB
  useEffect(() => {
    if (!user) {
      window.location.href = "/auth";
      return;
    }

    // Subscribe to real-time events
    const unsubscribe = rtdbEvents.subscribeToEvents((eventsData) => {
      console.log("📅 Events page: Received events from RTDB:", eventsData.length);
      setEvents(eventsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return convertToDate(a.date).getTime() - convertToDate(b.date).getTime();
      case "created":
        return convertToDate(b.createdAt).getTime() - convertToDate(a.createdAt).getTime();
      case "popular":
        return b.registrationCount - a.registrationCount;
      default:
        return 0;
    }
  });

  const upcomingEvents = sortedEvents.filter(event => convertToDate(event.date) > new Date());
  const pastEvents = sortedEvents.filter(event => convertToDate(event.date) <= new Date());

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold font-display mb-2">Discover Events</h1>
            <p className="text-muted-foreground">
              Find amazing events happening around you
            </p>
          </div>
          
          {user?.role === "admin" && (
            <Button asChild>
              <Link href="/events/create">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        {showFilters && (
          <div className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as EventCategory | "all")}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Sort by</label>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as "date" | "created" | "popular")}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="created">Recently Added</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {filteredEvents.length} events found
          </p>
          {selectedCategory !== "all" && (
            <Badge variant="secondary" className="capitalize">
              {selectedCategory}
            </Badge>
          )}
        </div>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Events
          </h2>
          <div className={cn(
            viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          )}>
            {upcomingEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                variant={viewMode === "list" ? "compact" : "default"}
              />
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
          <div className={cn(
            viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          )}>
            {pastEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                variant={viewMode === "list" ? "compact" : "default"}
                showActions={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Events Found */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No events found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filters to find more events.
          </p>
          <Button onClick={() => {
            setSearchTerm("");
            setSelectedCategory("all");
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
