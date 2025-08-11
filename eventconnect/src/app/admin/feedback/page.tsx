"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare, User, Mail, Phone, Calendar, Filter } from "lucide-react";
import Link from "next/link";
import { rtdbFeedback } from "@/lib/rtdb-events";

interface FeedbackItem {
  id: string;
  userName: string;
  userEmail: string;
  phone?: string;
  category: string;
  message: string;
  timestamp: Date;
  status?: 'new' | 'reviewed' | 'resolved';
}

export default function AdminFeedbackPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<FeedbackItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
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
      // ADMIN-ONLY: Subscribe to real-time user feedback data
      console.log("🔐 Admin accessing user feedback data");
      const unsubscribe = rtdbFeedback.subscribeToFeedback((feedbackData) => {
        console.log("📝 Admin feedback view: Received user-submitted feedback:", feedbackData.length, "items");
        // Only admins can see user personal data
        setFeedback(feedbackData);
        setFilteredFeedback(feedbackData);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else if (user && user.role !== "admin") {
      // Non-admin users should not access this page
      console.warn("🚫 Non-admin user attempted to access user feedback data");
      router.push("/userdashboard");
    }
  }, [user, router]);

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredFeedback(feedback);
    } else {
      setFilteredFeedback(feedback.filter(item => item.category === selectedCategory));
    }
  }, [selectedCategory, feedback]);

  const categories = ["all", ...Array.from(new Set(feedback.map(item => item.category)))];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "general": "bg-blue-100 text-blue-800",
      "bug": "bg-red-100 text-red-800",
      "feature": "bg-green-100 text-green-800",
      "support": "bg-yellow-100 text-yellow-800",
      "complaint": "bg-orange-100 text-orange-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admindashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-display">User Feedback</h1>
          <p className="text-muted-foreground">
            Review and manage feedback submitted by users
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Feedback</p>
                <p className="text-2xl font-bold">{feedback.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Unique Users</p>
                <p className="text-2xl font-bold">
                  {new Set(feedback.map(f => f.userEmail)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">
                  {feedback.filter(f => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return f.timestamp > weekAgo;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{categories.length - 1}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category} 
            {category !== "all" && (
              <span className="ml-1 text-xs">
                ({feedback.filter(f => f.category === category).length})
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No feedback found</h3>
              <p className="text-muted-foreground">
                {selectedCategory === "all" 
                  ? "No users have submitted feedback yet."
                  : `No feedback found in the "${selectedCategory}" category.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredFeedback.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {item.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{item.userName}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {item.userEmail}
                        </div>
                        {item.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {item.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getCategoryColor(item.category)}>
                      {item.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {item.timestamp.toLocaleDateString()} {item.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {item.message}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
