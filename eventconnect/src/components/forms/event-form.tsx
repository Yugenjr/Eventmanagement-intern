"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { createEvent, updateEvent } from "@/lib/events";
import { rtdbEvents } from "@/lib/rtdb-events";
import { EventCategory } from "@/types";
import { Calendar, MapPin, Users, Upload, X, Plus } from "lucide-react";
import toast from "react-hot-toast";

const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  category: z.string().min(1, "Category is required"),
  maxAttendees: z.string().optional(),
  isPublic: z.boolean().default(true),
  isPaid: z.boolean().default(false),
  price: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

const categories: { value: EventCategory; label: string }[] = [
  { value: "technology", label: "Technology" },
  { value: "business", label: "Business" },
  { value: "education", label: "Education" },
  { value: "health", label: "Health & Wellness" },
  { value: "sports", label: "Sports & Fitness" },
  { value: "entertainment", label: "Entertainment" },
  { value: "food", label: "Food & Drink" },
  { value: "travel", label: "Travel" },
  { value: "art", label: "Art & Culture" },
  { value: "music", label: "Music" },
  { value: "networking", label: "Networking" },
  { value: "workshop", label: "Workshop" },
  { value: "conference", label: "Conference" },
  { value: "meetup", label: "Meetup" },
  { value: "other", label: "Other" },
];

interface EventFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export function EventForm({ initialData, isEditing = false }: EventFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [newTag, setNewTag] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      description: initialData.description,
      date: initialData.date?.toDate?.()?.toISOString().split('T')[0] || "",
      time: initialData.date?.toDate?.()?.toTimeString().slice(0, 5) || "",
      location: initialData.location,
      category: initialData.category,
      maxAttendees: initialData.maxAttendees?.toString() || "",
      isPublic: initialData.isPublic ?? true,
    } : {
      isPublic: true,
    },
  });

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (data: EventFormData) => {
    if (!user) {
      toast.error("You must be signed in to create events");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Starting event creation process...");

      // Combine date and time
      const eventDateTime = new Date(`${data.date}T${data.time}`);
      console.log("Event date/time:", eventDateTime);
      
      const eventData = {
        title: data.title,
        description: data.description,
        date: eventDateTime,
        location: data.location,
        category: data.category as EventCategory,
        bannerFile,
        maxAttendees: data.maxAttendees ? parseInt(data.maxAttendees) : undefined,
        isPublic: data.isPublic,
        isPaid: data.isPaid,
        price: data.isPaid && data.price ? parseFloat(data.price) : undefined,
        tags,
      };

      if (isEditing && initialEvent) {
        // Update existing event
        const updatedEvent = await updateEvent(initialEvent.id, eventData);
        // Also save to RTDB for real-time updates
        await rtdbEvents.saveEvent(updatedEvent);
        toast.success("Event updated successfully!");
      } else {
        // Create new event
        console.log("Creating event with data:", eventData);
        const eventId = await createEvent(eventData, user.uid);
        console.log("Event created with ID:", eventId);

        // Get the created event and save to RTDB
        const createdEvent = {
          id: eventId,
          ...eventData,
          createdBy: user.uid,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        console.log("Saving to RTDB:", createdEvent);
        try {
          await rtdbEvents.saveEvent(createdEvent as any);
          console.log("RTDB save successful");
        } catch (rtdbError) {
          console.error("RTDB save failed:", rtdbError);
          // Continue anyway - Firestore save was successful
        }

        toast.success("Event created successfully!");
      }

      router.push(user.role === "admin" ? "/admindashboard" : "/userdashboard");
      
    } catch (error: any) {
      console.error("❌ Event creation error:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      toast.error(error.message || "Failed to save event. Please try again.");
    } finally {
      setIsLoading(false);
      console.log("✅ Event creation process completed");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {isEditing ? "Edit Event" : "Create New Event"}
          </CardTitle>
          <CardDescription>
            {isEditing ? "Update your event details" : "Fill in the details to create your event"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Test Firebase Connection */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Button
                type="button"
                onClick={async () => {
                  try {
                    console.log("🔥 Testing Firebase connection...");
                    const testEvent = {
                      title: `Test Event ${new Date().toLocaleTimeString()}`,
                      description: "Test event description",
                      date: new Date(),
                      location: "Test Location",
                      category: "test",
                      maxAttendees: 50,
                      isPublic: true,
                      isPaid: false,
                      tags: ["test"]
                    };

                    const eventId = await createEvent(testEvent, user.uid);
                    console.log("✅ Test event created:", eventId);
                    toast.success("Test event created successfully!");
                  } catch (error) {
                    console.error("❌ Test failed:", error);
                    toast.error("Test failed: " + (error as any).message);
                  }
                }}
                variant="outline"
                className="w-full"
              >
                🧪 Test Firebase Connection
              </Button>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Banner Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Event Banner (Optional)</label>
              <div className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                {bannerPreview ? (
                  <div className="relative">
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setBannerFile(null);
                        setBannerPreview("");
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
              </div>
            </div>

            {/* Title */}
            <Input
              {...register("title")}
              label="Event Title"
              placeholder="Enter event title"
              error={errors.title?.message}
            />

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                {...register("description")}
                placeholder="Describe your event..."
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                {...register("date")}
                type="date"
                label="Date"
                error={errors.date?.message}
              />
              <Input
                {...register("time")}
                type="time"
                label="Time"
                error={errors.time?.message}
              />
            </div>

            {/* Location */}
            <Input
              {...register("location")}
              label="Location"
              placeholder="Enter event location"
              error={errors.location?.message}
            />

            {/* Category and Max Attendees */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select onValueChange={(value) => setValue("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category.message}</p>
                )}
              </div>

              <Input
                {...register("maxAttendees")}
                type="number"
                label="Max Attendees (Optional)"
                placeholder="No limit"
                error={errors.maxAttendees?.message}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Public/Private & Paid toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  {...register("isPublic")}
                  type="checkbox"
                  id="isPublic"
                  className="rounded border-input"
                />
                <label htmlFor="isPublic" className="text-sm font-medium">
                  Make this event public
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  {...register("isPaid")}
                  type="checkbox"
                  id="isPaid"
                  className="rounded border-input"
                />
                <label htmlFor="isPaid" className="text-sm font-medium">
                  Paid event
                </label>
              </div>
            </div>

            {/* Price field (conditional) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                {...register("price")}
                type="number"
                label="Price (USD)"
                placeholder="0.00"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" loading={isLoading} className="flex-1">
                {isEditing ? "Update Event" : "Create Event"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
