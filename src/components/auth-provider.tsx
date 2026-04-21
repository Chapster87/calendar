"use client"

import { SessionProvider } from "next-auth/react"
import React from "react"

/**
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child elements to be rendered within the session provider
 * @returns {JSX.Element} The session provider component
 */
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <SessionProvider>{children}</SessionProvider>
}
