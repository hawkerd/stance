// src/api/events.ts
import { AxiosInstance } from "axios";
import { components } from "@/api/models/models";

export type EventCreateRequest = components["schemas"]["EventCreateRequest"];
export type EventReadResponse = components["schemas"]["EventReadResponse"];
export type EventUpdateRequest = components["schemas"]["EventUpdateRequest"];
export type EventUpdateResponse = components["schemas"]["EventUpdateResponse"];
export type EventDeleteResponse = components["schemas"]["EventDeleteResponse"];
export type EventListResponse = components["schemas"]["EventListResponse"];
export type StanceReadResponse = components["schemas"]["StanceReadResponse"];

/**
 * Create a new event (admin only)
 */
export async function createEvent(
  api: AxiosInstance,
  payload: EventCreateRequest
): Promise<EventReadResponse> {
  const res = await api.post<EventReadResponse>("/events", payload);
  return res.data;
}

/**
 * Fetch a single event by ID
 */
export async function getEvent(
  api: AxiosInstance,
  eventId: number
): Promise<EventReadResponse> {
  const res = await api.get<EventReadResponse>(`/events/${eventId}`);
  return res.data;
}

/**
 * Update an event (admin only)
 */
export async function updateEvent(
  api: AxiosInstance,
  eventId: number,
  payload: EventUpdateRequest
): Promise<EventUpdateResponse> {
  const res = await api.put<EventUpdateResponse>(`/events/${eventId}`, payload);
  return res.data;
}

/**
 * Delete an event (admin only)
 */
export async function deleteEvent(
  api: AxiosInstance,
  eventId: number
): Promise<EventDeleteResponse> {
  const res = await api.delete<EventDeleteResponse>(`/events/${eventId}`);
  return res.data;
}

/**
 * List all events
 */
export async function listEvents(
  api: AxiosInstance
): Promise<EventListResponse> {
  const res = await api.get<EventListResponse>("/events");
  return res.data;
}

/**
 * Fetch the current user's stance for a specific event.
 */
export async function getMyStanceForEvent(
  api: AxiosInstance,
  eventId: number
): Promise<StanceReadResponse | null> {
  const res = await api.get<StanceReadResponse | null>(`/events/${eventId}/stances/me`);
  return res.data;
}
