import Head from "next/head"
import Image from "next/image"
import FormattedLink from "../components/FormattedLink"
import Alarm from "../public/alarm.svg"
import Book from "../public/book.svg"
import Calc from "../public/calc.svg"
import Discord from "../public/discord.svg"
import GitHub from "../public/github.svg"
import Newspaper from "../public/newspaper.svg"
import Person from "../public/person.svg"
import { weapons } from "../utils/utils"

export default function Home({ location }: { location: string }) {
  const desc = "Genshin Impact database and tools, available as a website and Discord bot."
  return (
    <main>
      <Head>
        <title>Hu Tao</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Hu Tao" />
        <meta property="og:description" content={desc} />
        <meta name="description" content={desc} />
      </Head>

      <div className="flex flex-col items-center justify-center w-full flex-1 text-center">
        <h1 className="text-6xl font-bold mt-6">
          Welcome to Hu Tao
        </h1>

        <p className="m-3 text-2xl">
          A Genshin Impact database site and Discord bot
        </p>
        <div className="md:flex md:flex-row items-center justify-around max-w-4xl">
          <Button href="https://discord.com/oauth2/authorize?client_id=826550363355086918&scope=bot+applications.commands&permissions=313344" location={location} colors="bg-sky-300 dark:bg-sky-900">
            <span className="m-2 h-6 w-6">
              <Discord />
            </span>
            <h3 className="text-2xl font-bold m-2">
              Add the Discord bot
            </h3>
          </Button>
          <Button href="https://github.com/Tibowl/hutao#commands" location={location}>
            <span className="m-2 h-6 w-6">
              <GitHub />
            </span>
            <h3 className="text-2xl font-bold m-2">
              View command list on GitHub
            </h3>
          </Button>
        </div>
        <div className="md:flex md:flex-row items-center justify-around md:max-w-4xl">
          <FormattedLink
            href="https://discord.gg/BM3Srp8j8G"
            location={location}
            className="py-0.5 px-1 mt-1 border w-full md:w-auto rounded-md text-center items-center justify-center flex flex-row"
            target="_blank">
            <span className="mx-1.5 h-5 w-5">
              <Discord />
            </span>
            <h3 className="text-xl font-semibold m-2">
              Join the support server
            </h3>
          </FormattedLink>
        </div>
      </div>

      <h3 className="p-3 mt-10 text-3xl text-left">
        Features:
      </h3>
      <div className="grid items-center justify-around max-w-4xl mt-1">
        <div className="md:flex md:flex-row items-center max-w-4xl">
          <Card href="/guides" title="Guides &rarr;" desc="Find where those Specters are hiding" location={location} icon={<Book />} alsoSite />
          <Card href="/tools/reminders" title="Reminders &rarr;" desc="Remind yourself of that Parametric Transformer you forgot for the 3rd time this month" location={location} icon={<Alarm />} alsoSite="Can be managed on site as well" />
        </div>

        <div className="md:flex md:flex-row items-center max-w-4xl">
          <Card href="/characters" title="Character Information &rarr;" desc="Check which talent books a character needs, their talent scaling, their constellations and more" location={location} icon={<Person />} alsoSite />
          <Card title="News" desc="Don't miss out on the latest drip marketing" location={location} icon={<Newspaper />} />
        </div>

        <div className="md:flex md:flex-row items-center max-w-4xl">
          <Card href="/weapons" title="Weapon Information &rarr;" desc="Check which weapon ascension material you need to level that shiny new weapon or which refinements/sub-stat it has" location={location} src={weapons.Sword} alsoSite />
          <Card href="/events" title="Events &rarr;" desc="Get reminded when new events come out" location={location} icon={<Alarm />} alsoSite="List of events is available on site" />
        </div>

        <div className="md:flex md:flex-row items-center max-w-4xl">
          <Card href="/tools/gachacalc" title="Gacha calculator &rarr;" desc="Want to check the odds of getting C1 from the 134 pulls you've got right now?" location={location} icon={<Calc />} alsoSite />
          <Card title="And more!" desc="Abyss schedule/floors, Paimon's Bargains schedule, past Event Wishes, ..." location={location} />
        </div>
      </div>
    </main>
  )
}


function Button({ href, children, location, colors = "bg-neutral-300 dark:bg-neutral-900" }: { href: string, children: JSX.Element | string | (string | JSX.Element)[], location: string, colors?: string }) {
  return <FormattedLink
    href={href}
    className={`p-2 my-1.5 sm:m-1.5 border ${colors} w-full sm:w-auto rounded-md text-center items-center justify-center flex flex-row`}
    location={location}
    target="_blank"
  >
    {children}
  </FormattedLink>
}

function Card({ href, src, title, desc, location, colors = "bg-slate-300 dark:bg-slate-800", alsoSite, icon }: { href?: string, src?: string | StaticImageData, icon?: JSX.Element, title: string, desc: string, colors?: string, location: string, alsoSite?: string | boolean }) {
  const className = `px-6 py-1.5 m-1.5 h-full text-left border max-w-full items-start justify-center flex flex-col rounded-2xl ${colors}`
  const inner = <>
    <h3 className="text-3xl font-semibold">
      {src && <Image src={src} width={24} height={24} alt="Icon" />}{icon && <span className="relative w-6 h-6 inline-block">{icon}</span>} {title}
    </h3>
    {
      alsoSite && <p className="mt-0 text-xs">
        {alsoSite == true ? "Also available on the site" : alsoSite}
      </p>
    }
    <p className="mt-2 text-lg">
      {desc}
    </p>
  </>

  if (href)
    return <FormattedLink
      href={href}
      className={className}
      style={{ minHeight: "12rem" }}
      location={location}
    >
      {inner}
    </FormattedLink>
  else
    return <div className={className} style={{ minHeight: "12rem" }}>
      {inner}
    </div>
}
