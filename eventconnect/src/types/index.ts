import { Timestamp } from "firebase/firestore";

export type Role = "user" | "admin";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  photoURL?: string;
  createdAt: Timestamp;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Timestamp;
  location: string;
  category: EventCategory;
  bannerUrl?: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  registrationCount: number;
  maxAttendees?: number;
  isPublic: boolean;
  isPaid?: boolean;
  price?: number;
  tags: string[];
}

export interface EventRegistration {
  uid: string;
  displayName: string;
  email: string;
  registeredAt: Timestamp;
}

export type EventCategory = 
  | "technology"
  | "business"
  | "education"
  | "health"
  | "sports"
  | "entertainment"
  | "food"
  | "travel"
  | "art"
  | "music"
  | "networking"
  | "workshop"
  | "conference"
  | "meetup"
  | "other";

export interface CreateEventData {
  title: string;
  description: string;
  date: Date;
  location: string;
  category: EventCategory;
  bannerFile?: File;
  maxAttendees?: number;
  isPublic: boolean;
  isPaid?: boolean;
  price?: number;
  tags: string[];
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id: string;
}

export interface EventFilters {
  category?: EventCategory;
  dateFrom?: Date;
  dateTo?: Date;
  location?: string;
  tags?: string[];
  search?: string;
}

export interface EventSortOptions {
  field: "date" | "createdAt" | "registrationCount" | "title";
  direction: "asc" | "desc";
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface EventListResponse {
  events: Event[];
  total: number;
  hasMore: boolean;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "timestamp">) => void;
  removeNotification: (id: string) => void;
}

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  timestamp: Date;
  duration?: number;
}

export interface DashboardStats {
  totalEvents: number;
  totalRegistrations: number;
  upcomingEvents: number;
  pastEvents: number;
}

export interface EventAnalytics {
  eventId: string;
  views: number;
  registrations: number;
  registrationsByDay: { date: string; count: number }[];
  topReferrers: { source: string; count: number }[];
}
