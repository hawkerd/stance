

"use client";
import { useEffect, useState } from "react";
import { useApi } from "@/app/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import IssueCard from "../components/IssueCard";
import { components } from "@/models/api";
import EventCard from "../components/EventCard";
import { Event, Issue } from "../models/Issue";

type EventListResponse = components["schemas"]["EventListResponse"];
type IssueListResponse = components["schemas"]["IssueListResponse"];
type StanceListResponse = components["schemas"]["StanceListResponse"];

export default function Home() {
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
        const eventsRes = await fetch("http://localhost:8000/events");
        const issuesRes = await fetch("http://localhost:8000/issues");
        if (!eventsRes.ok || !issuesRes.ok) {
          throw new Error("Failed to fetch events/issues");
        }
        const eventsData: EventListResponse = await eventsRes.json();
        const issuesData: IssueListResponse = await issuesRes.json();

        const events: Event[] = [];
        const issues: Issue[] = [];

        for (const eventData of eventsData.events) {
          const event: Event = { ...eventData, description: eventData.description ?? "", stances: [], start_time: eventData.start_time ?? "", end_time: eventData.end_time ?? "" };
          const stancesRes = await fetch(`http://localhost:8000/stances/event/${event.id}`);
          if (!stancesRes.ok) {
            throw new Error("Failed to fetch stances");
          }
          const stancesData: StanceListResponse = await stancesRes.json();
          event.stances = stancesData.stances;
          events.push(event);
        }

        for (const issueData of issuesData.issues) {
          const issue: Issue = { ...issueData, description: issueData.description ?? "", stances: [] };
          const stancesRes = await fetch(`http://localhost:8000/stances/issue/${issue.id}`);
          if (!stancesRes.ok) {
            throw new Error("Failed to fetch stances");
          }
          const stancesData: StanceListResponse = await stancesRes.json();
          issue.stances = stancesData.stances;
          issues.push(issue);
        }

        setEvents(events);
        setIssues(issues);
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
        {error && <p className="text-red-500">{error}</p>}
        {events.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
        {issues.map(issue => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </main>
  );
}
