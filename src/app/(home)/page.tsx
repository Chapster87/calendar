"use client"

import { useSession } from "next-auth/react"
import Heading from "@/components/typography/heading"
import Text from "@/components/typography/text"
import EventList from "./_components/event-list"

import s from "./styles.module.css"

export default function Home() {
  const { data: session } = useSession()

  return (
    <div className={s.page}>
      <div className={s.pageSection}>
        <Heading level="h1">Next.js Starter</Heading>
        <Text>
          A minimal starter for Next.js with TypeScript, and my custom
          components.
        </Text>
        {session && <EventList />}
      </div>
    </div>
  )
}
