import { NextApiRequest, NextApiResponse } from "next"
import fetch from "node-fetch"
import { config } from "../../../utils/config"
import { parseUser } from "../../../utils/parse-user"
import { Reminder } from "../../../utils/types"


export default async function api(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.redirect("/")
  const user = parseUser(req.headers.cookie)
  const reminder: Reminder = req.body?.r

  if (!user || !reminder) {
    return {
      redirect: {
        destination: "/api/oauth",
        permanent: false,
      },
    }
  }

  console.log(`[${new Date().toISOString()}] Deleting reminder ${user.id} / ${reminder.id}`)

  const fetched = await fetch(`${config.discordUri}/reminders/${user.id}/delete`, {
    headers: { Authorization: `${config.discordSecret}`, "Content-Type": "application/json" },
    body: JSON.stringify(reminder),
    method: "POST"
  })

  res.status(fetched.status).send(await fetched.text())
}
