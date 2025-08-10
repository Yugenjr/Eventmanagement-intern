"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { Event, EventRegistration } from "@/types";
import { formatDateTime, formatDate, getInitials } from "@/lib/utils";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Share2,
  Edit,
  Trash2,
  ArrowLeft,
  Heart,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

// Mock event data
const mockEvent: Event = {
  id: "1",
  title: "Tech Conference 2024",
  description: "Join industry leaders for the latest in technology trends and innovations. This comprehensive conference covers AI, blockchain, cloud computing, and emerging technologies. Network with professionals, attend workshops, and discover the future of technology.\n\nWhat you'll learn:\n• Latest AI and machine learning trends\n• Blockchain applications in business\n• Cloud computing best practices\n• Emerging technologies and their impact\n\nWho should attend:\n• Software developers\n• Tech entrepreneurs\n• Product managers\n• Technology enthusiasts",
  date: { toDate: () => new Date("2024-03-15T10:00:00") } as any,
  location: "San Francisco Convention Center, 747 Howard St, San Francisco, CA 94103",
  category: "technology",
  bannerUrl: "",
  createdBy: "user1",
  createdAt: { toDate: () => new Date() } as any,
  updatedAt: { toDate: () => new Date() } as any,
  registrationCount: 250,
  maxAttendees: 500,
  isPublic: true,
  tags: ["AI", "Blockchain", "Cloud", "Networking"],
};

const mockRegistrations: EventRegistration[] = [
  {
    uid: "user1",
    displayName: "John Doe",
    email: "john@example.com",
    registeredAt: { toDate: () => new Date() } as any,
  },
  {
    uid: "user2",
    displayName: "Jane Smith",
    email: "jane@example.com",
    registeredAt: { toDate: () => new Date() } as any,
  },
  {
    uid: "user3",
    displayName: "Mike Johnson",
    email: "mike@example.com",
    registeredAt: { toDate: () => new Date() } as any,
  },
];

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(mockEvent);
  const [registrations, setRegistrations] = useState<EventRegistration[]>(mockRegistrations);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // In a real app, fetch event data here
    if (user) {
      setIsRegistered(mockRegistrations.some(reg => reg.uid === user.uid));
    }
  }, [user]);

  const handleRegistration = async () => {
    if (!user) {
      toast.error("Please sign in to register for events");
      router.push("/auth");
      return;
    }

    setIsLoading(true);
    try {
      // Mock registration logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (isRegistered) {
        setIsRegistered(false);
        setEvent(prev => prev ? { ...prev, registrationCount: prev.registrationCount - 1 } : null);
        toast.success("Successfully unregistered from event");
      } else {
        setIsRegistered(true);
        setEvent(prev => prev ? { ...prev, registrationCount: prev.registrationCount + 1 } : null);
        toast.success("Successfully registered for event");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update registration");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: event?.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      toast.success("Event link copied to clipboard");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-64 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Event not found</h1>
        <Button asChild>
          <Link href="/events">Back to Events</Link>
        </Button>
      </div>
    );
  }

  const eventDate = event.date.toDate();
  const isUpcoming = eventDate > new Date();
  const isPast = eventDate < new Date();
  const isCreator = user?.uid === event.createdBy;
  const isAdmin = user?.role === "admin";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/events">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Banner */}
          <div className="relative h-64 md:h-80 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
            {event.bannerUrl ? (
              <Image
                src={event.bannerUrl}
                alt={event.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Calendar className="w-16 h-16 text-primary/30" />
              </div>
            )}
            
            {/* Status Badge */}
            <div className="absolute top-4 left-4">
              <Badge variant={isPast ? "secondary" : isUpcoming ? "default" : "destructive"}>
                {isPast ? "Past Event" : isUpcoming ? "Upcoming" : "Live"}
              </Badge>
            </div>

            {/* Category Badge */}
            <div className="absolute top-4 right-4">
              <Badge variant="outline" className="bg-background/80 backdrop-blur-sm capitalize">
                {event.category}
              </Badge>
            </div>
          </div>

          {/* Event Info */}
          <div>
            <h1 className="text-3xl font-bold font-display mb-4">{event.title}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="w-5 h-5 mr-3" />
                <div>
                  <p className="font-medium">{formatDate(eventDate)}</p>
                  <p className="text-sm">{formatDateTime(eventDate)}</p>
                </div>
              </div>
              
              <div className="flex items-center text-muted-foreground">
                <MapPin className="w-5 h-5 mr-3" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-sm">{event.location}</p>
                </div>
              </div>
              
              <div className="flex items-center text-muted-foreground">
                <Users className="w-5 h-5 mr-3" />
                <div>
                  <p className="font-medium">Attendees</p>
                  <p className="text-sm">
                    {event.registrationCount}
                    {event.maxAttendees && ` / ${event.maxAttendees}`} registered
                  </p>
                </div>
              </div>
              
              <div className="flex items-center text-muted-foreground">
                <Clock className="w-5 h-5 mr-3" />
                <div>
                  <p className="font-medium">Duration</p>
                  <p className="text-sm">3 hours</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {event.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <h2 className="text-xl font-semibold mb-3">About this event</h2>
              <div className="whitespace-pre-wrap text-muted-foreground">
                {event.description}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Registration</span>
                {isRegistered && <Heart className="w-5 h-5 text-red-500 fill-current" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isUpcoming && (
                <Button
                  onClick={handleRegistration}
                  loading={isLoading}
                  className="w-full"
                  variant={isRegistered ? "outline" : "default"}
                  disabled={event.maxAttendees ? event.registrationCount >= event.maxAttendees : false}
                >
                  {isRegistered ? "Unregister" : "Register Now"}
                </Button>
              )}
              
              <Button variant="outline" onClick={handleShare} className="w-full">
                <Share2 className="w-4 h-4 mr-2" />
                Share Event
              </Button>

              {(isCreator || isAdmin) && (
                <div className="space-y-2">
                  <Button variant="outline" asChild className="w-full">
                    <Link href={`/events/${event.id}/edit`}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Event
                    </Link>
                  </Button>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Event
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendees */}
          <Card>
            <CardHeader>
              <CardTitle>Attendees ({registrations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {registrations.slice(0, 5).map((registration) => (
                  <div key={registration.uid} className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {getInitials(registration.displayName)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {registration.displayName}
                      </p>
                    </div>
                  </div>
                ))}
                
                {registrations.length > 5 && (
                  <p className="text-sm text-muted-foreground">
                    +{registrations.length - 5} more attendees
                  </p>
                )}
                
                {registrations.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No attendees yet. Be the first to register!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Event Creator */}
          <Card>
            <CardHeader>
              <CardTitle>Organized by</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">Event Organizer</p>
                  <p className="text-sm text-muted-foreground">Event Creator</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
