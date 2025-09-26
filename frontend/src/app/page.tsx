

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
    <main className="flex min-h-screen flex-col items-center justify-start p-8 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">Stance Feed</h1>
      <div className="w-full max-w-xl space-y-6">
        {loading && <p>Loading events...</p>}
        <p className="text-red-500">{error}</p>
        {events.map(event => (
          <EventCard key={`event-${event.id}`} event={event} />
        ))}
        {issues.map(issue => (
          <IssueCard key={`issue-${issue.id}`} issue={issue} />
        ))}  </div>
    </main>
  );
}
