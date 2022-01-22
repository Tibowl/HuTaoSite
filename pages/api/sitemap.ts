import { NextApiRequest, NextApiResponse } from "next"
import { config } from "../../utils/config"
import { getArtifacts, getCharacters, getEnemies, getGuides, getMaterials, getWeapons, } from "../../utils/data-cache"
import { urlify } from "../../utils/utils"

export default async function api(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.redirect("/")

  const urls: string[] = [`${config.appUri}`]

  urls.push(`${config.appUri}/artifacts`)
  for (const arti of Object.values((await getArtifacts()) ?? {}))
    urls.push(`${config.appUri}/artifacts/${urlify(arti.name, false)}`)

  urls.push(`${config.appUri}/characters`)
  for (const char of Object.values((await getCharacters()) ?? {}))
    urls.push(`${config.appUri}/characters/${urlify(char.name, false)}`)

  urls.push(`${config.appUri}/guides`)
  for (const category of (await getGuides()) ?? []) {
    urls.push(`${config.appUri}/guides/${urlify(category.name, false)}`)
    for (const page of category.pages)
      urls.push(`${config.appUri}/guides/${urlify(category.name, false)}/${urlify(page.name, true)}`)
  }

  urls.push(`${config.appUri}/enemies`)
  for (const enemy of Object.values((await getEnemies()) ?? {}))
    urls.push(`${config.appUri}/enemies/${urlify(enemy.name, false)}`)

  urls.push(`${config.appUri}/materials`)
  for (const material of Object.values((await getMaterials()) ?? {}))
    urls.push(`${config.appUri}/materials/${urlify(material.name, false)}`)

  urls.push(`${config.appUri}/materials`)
  for (const material of Object.values((await getMaterials()) ?? {}))
    urls.push(`${config.appUri}/materials/${urlify(material.name, false)}`)

  urls.push(`${config.appUri}/weapons`)
  for (const weapon of Object.values((await getWeapons()) ?? {}))
    urls.push(`${config.appUri}/weapons/${urlify(weapon.name, false)}`)

  res.setHeader("Cache-Control", "public, max-age: 57600, s-max-age: 604800")
  res.setHeader("Content-Type", "text/plain; charset=UTF-8")
  res.send(urls.join("\n"))
}
