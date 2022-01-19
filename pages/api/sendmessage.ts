import { NextApiRequest, NextApiResponse } from "next"
import fetch from "node-fetch"
import { config } from "../../utils/config"
import { parseUser } from "../../utils/parse-user"


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

  const fetched = await fetch(`${config.discordUri}/testmessage/${user.id}`, {
    headers: { Authorization: `${config.discordSecret}`, "Content-Type": "application/json" },
    method: "POST"
  })

  res.status(fetched.status).send(await fetched.text())
}
