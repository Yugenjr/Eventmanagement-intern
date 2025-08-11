// Demo data for when Firebase is not configured
import { Event, User } from "@/types";

export const demoUser: User = {
  uid: "demo-user-123",
  email: "demo@example.com",
  displayName: "Demo User",
  role: "user",
  photoURL: null,
  createdAt: new Date(),
  emailVerified: true,
};

export const demoAdminUser: User = {
  uid: "demo-admin-123",
  email: "admin@example.com",
  displayName: "Demo Admin",
  role: "admin",
  photoURL: null,
  createdAt: new Date(),
  emailVerified: true,
};

export const demoEvents: Event[] = [
  {
    id: "demo-event-1",
    title: "Tech Conference 2024",
    description: "Join us for the biggest tech conference of the year! Learn about the latest trends in AI, web development, and more.",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    location: "San Francisco Convention Center",
    category: "technology",
    bannerUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
    isPublic: true,
    isPaid: true,
    price: 299,
    maxAttendees: 500,
    createdBy: "demo-admin-123",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: "demo-event-2",
    title: "Community Cleanup Day",
    description: "Help make our community cleaner and greener! Bring your family and friends for a day of environmental action.",
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    location: "Central Park",
    category: "community",
    bannerUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop",
    isPublic: true,
    isPaid: false,
    maxAttendees: 100,
    createdBy: "demo-admin-123",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: "demo-event-3",
    title: "Startup Networking Mixer",
    description: "Connect with fellow entrepreneurs, investors, and innovators in the startup ecosystem.",
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
    location: "Innovation Hub Downtown",
    category: "business",
    bannerUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop",
    isPublic: true,
    isPaid: true,
    price: 50,
    maxAttendees: 75,
    createdBy: "demo-admin-123",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
];

export const isDemoMode = () => {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Demo mode check:', {
      apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined',
      projectId: projectId || 'undefined',
      isDemoMode: !apiKey || apiKey === "your-api-key-here" || apiKey === "demo-api-key"
    });
  }

  return !apiKey ||
         apiKey === "your-api-key-here" ||
         apiKey === "demo-api-key" ||
         !projectId ||
         projectId === "demo-project";
};
