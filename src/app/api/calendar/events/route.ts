import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { google } from "googleapis"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ access_token: session.accessToken as string })

    const calendar = google.calendar({ version: "v3", auth: oauth2Client })

    const now = new Date()
    const oneWeekLater = new Date()
    oneWeekLater.setDate(now.getDate() + 7)

    const response = await calendar.events.list({
      calendarId: "primary", // 'primary' refers to the user's primary calendar
      timeMin: now.toISOString(),
      timeMax: oneWeekLater.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    })

    return NextResponse.json(response.data.items)
  } catch (error: unknown) {
    console.error("Error fetching calendar events:", error)

    // Define a type guard for Google API errors
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
      // The API returned an error response from googleapis
      console.error("Google API error details:", error.response.data)
      return NextResponse.json(
        {
          message: "Failed to fetch calendar events from Google API",
          details: error.response.data,
        },
        { status: 500 }
      )
    } else if (error instanceof Error) {
      // Generic JavaScript error
      return NextResponse.json(
        { message: "Failed to fetch calendar events", details: error.message },
        { status: 500 }
      )
    } else {
      // Unknown error type
      return NextResponse.json(
        {
          message: "Failed to fetch calendar events",
          details: "An unknown error occurred.",
        },
        { status: 500 }
      )
    }
  }
}
