import type { Metadata } from "next"
import { Inter, Merriweather_Sans } from "next/font/google"
import Header from "@/components/header"
import BreakpointIndicator from "@components/breakpoint-indicator"
import AuthProvider from "@components/auth-provider"
import "@styles/globals.css"
import s from "./styles.module.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})
const merriweatherSans = Merriweather_Sans({
  variable: "--font-merriweather-sans",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
})

export const metadata: Metadata = {
  title: "Calendar App",
  description: "A calendar application powered by Google Calendar",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${merriweatherSans.variable}`}
    >
      <AuthProvider>
        <body data-theme="light">
          <BreakpointIndicator />
          <Header />
          <main className={s.main}>{children}</main>
        </body>
      </AuthProvider>
    </html>
  )
}
