import { GetServerSidePropsContext } from "next"
import { parse } from "cookie"
import { verify } from "jsonwebtoken"
import { config } from "./config"
import type { DiscordUser } from "./types"

export function parseUser(cookie?: string): DiscordUser | null {
  if (!cookie) {
    return null
  }

  const token = parse(cookie)[config.cookieName]

  if (!token) {
    return null
  }

  try {
    const { iat, exp, ...user } = verify(token, config.jwtSecret) as DiscordUser & { iat: number; exp: number }
    return user
  } catch (e) {
    return null
  }
}
