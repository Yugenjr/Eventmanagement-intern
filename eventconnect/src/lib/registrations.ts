import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  onSnapshot,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import { db } from "./firebase";
import { EventRegistration } from "@/types";

// Register for an event
export async function registerForEvent(eventId: string, userId: string, userDisplayName: string, userEmail: string): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      const eventRef = doc(db, "events", eventId);
      const registrationRef = doc(db, "events", eventId, "registrations", userId);
      
      // Check if event exists
      const eventDoc = await transaction.get(eventRef);
      if (!eventDoc.exists()) {
        throw new Error("Event not found");
      }
      
      const eventData = eventDoc.data();
      
      // Check if user is already registered
      const registrationDoc = await transaction.get(registrationRef);
      if (registrationDoc.exists()) {
        throw new Error("You are already registered for this event");
      }
      
      // Check if event has reached max capacity
      if (eventData.maxAttendees && eventData.registrationCount >= eventData.maxAttendees) {
        throw new Error("Event has reached maximum capacity");
      }
      
      // Create registration
      const registration: EventRegistration = {
        uid: userId,
        displayName: userDisplayName,
        email: userEmail,
        registeredAt: serverTimestamp() as any,
      };
      
      transaction.set(registrationRef, registration);
      
      // Update event registration count
      transaction.update(eventRef, {
        registrationCount: (eventData.registrationCount || 0) + 1,
      });
    });
  } catch (error) {
    console.error("Error registering for event:", error);
    throw error;
  }
}

// Unregister from an event
export async function unregisterFromEvent(eventId: string, userId: string): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      const eventRef = doc(db, "events", eventId);
      const registrationRef = doc(db, "events", eventId, "registrations", userId);
      
      // Check if event exists
      const eventDoc = await transaction.get(eventRef);
      if (!eventDoc.exists()) {
        throw new Error("Event not found");
      }
      
      const eventData = eventDoc.data();
      
      // Check if user is registered
      const registrationDoc = await transaction.get(registrationRef);
      if (!registrationDoc.exists()) {
        throw new Error("You are not registered for this event");
      }
      
      // Delete registration
      transaction.delete(registrationRef);
      
      // Update event registration count
      transaction.update(eventRef, {
        registrationCount: Math.max((eventData.registrationCount || 1) - 1, 0),
      });
    });
  } catch (error) {
    console.error("Error unregistering from event:", error);
    throw error;
  }
}

// Check if user is registered for an event
export async function isUserRegistered(eventId: string, userId: string): Promise<boolean> {
  try {
    const registrationDoc = await getDoc(doc(db, "events", eventId, "registrations", userId));
    return registrationDoc.exists();
  } catch (error) {
    console.error("Error checking registration status:", error);
    return false;
  }
}

// Get all registrations for an event
export async function getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
  try {
    const registrationsQuery = query(collection(db, "events", eventId, "registrations"));
    const snapshot = await getDocs(registrationsQuery);
    
    return snapshot.docs.map(doc => ({
      ...doc.data(),
    })) as EventRegistration[];
  } catch (error) {
    console.error("Error getting event registrations:", error);
    throw error;
  }
}

// Listen to real-time registration updates
export function subscribeToEventRegistrations(
  eventId: string,
  callback: (registrations: EventRegistration[]) => void
): () => void {
  const registrationsQuery = query(collection(db, "events", eventId, "registrations"));
  
  return onSnapshot(registrationsQuery, (snapshot) => {
    const registrations = snapshot.docs.map(doc => ({
      ...doc.data(),
    })) as EventRegistration[];
    
    callback(registrations);
  });
}

// Get events user is registered for
export async function getUserRegistrations(userId: string): Promise<string[]> {
  try {
    // This is a simplified approach - in a real app, you might want to maintain
    // a separate collection for user registrations for better performance
    const eventsQuery = query(collection(db, "events"));
    const eventsSnapshot = await getDocs(eventsQuery);
    
    const registeredEventIds: string[] = [];
    
    for (const eventDoc of eventsSnapshot.docs) {
      const registrationDoc = await getDoc(
        doc(db, "events", eventDoc.id, "registrations", userId)
      );
      
      if (registrationDoc.exists()) {
        registeredEventIds.push(eventDoc.id);
      }
    }
    
    return registeredEventIds;
  } catch (error) {
    console.error("Error getting user registrations:", error);
    throw error;
  }
}
