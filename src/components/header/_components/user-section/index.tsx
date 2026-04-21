"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import * as Avatar from "@radix-ui/react-avatar"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import Text from "@components/typography/text"
import s from "./styles.module.css"

/**
 * @TODO: Make a global button component that can be used here.
 */

/**
 * Renders the user section with avatar, name, and sign-out button if a session exists.
 * @returns {JSX.Element | null} The user section component or null if no session.
 */
export default function UserSection() {
  const { data: session } = useSession()
  console.log("data:", session)

  if (session) {
    return (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className={s.avatarButton} aria-label="User menu">
            <Avatar.Root className={s.userAvatarRoot}>
              <Avatar.Image
                className={s.userAvatarImage}
                src={session.user?.image || undefined}
                alt={session.user?.name || "User Avatar"}
              />
              <Avatar.Fallback className={s.userAvatarFallback} delayMs={600}>
                {session.user?.name ? session.user.name.charAt(0) : "U"}
              </Avatar.Fallback>
            </Avatar.Root>
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className={s.DropdownMenuContent}
            sideOffset={5}
          >
            <DropdownMenu.Label className={s.DropdownMenuLabel}>
              {session.user?.name}
            </DropdownMenu.Label>
            <DropdownMenu.Item
              className={s.DropdownMenuItem}
              onClick={() => signOut()}
            >
              Sign Out
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    )
  }
  return (
    <div className={s.userSection}>
      <button onClick={() => signIn("google")}>Sign in with Google</button>
    </div>
  )
}
