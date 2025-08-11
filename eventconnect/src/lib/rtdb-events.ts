import { ref, push, set, onValue, off, remove, update, get } from "firebase/database";
import { rtdb } from "./firebase";
import { Event } from "@/types";

// Real-time database operations for events
export const rtdbEvents = {
  // Add or update an event in RTDB events section
  async saveEvent(event: Event) {
    if (!rtdb) {
      console.warn("Realtime Database not available");
      return;
    }

    try {
      console.log("💾 Saving event to RTDB events section:", event.id);
      const eventsRef = ref(rtdb, `events/${event.id}`);

      const eventData = {
        ...event,
        createdAt: event.createdAt instanceof Date ? event.createdAt.toISOString() :
                   event.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        date: event.date instanceof Date ? event.date.toISOString() :
              event.date?.toDate?.()?.toISOString() || new Date().toISOString(),
      };

      console.log("📝 RTDB event data:", eventData);
      await set(eventsRef, eventData);
      console.log("✅ Event saved to RTDB events section successfully");
    } catch (error) {
      console.error("❌ Error saving event to RTDB:", error);
      throw error;
    }
  },

  // Remove an event from RTDB
  async deleteEvent(eventId: string) {
    if (!rtdb) {
      console.warn("Realtime Database not available");
      return;
    }

    try {
      const eventRef = ref(rtdb, `events/${eventId}`);
      await remove(eventRef);
    } catch (error) {
      console.error("Error deleting event from RTDB:", error);
    }
  },

  // Listen to real-time events updates
  subscribeToEvents(callback: (events: Event[]) => void) {
    if (!rtdb) {
      console.warn("Realtime Database not available");
      return () => {};
    }

    const eventsRef = ref(rtdb, "events");
    
    const unsubscribe = onValue(eventsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Safe date conversion function
        const convertDate = (dateValue: any) => {
          if (!dateValue) return new Date();
          if (dateValue instanceof Date) return dateValue;
          if (typeof dateValue === 'string') return new Date(dateValue);
          if (dateValue.toDate && typeof dateValue.toDate === 'function') return dateValue.toDate();
          if (dateValue.seconds) return new Date(dateValue.seconds * 1000);
          return new Date(dateValue);
        };

        const events: Event[] = Object.values(data).map((event: any) => ({
          ...event,
          date: convertDate(event.date),
          createdAt: convertDate(event.createdAt),
          updatedAt: convertDate(event.updatedAt),
        }));

        console.log("📅 RTDB Events loaded:", events.length, "events");
        callback(events);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error("❌ Error listening to events:", error);
      callback([]);
    });

    return () => off(eventsRef, "value", unsubscribe);
  },

  // Get events once (not real-time)
  async getEvents(): Promise<Event[]> {
    if (!rtdb) {
      console.warn("Realtime Database not available");
      return [];
    }

    try {
      const eventsRef = ref(rtdb, "events");
      const snapshot = await get(eventsRef);
      const data = snapshot.val();
      
      if (data) {
        return Object.values(data).map((event: any) => ({
          ...event,
          date: new Date(event.date),
          createdAt: event.createdAt ? new Date(event.createdAt) : new Date(),
          updatedAt: event.updatedAt ? new Date(event.updatedAt) : new Date(),
        }));
      }
      return [];
    } catch (error) {
      console.error("Error getting events from RTDB:", error);
      return [];
    }
  }
};

// Real-time database operations for user feedback
export const rtdbFeedback = {
  // Save user feedback to RTDB feedback section
  async saveFeedback(feedback: {
    userId: string;
    userEmail: string;
    userName: string;
    category: string;
    message: string;
    phone?: string;
  }) {
    if (!rtdb) {
      console.warn("Realtime Database not available");
      return;
    }

    try {
      console.log("💾 Saving user feedback to RTDB feedback section");
      const feedbackRef = ref(rtdb, "feedback");
      const newFeedbackRef = push(feedbackRef);

      const feedbackData = {
        ...feedback,
        id: newFeedbackRef.key,
        timestamp: new Date().toISOString(),
        status: "new"
      };

      await set(newFeedbackRef, feedbackData);
      console.log("✅ User feedback saved to RTDB feedback section:", newFeedbackRef.key);
      return newFeedbackRef.key;
    } catch (error) {
      console.error("❌ Error saving feedback to RTDB:", error);
      throw error;
    }
  },

  // Listen to real-time feedback updates
  subscribeToFeedback(callback: (feedback: any[]) => void) {
    if (!rtdb) {
      console.warn("Realtime Database not available");
      return () => {};
    }

    const feedbackRef = ref(rtdb, "feedback");
    
    const unsubscribe = onValue(feedbackRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const feedbackList = Object.values(data).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        // Sort by timestamp, newest first
        feedbackList.sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime());
        callback(feedbackList);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error("Error listening to feedback:", error);
      callback([]);
    });

    return () => off(feedbackRef, "value", unsubscribe);
  },

  // Get feedback once (not real-time)
  async getFeedback(): Promise<any[]> {
    if (!rtdb) {
      console.warn("Realtime Database not available");
      return [];
    }

    try {
      const feedbackRef = ref(rtdb, "feedback");
      const snapshot = await get(feedbackRef);
      const data = snapshot.val();
      
      if (data) {
        const feedbackList = Object.values(data).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        // Sort by timestamp, newest first
        feedbackList.sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime());
        return feedbackList;
      }
      return [];
    } catch (error) {
      console.error("Error getting feedback from RTDB:", error);
      return [];
    }
  }
};

// Real-time database operations for event registrations
export const rtdbRegistrations = {
  // Save user event registration to RTDB registrations section
  async saveRegistration(registration: {
    eventId: string;
    userId: string;
    userEmail: string;
    userName: string;
    userPhone?: string;
    registrationDate: Date;
    eventTitle: string;
    eventDate: Date;
  }) {
    if (!rtdb) {
      console.warn("Realtime Database not available");
      return;
    }

    try {
      console.log("💾 Saving user registration to RTDB registrations section");
      const registrationRef = ref(rtdb, `registrations/${registration.eventId}/${registration.userId}`);

      const registrationData = {
        ...registration,
        registrationDate: registration.registrationDate.toISOString(),
        eventDate: registration.eventDate.toISOString(),
        timestamp: new Date().toISOString(),
        status: "confirmed"
      };

      await set(registrationRef, registrationData);
      console.log("✅ User registration saved to RTDB registrations section");

      // Also update event registration count
      await this.updateEventRegistrationCount(registration.eventId);

      return registrationRef.key;
    } catch (error) {
      console.error("❌ Error saving registration to RTDB:", error);
      throw error;
    }
  },

  // Update event registration count
  async updateEventRegistrationCount(eventId: string) {
    if (!rtdb) return;

    try {
      const registrationsRef = ref(rtdb, `registrations/${eventId}`);
      const snapshot = await get(registrationsRef);
      const registrations = snapshot.val();
      const count = registrations ? Object.keys(registrations).length : 0;

      // Update the event's registration count
      const eventRef = ref(rtdb, `events/${eventId}/registrationCount`);
      await set(eventRef, count);

      console.log(`📊 Updated registration count for event ${eventId}: ${count}`);
    } catch (error) {
      console.error("❌ Error updating registration count:", error);
    }
  },

  // Subscribe to registrations for a specific event
  subscribeToEventRegistrations(eventId: string, callback: (registrations: any[]) => void) {
    if (!rtdb) {
      console.warn("Realtime Database not available");
      return () => {};
    }

    const registrationsRef = ref(rtdb, `registrations/${eventId}`);
    return onValue(registrationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const registrationsList = Object.values(data).map((reg: any) => ({
          ...reg,
          registrationDate: new Date(reg.registrationDate),
          eventDate: new Date(reg.eventDate),
        }));
        callback(registrationsList);
      } else {
        callback([]);
      }
    });
  },

  // Subscribe to all registrations (admin view)
  subscribeToAllRegistrations(callback: (registrations: any[]) => void) {
    if (!rtdb) {
      console.warn("Realtime Database not available");
      return () => {};
    }

    const registrationsRef = ref(rtdb, "registrations");
    return onValue(registrationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allRegistrations: any[] = [];
        Object.entries(data).forEach(([eventId, eventRegistrations]: [string, any]) => {
          Object.values(eventRegistrations).forEach((reg: any) => {
            allRegistrations.push({
              ...reg,
              registrationDate: new Date(reg.registrationDate),
              eventDate: new Date(reg.eventDate),
            });
          });
        });
        // Sort by registration date (newest first)
        allRegistrations.sort((a, b) => b.registrationDate.getTime() - a.registrationDate.getTime());
        callback(allRegistrations);
      } else {
        callback([]);
      }
    });
  },

  // Check if user is registered for an event
  async isUserRegistered(eventId: string, userId: string): Promise<boolean> {
    if (!rtdb) return false;

    try {
      const registrationRef = ref(rtdb, `registrations/${eventId}/${userId}`);
      const snapshot = await get(registrationRef);
      return snapshot.exists();
    } catch (error) {
      console.error("❌ Error checking registration status:", error);
      return false;
    }
  },

  // Cancel user registration
  async cancelRegistration(eventId: string, userId: string) {
    if (!rtdb) return;

    try {
      console.log("🗑️ Canceling user registration");
      const registrationRef = ref(rtdb, `registrations/${eventId}/${userId}`);
      await remove(registrationRef);

      // Update event registration count
      await this.updateEventRegistrationCount(eventId);

      console.log("✅ Registration canceled successfully");
    } catch (error) {
      console.error("❌ Error canceling registration:", error);
      throw error;
    }
  }
};

// Real-time database operations for user tracking
export const rtdbUsers = {
  // Get total logged in users count
  async getTotalUsersCount(): Promise<number> {
    if (!rtdb) {
      console.warn("Realtime Database not available");
      return 0;
    }

    try {
      const usersRef = ref(rtdb, "recentLogins");
      const snapshot = await get(usersRef);
      const data = snapshot.val();
      
      if (data) {
        // Get unique users from recent logins
        const uniqueUsers = new Set();
        Object.values(data).forEach((login: any) => {
          if (login.uid) {
            uniqueUsers.add(login.uid);
          }
        });
        return uniqueUsers.size;
      }
      return 0;
    } catch (error) {
      console.error("Error getting users count from RTDB:", error);
      return 0;
    }
  },

  // Listen to real-time user count updates
  subscribeToUsersCount(callback: (count: number) => void) {
    if (!rtdb) {
      console.warn("Realtime Database not available");
      return () => {};
    }

    const usersRef = ref(rtdb, "recentLogins");
    
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Get unique users from recent logins
        const uniqueUsers = new Set();
        Object.values(data).forEach((login: any) => {
          if (login.uid) {
            uniqueUsers.add(login.uid);
          }
        });
        callback(uniqueUsers.size);
      } else {
        callback(0);
      }
    }, (error) => {
      console.error("Error listening to users count:", error);
      callback(0);
    });

    return () => off(usersRef, "value", unsubscribe);
  }
};
