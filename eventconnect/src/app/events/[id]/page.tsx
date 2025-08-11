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

// Import RTDB functions for real data
import { rtdbEvents, rtdbRegistrations } from "@/lib/rtdb-events";
import { getEvent } from "@/lib/events";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showRegistrations, setShowRegistrations] = useState(false);

  // Load real event data from RTDB
  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }

    const loadEventData = async () => {
      try {
        const eventId = params.id as string;
        console.log("📅 Loading event data for:", eventId);

        // Get event from Firestore first
        const eventData = await getEvent(eventId);
        if (eventData) {
          setEvent(eventData);
          console.log("✅ Event loaded:", eventData.title);
        }

        // Check if user is registered
        const registered = await rtdbRegistrations.isUserRegistered(eventId, user.uid);
        setIsRegistered(registered);
        console.log("🎫 User registration status:", registered);

        // Subscribe to registrations for this event
        const unsubscribe = rtdbRegistrations.subscribeToEventRegistrations(eventId, (regs) => {
          setRegistrations(regs);
          console.log("👥 Event registrations updated:", regs.length);
        });

        setLoading(false);
        return () => unsubscribe();
      } catch (error) {
        console.error("❌ Error loading event data:", error);
        setLoading(false);
      }
    };

    loadEventData();
  }, [user, router, params.id]);

  const handleRegistration = async () => {
    if (!user || !event) {
      toast.error("Please sign in to register for events");
      router.push("/auth");
      return;
    }

    setIsRegistering(true);
    try {
      if (isRegistered) {
        // Cancel registration
        console.log("🗑️ User canceling registration for event:", event.title);
        await rtdbRegistrations.cancelRegistration(event.id, user.uid);
        setIsRegistered(false);
        toast.success("Registration canceled successfully");
        console.log("✅ Registration canceled");
      } else {
        // Register for event
        console.log("🎫 User registering for event:", event.title);
        await rtdbRegistrations.saveRegistration({
          eventId: event.id,
          userId: user.uid,
          userEmail: user.email!,
          userName: user.displayName || user.email!,
          userPhone: "", // Could add phone field to user profile
          registrationDate: new Date(),
          eventTitle: event.title,
          eventDate: event.date instanceof Date ? event.date :
                  event.date?.toDate ? event.date.toDate() :
                  event.date?.seconds ? new Date(event.date.seconds * 1000) :
                  new Date(event.date),
        });
        setIsRegistered(true);
        toast.success(`Successfully registered for ${event.title}!`);
        console.log("✅ User registration completed");
      }
    } catch (error: any) {
      console.error("❌ Registration operation failed:", error);
      toast.error(error.message || "Failed to update registration");
    } finally {
      setIsRegistering(false);
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
                  disabled={isRegistering || (event.maxAttendees ? event.registrationCount >= event.maxAttendees : false)}
                  className="w-full"
                  variant={isRegistered ? "outline" : "default"}
                >
                  {isRegistering ? "Processing..." : (isRegistered ? "Cancel Registration" : "Register Now")}
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
