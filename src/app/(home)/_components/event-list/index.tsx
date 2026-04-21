"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Heading from "@/components/typography/heading"
import Text from "@/components/typography/text"
import s from "./styles.module.css"

interface CalendarEvent {
  id: string
  summary: string
  start: {
    dateTime?: string
    date?: string
  }
  end: {
    dateTime?: string
    date?: string
  }
}

/**
 * @TODO: Add proper error handling and loading states.
 */

/**
 * Renders a list of calendar events for the current week.
 * Fetches events from the `/api/calendar/events` endpoint.
 * @returns {JSX.Element} The calendar event list component.
 */
export default function EventList() {
  const { data: session } = useSession()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEvents() {
      if (!session) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch("/api/calendar/events")
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`)
        }
        const data: CalendarEvent[] = await response.json()
        setEvents(data)
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError("An unknown error occurred.")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [session])

  if (loading) {
    return <Text>Loading events...</Text>
  }

  if (error) {
    return <Text className={s.errorText}>Error: {error}</Text>
  }

  if (events.length === 0) {
    return <Text>No events found for the upcoming week.</Text>
  }

  return (
    <div className={s.eventList}>
      <Heading level="h2" className={s.listTitle}>
        Upcoming Events
      </Heading>
      <ul>
        {events.map((event) => (
          <li key={event.id} className={s.eventItem}>
            <Text className={s.eventSummary}>{event.summary}</Text>
            {event.start?.dateTime && event.end?.dateTime && (
              <Text className={s.eventTime}>
                {new Date(event.start.dateTime).toLocaleString()} -{" "}
                {new Date(event.end.dateTime).toLocaleString()}
              </Text>
            )}
            {event.start?.date && !event.start?.dateTime && (
              <Text className={s.eventDate}>
                {new Intl.DateTimeFormat("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  timeZone: "UTC",
                }).format(new Date(event.start.date))}{" "}
                (All Day)
              </Text>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
