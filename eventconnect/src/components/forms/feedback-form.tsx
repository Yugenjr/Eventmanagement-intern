"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { rtdbFeedback } from "@/lib/rtdb-events";
import { MessageSquare, Mail, Phone, Send } from "lucide-react";
import toast from "react-hot-toast";

const feedbackSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  category: z.string().min(1, "Please select a feedback category"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackFormProps {
  onClose?: () => void;
}

export function FeedbackForm({ onClose }: FeedbackFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      name: user?.displayName || "",
      email: user?.email || "",
      phone: "",
      category: "",
      subject: "",
      message: "",
    },
  });

  const selectedCategory = watch("category");

  const onSubmit = async (data: FeedbackFormData) => {
    try {
      setIsLoading(true);
      console.log("📝 User submitting feedback to RTDB feedback section");

      // Save feedback to Realtime Database feedback section
      const feedbackId = await rtdbFeedback.saveFeedback({
        userId: user?.uid || "anonymous",
        userEmail: data.email,
        userName: data.name,
        category: data.category,
        message: data.message,
        phone: data.phone,
      });

      console.log("✅ User feedback submitted successfully:", feedbackId);
      toast.success("Thank you for your feedback! We'll get back to you soon.");
      reset();
      onClose?.();
    } catch (error) {
      console.error("❌ Error submitting user feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const feedbackCategories = [
    { value: "bug", label: "Bug Report" },
    { value: "feature", label: "Feature Request" },
    { value: "general", label: "General Feedback" },
    { value: "support", label: "Support Request" },
    { value: "event", label: "Event Related" },
    { value: "other", label: "Other" },
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Send Feedback
        </CardTitle>
        <CardDescription>
          We'd love to hear from you! Share your thoughts, report issues, or suggest improvements.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter your full name"
                error={errors.name?.message}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="Enter your email"
                  className="pl-10"
                  error={errors.email?.message}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                {...register("phone")}
                placeholder="Enter your phone number"
                className="pl-10"
                error={errors.phone?.message}
              />
            </div>
          </div>

          {/* Feedback Details */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select onValueChange={(value) => setValue("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select feedback category" />
              </SelectTrigger>
              <SelectContent>
                {feedbackCategories.map((category) => (
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

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              {...register("subject")}
              placeholder="Brief description of your feedback"
              error={errors.subject?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              {...register("message")}
              placeholder="Please provide detailed feedback..."
              rows={6}
              className="resize-none"
            />
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading} className="flex-1">
              <Send className="w-4 h-4 mr-2" />
              {isLoading ? "Sending..." : "Send Feedback"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
