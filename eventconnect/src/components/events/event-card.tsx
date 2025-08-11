"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Event } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { registerForEvent, unregisterFromEvent, isUserRegistered } from "@/lib/registrations";
import { formatDateTime, formatDate, cn } from "@/lib/utils";
import { Calendar, MapPin, Users, Clock, Heart } from "lucide-react";
import toast from "react-hot-toast";

interface EventCardProps {
  event: Event;
  variant?: "default" | "compact";
  showActions?: boolean;
}

export function EventCard({ event, variant = "default", showActions = true }: EventCardProps) {
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationCount, setRegistrationCount] = useState(event.registrationCount || 0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkRegistrationStatus();
    }
  }, [user, event.id]);

  const checkRegistrationStatus = async () => {
    if (!user) return;
    
    try {
      const registered = await isUserRegistered(event.id, user.uid);
      setIsRegistered(registered);
    } catch (error) {
      console.error("Error checking registration status:", error);
    }
  };

  const handleRegistration = async () => {
    if (!user) {
      toast.error("Please sign in to register for events");
      return;
    }

    setIsLoading(true);
    try {
      if (isRegistered) {
        await unregisterFromEvent(event.id, user.uid);
        setIsRegistered(false);
        setRegistrationCount(prev => Math.max(prev - 1, 0));
        toast.success("Successfully unregistered from event");
      } else {
        await registerForEvent(event.id, user.uid, user.displayName, user.email);
        setIsRegistered(true);
        setRegistrationCount(prev => prev + 1);
        toast.success("Successfully registered for event");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update registration");
    } finally {
      setIsLoading(false);
    }
  };

  // Safe date conversion
  const convertToDate = (dateValue: any): Date => {
    if (dateValue instanceof Date) return dateValue;
    if (dateValue?.toDate && typeof dateValue.toDate === 'function') return dateValue.toDate();
    if (dateValue?.seconds) return new Date(dateValue.seconds * 1000);
    if (typeof dateValue === 'string') return new Date(dateValue);
    return new Date();
  };

  const eventDate = convertToDate(event.date);
  const isUpcoming = eventDate > new Date();
  const isPast = eventDate < new Date();

  if (variant === "compact") {
    return (
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            {event.bannerUrl && (
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={event.bannerUrl}
                  alt={event.title}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <Badge variant={isPast ? "secondary" : "default"}>
                  {event.category}
                </Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="w-3 h-3 mr-1" />
                  {registrationCount}
                </div>
              </div>
              <Link href={`/events/${event.id}`}>
                <h3 className="font-semibold text-sm hover:text-primary transition-colors line-clamp-1">
                  {event.title}
                </h3>
              </Link>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(eventDate)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      {/* Event Banner */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5">
        {event.bannerUrl ? (
          <Image
            src={event.bannerUrl}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="w-12 h-12 text-primary/30" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <Badge variant={isPast ? "secondary" : isUpcoming ? "default" : "destructive"}>
            {isPast ? "Past" : isUpcoming ? "Upcoming" : "Live"}
          </Badge>
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 right-4">
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
            {event.category}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="w-4 h-4 mr-1" />
            <span>{registrationCount}</span>
            {event.maxAttendees && (
              <span className="text-muted-foreground">/{event.maxAttendees}</span>
            )}
          </div>
          
          {user && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleRegistration}
              disabled={isLoading}
            >
              <Heart className={cn("w-4 h-4", isRegistered && "fill-current text-red-500")} />
            </Button>
          )}
        </div>

        <Link href={`/events/${event.id}`}>
          <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-2">
            {event.title}
          </h3>
        </Link>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {event.description}
        </p>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2" />
            {formatDateTime(eventDate)}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2" />
            {event.location}
          </div>
          {event.isPaid && (
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="mr-2 font-medium text-foreground">Price:</span>
              <span>${event.price?.toFixed?.(2) ?? event.price}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {event.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {event.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{event.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {showActions && (
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href={`/events/${event.id}`}>
                View Details
              </Link>
            </Button>
            
            {user && isUpcoming && (
              event.isPaid ? (
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() => alert("Proceed to payment gateway")}
                >
                  Pay & Register
                </Button>
              ) : (
                <Button
                  variant={isRegistered ? "outline" : "default"}
                  onClick={handleRegistration}
                  loading={isLoading}
                  disabled={event.maxAttendees ? registrationCount >= event.maxAttendees : false}
                  className="flex-1"
                >
                  {isRegistered ? "Unregister" : "Register"}
                </Button>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
