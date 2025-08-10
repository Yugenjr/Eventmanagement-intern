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
import { EventCard } from "./event-card";
import { Event, EventCategory, EventFilters, EventSortOptions } from "@/types";
import { getEvents } from "@/lib/events";
import { Search, Filter, Calendar, Grid, List } from "lucide-react";
import { cn } from "@/lib/utils";

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

export function EventsList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | "all">("all");
  const [sortBy, setSortBy] = useState<"date" | "created" | "popular">("date");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [selectedCategory, sortBy]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      
      const filters: EventFilters = {};
      if (selectedCategory !== "all") {
        filters.category = selectedCategory;
      }

      const sortOptions: EventSortOptions = {
        field: sortBy === "date" ? "date" : sortBy === "created" ? "createdAt" : "registrationCount",
        direction: sortBy === "popular" ? "desc" : "asc",
      };

      const response = await getEvents(filters, sortOptions, { page: 1, limit: 50 });
      setEvents(response.events);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const upcomingEvents = filteredEvents.filter(event => event.date.toDate() > new Date());
  const pastEvents = filteredEvents.filter(event => event.date.toDate() <= new Date());

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted rounded-lg h-48 mb-4" />
              <div className="space-y-2">
                <div className="bg-muted rounded h-4 w-3/4" />
                <div className="bg-muted rounded h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display mb-2">Discover Events</h1>
        <p className="text-muted-foreground">
          Find amazing events happening around you
        </p>
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
