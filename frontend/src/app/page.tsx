

"use client";
import { useEffect, useState } from "react";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import { useAuth } from "@/contexts/AuthContext";
import IssueCard from "../components/IssueCard";
import { components } from "@/api/models/models";
import EventCard from "../components/EventCard";
import { Event, Issue } from "../models/Issue";
import { eventsApi, issuesApi, stancesApi } from "@/api";
import { useApi } from "./hooks/useApi";

type EventListResponse = components["schemas"]["EventListResponse"];
type IssueListResponse = components["schemas"]["IssueListResponse"];
type StanceListResponse = components["schemas"]["StanceListResponse"];

export default function Home() {
  const authApi = useAuthApi();
  const api = useApi();
  const { initialized } = useAuth();

  const [issues, setIssues] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialized) return;

    const fetchEvents = async () => {
      try {
        const eventsResponse = await eventsApi.listEvents(api);
        const issuesResponse = await issuesApi.listIssues(api);

        const eventsList: Event[] = [];
        const issuesList: Issue[] = [];

        for (const eventData of eventsResponse.events) {
          const event: Event = { ...eventData, description: eventData.description ?? "", stances: [], start_time: eventData.start_time ?? "", end_time: eventData.end_time ?? "" };
          const stancesResponse = await stancesApi.getStancesByEvent(api, event.id);
          event.stances = stancesResponse.stances.map((stance: any) => ({
            ...stance,
            comments: [],
          }));
          eventsList.push(event);
        }

        for (const issueData of issuesResponse.issues) {
          const issue: Issue = { ...issueData, description: issueData.description ?? "", stances: [] };
          const stancesResponse = await stancesApi.getStancesByIssue(api, issue.id);
          issue.stances = stancesResponse.stances.map((stance: any) => ({
            ...stance,
            comments: [],
          }));
          issuesList.push(issue);
        }

        setEvents(eventsList);
        setIssues(issuesList);
      } catch (err: any) {
        setError(err.message || "Failed to fetch events/issues");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [api, initialized]);


  if (!initialized) {
    return <p>Initializing...</p>;
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-8 bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <h1 className="text-3xl font-extrabold text-purple-700 mb-8 drop-shadow-sm tracking-tight">Stance Feed</h1>
      <div className="w-full max-w-2xl space-y-8">
        {loading && <div className="text-purple-500 text-center">Loading events...</div>}
        {error && <div className="text-red-500 text-center font-medium">{error}</div>}
        {events.map(event => (
          <div key={`event-${event.id}`} className="rounded-2xl bg-white/80 shadow-lg border border-purple-100 p-4">
            <EventCard event={event} />
          </div>
        ))}
        {issues.map(issue => (
          <div key={`issue-${issue.id}`} className="rounded-2xl bg-white/80 shadow-lg border border-purple-100 p-4">
            <IssueCard issue={issue} />
          </div>
        ))}
      </div>
    </main>
  );
}
