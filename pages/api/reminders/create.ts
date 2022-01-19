import { NextApiRequest, NextApiResponse } from "next"
import fetch from "node-fetch"
import { config } from "../../../utils/config"
import { parseUser } from "../../../utils/parse-user"
import { Reminder } from "../../../utils/types"


export default async function api(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.redirect("/")
  const user = parseUser(req.headers.cookie)
  const name: string = req.body?.name
  const duration: string = req.body?.duration

  if (!user) {
    return {
      redirect: {
        destination: "/api/oauth",
        permanent: false,
      },
    }
  }

  if (!name || !duration || typeof name !== "string" || typeof duration !== "string" || name.length > 128 || duration.length > 128)
    return res.status(400).send("Invalid data")

  console.log(`[${new Date().toISOString()}] Creating reminder ${user.id} / ${name}: ${duration}`)

  const fetched = await fetch(`${config.discordUri}/reminders/${user.id}/create`, {
    headers: { Authorization: `${config.discordSecret}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name, duration }),
    method: "POST"
  })

  res.status(fetched.status).send(await fetched.text())
}
