import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "./firebase";
import { Event, CreateEventData, UpdateEventData, EventFilters, EventSortOptions, PaginationOptions, EventListResponse } from "@/types";

// Create a new event
export async function createEvent(eventData: CreateEventData, userId: string): Promise<string> {
  try {
    let bannerUrl = "";
    
    // Upload banner image if provided
    if (eventData.bannerFile) {
      const imageRef = ref(storage, `events/${Date.now()}_${eventData.bannerFile.name}`);
      const snapshot = await uploadBytes(imageRef, eventData.bannerFile);
      bannerUrl = await getDownloadURL(snapshot.ref);
    }

    const event = {
      title: eventData.title,
      description: eventData.description,
      date: Timestamp.fromDate(eventData.date),
      location: eventData.location,
      category: eventData.category,
      bannerUrl,
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      registrationCount: 0,
      maxAttendees: eventData.maxAttendees,
      isPublic: eventData.isPublic,
      isPaid: eventData.isPaid || false,
      price: eventData.price || undefined,
      tags: eventData.tags,
    };

    const docRef = await addDoc(collection(db, "events"), event);
    return docRef.id;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
}

// Update an existing event
export async function updateEvent(eventData: UpdateEventData, userId: string): Promise<void> {
  try {
    const eventRef = doc(db, "events", eventData.id);
    const eventDoc = await getDoc(eventRef);
    
    if (!eventDoc.exists()) {
      throw new Error("Event not found");
    }
    
    const existingEvent = eventDoc.data();
    if (existingEvent.createdBy !== userId) {
      throw new Error("You don't have permission to update this event");
    }

    let bannerUrl = existingEvent.bannerUrl;
    
    // Upload new banner image if provided
    if (eventData.bannerFile) {
      // Delete old banner if it exists
      if (bannerUrl) {
        try {
          const oldImageRef = ref(storage, bannerUrl);
          await deleteObject(oldImageRef);
        } catch (error) {
          console.log("Old banner not found or already deleted");
        }
      }
      
      const imageRef = ref(storage, `events/${Date.now()}_${eventData.bannerFile.name}`);
      const snapshot = await uploadBytes(imageRef, eventData.bannerFile);
      bannerUrl = await getDownloadURL(snapshot.ref);
    }

    const updateData: any = {
      updatedAt: serverTimestamp(),
    };

    if (eventData.title !== undefined) updateData.title = eventData.title;
    if (eventData.description !== undefined) updateData.description = eventData.description;
    if (eventData.date !== undefined) updateData.date = Timestamp.fromDate(eventData.date);
    if (eventData.location !== undefined) updateData.location = eventData.location;
    if (eventData.category !== undefined) updateData.category = eventData.category;
    if (eventData.maxAttendees !== undefined) updateData.maxAttendees = eventData.maxAttendees;
    if (eventData.isPublic !== undefined) updateData.isPublic = eventData.isPublic;
    if (eventData.isPaid !== undefined) updateData.isPaid = eventData.isPaid;
    if (eventData.price !== undefined) updateData.price = eventData.price;
    if (eventData.tags !== undefined) updateData.tags = eventData.tags;
    if (bannerUrl !== existingEvent.bannerUrl) updateData.bannerUrl = bannerUrl;

    await updateDoc(eventRef, updateData);
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
}

// Delete an event
export async function deleteEvent(eventId: string, userId: string): Promise<void> {
  try {
    const eventRef = doc(db, "events", eventId);
    const eventDoc = await getDoc(eventRef);
    
    if (!eventDoc.exists()) {
      throw new Error("Event not found");
    }
    
    const event = eventDoc.data();
    if (event.createdBy !== userId) {
      throw new Error("You don't have permission to delete this event");
    }

    // Delete banner image if it exists
    if (event.bannerUrl) {
      try {
        const imageRef = ref(storage, event.bannerUrl);
        await deleteObject(imageRef);
      } catch (error) {
        console.log("Banner image not found or already deleted");
      }
    }

    // Use batch to delete event and all its registrations
    const batch = writeBatch(db);
    
    // Delete the event
    batch.delete(eventRef);
    
    // Delete all registrations for this event
    const registrationsQuery = query(collection(db, "events", eventId, "registrations"));
    const registrationsSnapshot = await getDocs(registrationsQuery);
    
    registrationsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
}

// Get a single event by ID
export async function getEvent(eventId: string): Promise<Event | null> {
  try {
    const eventDoc = await getDoc(doc(db, "events", eventId));
    
    if (!eventDoc.exists()) {
      return null;
    }
    
    return {
      id: eventDoc.id,
      ...eventDoc.data(),
    } as Event;
  } catch (error) {
    console.error("Error getting event:", error);
    throw error;
  }
}

// Get events with filters, sorting, and pagination
export async function getEvents(
  filters: EventFilters = {},
  sortOptions: EventSortOptions = { field: "date", direction: "asc" },
  pagination: PaginationOptions = { page: 1, limit: 10 }
): Promise<EventListResponse> {
  try {
    let q = query(collection(db, "events"));
    
    // Apply filters
    if (filters.category) {
      q = query(q, where("category", "==", filters.category));
    }
    
    if (filters.dateFrom) {
      q = query(q, where("date", ">=", Timestamp.fromDate(filters.dateFrom)));
    }
    
    if (filters.dateTo) {
      q = query(q, where("date", "<=", Timestamp.fromDate(filters.dateTo)));
    }
    
    if (filters.location) {
      q = query(q, where("location", ">=", filters.location));
      q = query(q, where("location", "<=", filters.location + "\uf8ff"));
    }
    
    // Apply sorting
    q = query(q, orderBy(sortOptions.field, sortOptions.direction));
    
    // Apply pagination
    q = query(q, limit(pagination.limit + 1)); // Get one extra to check if there are more
    
    const snapshot = await getDocs(q);
    const events = snapshot.docs.slice(0, pagination.limit).map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Event[];
    
    const hasMore = snapshot.docs.length > pagination.limit;
    
    return {
      events,
      total: events.length,
      hasMore,
    };
  } catch (error) {
    console.error("Error getting events:", error);
    throw error;
  }
}
