import { NextApiRequest, NextApiResponse } from "next"
import fetch from "node-fetch"
import { config } from "../../utils/config"
import { parseUser } from "../../utils/parse-user"
import { DiscordUser } from "../../utils/types"


export default async function api(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.redirect("/")
  const user = parseUser(req.headers.cookie)

  if (!user) {
    return {
      redirect: {
        destination: "/api/oauth",
        permanent: false,
      },
    }
  }

  if (ratelimit(user))
    return res.status(429).send("Please wait before clicking again")

  const fetched = await fetch(`${config.discordUri}/testmessage/${user.id}`, {
    headers: { Authorization: `${config.discordSecret}`, "Content-Type": "application/json" },
    method: "POST"
  })

  res.status(fetched.status).send(await fetched.text())
}

const map = new Map<string, number>()
function ratelimit(user: DiscordUser): boolean {
  if (map.get(user.id) ?? 0 > Date.now())
    return true

  map.set(user.id, Date.now() + 3000)
  setTimeout(() => {
    map.delete(user.id)
  }, 3000)
  return false
}
