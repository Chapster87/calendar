"use client"

import { useState, useEffect } from "react"
import Heading from "@/components/typography/heading"
import Text from "@/components/typography/text"
import Calendar from "@/components/calendar"
import { CalendarEvent } from "@/types/calendar"

import s from "./styles.module.css"

export default function Home() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPublicCalendarEvents() {
      const publicCalendars = [
        {
          id: decodeURIComponent("achapm87%40gmail.com"),
          name: "andyPersonal",
        },
        {
          id: decodeURIComponent(
            "en.usa%23holiday%40group.v.calendar.google.com"
          ),
          name: "usHolidays",
        },
        // Add more public calendars here if needed
        // { id: "another_calendar_id@group.calendar.google.com", name: "Another Calendar" },
      ]

      try {
        const response = await fetch(
          `/api/calendar?calendars=${encodeURIComponent(
            JSON.stringify(publicCalendars)
          )}`
        )
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

    fetchPublicCalendarEvents()
  }, [])

  if (loading) {
    return <Text>Loading calendar...</Text>
  }

  if (error) {
    return <Text className={s.errorText}>Error: {error}</Text>
  }

  console.log("Events:", events) // Debug log to see

  return (
    <div className={s.page}>
      <div className={s.pageSection}>
        <Heading level="h1">Next.js Starter</Heading>
        <Text>
          A minimal starter for Next.js with TypeScript, and my custom
          components.
        </Text>
      </div>
      <Calendar title="Starting Calendar" events={events} />
    </div>
  )
}
