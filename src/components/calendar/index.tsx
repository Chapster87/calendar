"use client"

import { useState } from "react"
import dayjs from "dayjs"
import Heading from "@/components/typography/heading"
import Text from "@/components/typography/text"
import Link from "@/components/link"
import * as Tooltip from "@radix-ui/react-tooltip"
import { CalendarEvent } from "@/types/calendar"

import s from "./styles.module.css"

interface CalendarProps {
  title?: string
  events?: CalendarEvent[]
}

export default function Calendar({ title, events }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(dayjs())

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]

  const getDaysInMonthGrid = () => {
    const startOfMonth = currentDate.startOf("month")
    const endOfMonth = currentDate.endOf("month")

    const daysInMonth = []

    // Add days from the previous month
    const startDayOfWeek = startOfMonth.day()
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      daysInMonth.push({
        date: startOfMonth.subtract(i + 1, "day"),
        isCurrentMonth: false,
      })
    }

    // Add days from the current month
    for (let i = 0; i < currentDate.daysInMonth(); i++) {
      daysInMonth.push({
        date: startOfMonth.add(i, "day"),
        isCurrentMonth: true,
      })
    }

    // Add days from the next month
    const endDayOfWeek = endOfMonth.day()
    for (let i = 1; i < 7 - endDayOfWeek; i++) {
      daysInMonth.push({
        date: endOfMonth.add(i, "day"),
        isCurrentMonth: false,
      })
    }

    return daysInMonth
  }

  const daysInMonthGrid = getDaysInMonthGrid()

  const formatTimeShort = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      hour12: true, // Use 12-hour format with AM/PM
    }
    return new Date(dateString).toLocaleTimeString([], options)
  }

  const calendarEvents = events ?? [] // Ensure events is an empty array if undefined

  return (
    <div className={s.calendarBlock}>
      <Heading level="h1" className={s.headerTitle}>
        {title || "Event Calendar"}
      </Heading>
      <div className={s.headerControls}>
        <button
          onClick={() => setCurrentDate(currentDate.subtract(1, "month"))}
        >
          Previous
        </button>
        <Heading level="h2" className={s.headerMonthYear}>
          {currentDate.format("MMMM YYYY")}
        </Heading>
        <button onClick={() => setCurrentDate(currentDate.add(1, "month"))}>
          Next
        </button>
      </div>
      <div className={s.calendarGrid}>
        {daysOfWeek.map((day) => (
          <div key={day} className={s.dayOfWeekName}>
            {day}
          </div>
        ))}
        {daysInMonthGrid.map((day, index) => {
          const hasEvent = calendarEvents.some((event) =>
            dayjs(event.start).isSame(day.date, "day")
          )
          const isToday = day.date.isSame(dayjs(), "day")
          return (
            <div
              key={index}
              className={`${s.day} ${
                day.isCurrentMonth ? s.dayCurrentMonth : s.dayDisabled
              } ${hasEvent ? s.dayWithEvent : ""} ${isToday ? s.dayToday : ""}`}
            >
              <div className={s.dayHeader}>{day.date.date()}</div>
              <div className={s.dayBody}>
                {calendarEvents.map((event) => {
                  const eventDate = dayjs(event.start)
                  if (eventDate.isSame(day.date, "day")) {
                    return (
                      <Tooltip.Provider key={event.id}>
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <div
                              className={`${s.event} ${s[event.calendarName]}`}
                            >
                              <span className={s.eventDot}></span>
                              <span className={s.eventText}>{event.title}</span>
                            </div>
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Content
                              className={s.tooltipContent}
                              side="top"
                              align="center"
                              sideOffset={5}
                            >
                              <Heading level="h3" className={s.tooltipTitle}>
                                {event.title}
                              </Heading>
                              {event.text && (
                                <Text className={s.tooltipText}>
                                  {event.text}
                                </Text>
                              )}
                              {event.start && event.end && (
                                <Text className={s.tooltipTime}>
                                  <strong>Time:</strong>{" "}
                                  {formatTimeShort(event.start)} -{" "}
                                  {formatTimeShort(event.end)}
                                </Text>
                              )}
                              {event.location && (
                                <Text className={s.tooltipLocation}>
                                  <strong>Location:</strong> {event.location}
                                  <Link
                                    href={`https://www.google.com/maps?q=${encodeURIComponent(
                                      event.location
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={s.tooltipLink}
                                  >
                                    View on Google Maps
                                  </Link>
                                </Text>
                              )}
                              {event.htmlLink && (
                                <Link
                                  href={event.htmlLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={s.tooltipLink}
                                >
                                  View Event Details
                                </Link>
                              )}
                              <Tooltip.Arrow className={s.tooltipArrow} />
                            </Tooltip.Content>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      </Tooltip.Provider>
                    )
                  }
                  return null
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
