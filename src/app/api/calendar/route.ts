import { NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import { CalendarEvent } from "@/types/calendar"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const calendarsParam = searchParams.get("calendars")

  if (!calendarsParam) {
    return NextResponse.json(
      { message: "Missing calendars parameter" },
      { status: 400 }
    )
  }

  let calendars: Array<{ id: string; name: string }>
  try {
    calendars = JSON.parse(calendarsParam)
    if (
      !Array.isArray(calendars) ||
      calendars.some(
        (c) => typeof c.id !== "string" || typeof c.name !== "string"
      )
    ) {
      throw new Error("Invalid calendars format")
    }
  } catch (parseError) {
    return NextResponse.json(
      {
        message: "Invalid calendars parameter format",
        details:
          parseError instanceof Error
            ? parseError.message
            : "Unknown parse error",
      },
      { status: 400 }
    )
  }

  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { message: "Google Calendar API key not configured" },
      { status: 500 }
    )
  }

  try {
    const calendarService = google.calendar({ version: "v3", auth: apiKey })

    const now = new Date()

    const fetchPromises = calendars.map(async (cal) => {
      let calendarEvents: CalendarEvent[] = []
      try {
        // Fetch upcoming events
        const upcomingResponse = await calendarService.events.list({
          calendarId: cal.id,
          timeMin: now.toISOString(),
          maxResults: 200,
          singleEvents: true,
          orderBy: "startTime",
        })

        const upcomingEvents =
          upcomingResponse.data.items?.map((event) => ({
            id: event.id || "",
            title: event.summary || "No Title",
            text: event.description || "",
            start: event.start?.dateTime || event.start?.date || "",
            end: event.end?.dateTime || event.end?.date || "",
            location: event.location || "",
            htmlLink: event.htmlLink || "",
            calendarName: cal.name,
          })) || []
        calendarEvents = calendarEvents.concat(upcomingEvents)

        // Fetch past events
        const pastResponse = await calendarService.events.list({
          calendarId: cal.id,
          timeMax: now.toISOString(), // Events up to now
          maxResults: 200,
          singleEvents: true,
          orderBy: "startTime", // ordered by start time ascending
        })

        const pastEvents =
          pastResponse.data.items?.map((event) => ({
            id: event.id || "",
            title: event.summary || "No Title",
            text: event.description || "",
            start: event.start?.dateTime || event.start?.date || "",
            end: event.end?.dateTime || event.end?.date || "",
            location: event.location || "",
            htmlLink: event.htmlLink || "",
            calendarName: cal.name,
          })) || []
        calendarEvents = calendarEvents.concat(pastEvents)
      } catch (error) {
        console.warn(`Failed to fetch events for calendar ID ${cal.id}:`, error)
      }
      return calendarEvents
    })

    let allEvents = (await Promise.all(fetchPromises)).flat()

    // Remove duplicates (events with the same ID)
    const eventMap = new Map()
    for (const event of allEvents) {
      eventMap.set(event.id, event)
    }
    allEvents = Array.from(eventMap.values())

    // Sort all events chronologically
    allEvents.sort((a, b) => {
      const dateA = new Date(a.start).getTime()
      const dateB = new Date(b.start).getTime()
      return dateA - dateB
    })

    return NextResponse.json(allEvents)
  } catch (error: unknown) {
    console.error("Error fetching public calendar events:", error)

    function isGoogleApiError(
      err: unknown
    ): err is { response: { data: unknown } } {
      return (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response: unknown }).response === "object" &&
        (err as { response: unknown }).response !== null &&
        "data" in (err as { response: { data: unknown } }).response
      )
    }

    if (isGoogleApiError(error)) {
      console.error("Google API error details:", error.response.data)
      return NextResponse.json(
        {
          message: "Failed to fetch public calendar events from Google API",
          details: error.response.data,
        },
        { status: 500 }
      )
    } else if (error instanceof Error) {
      return NextResponse.json(
        {
          message: "Failed to fetch public calendar events",
          details: error.message,
        },
        { status: 500 }
      )
    } else {
      return NextResponse.json(
        {
          message: "Failed to fetch public calendar events",
          details: "An unknown error occurred.",
        },
        { status: 500 }
      )
    }
  }
}
