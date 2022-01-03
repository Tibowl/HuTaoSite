import Head from "next/head"
import Image from "next/image"
import FormattedLink from "../components/FormattedLink"
import alarm from "../public/alarm.svg"
import book from "../public/book.svg"
import calc from "../public/calc.svg"
import newspaper from "../public/newspaper.svg"
import person from "../public/person.svg"

export default function Home({ location }: { location: string }) {
  return (
    <main>
      <Head>
        <title>Hu Tao</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Hu Tao" />
        <meta property="og:description" content="Genshin Impact tools" />
      </Head>

      <div className="flex flex-col items-center justify-center w-full flex-1 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to Hu Tao
        </h1>

        <p className="m-3 text-2xl">
          A Genshin Impact Discord bot and site
        </p>
        <div className="md:flex md:flex-row items-center justify-around">
          <Button href="https://discord.com/oauth2/authorize?client_id=826550363355086918&scope=bot+applications.commands&permissions=313344" title="Add the Discord bot" location={location} colors="bg-sky-300 dark:bg-sky-900"/>
          <Button href="https://github.com/Tibowl/hutao#commands" title="View commands" location={location}/>
        </div>
      </div>

      <h3 className="p-3 mt-10 text-3xl text-left">
        Features:
      </h3>
      <div className="grid items-center justify-around max-w-4xl mt-1">
        <div className="md:flex md:flex-row items-center max-w-4xl">
          <Card href="/guides" title="Guides &rarr;" desc="Find where those Specters are hiding" location={location} src={book} alsoSite />
          <Card href="/reminders" title="Reminders &rarr;" desc="Remind yourself of that Parametric Transformer you forgot for the 5th time" location={location} src={alarm} alsoSite="Can be managed on site as well" />
        </div>

        <div className="md:flex md:flex-row items-center max-w-4xl">
          <Card title="Character and Weapon Information" desc="Check which books that character needs or how many enhancement ores you need to level that shiny new weapon" location={location} src={person}  />
          <Card title="News and Events" desc="Don't miss out on the latest drip marketing" location={location} src={newspaper}  />
        </div>

        <div className="md:flex md:flex-row items-center max-w-4xl">
          <Card title="Gacha calculator" desc="Want to check the odds of getting C1 from the 134 pulls you've got right now?" location={location} src={calc}  />
          <Card title="And more!" desc="Abyss schedule/floors, this month's Paimon's Bargains, ..." location={location}  />
        </div>
      </div>
    </main>
  )
}


function Button({ href, title, location, colors = "bg-neutral-300 dark:bg-neutral-900" }: { href: string, title: string, location: string, colors?: string }) {
  return <FormattedLink
    href={href}
    className={`p-2 m-1.5 border ${colors} w-full md:w-auto rounded-md text-center items-start justify-center flex flex-col`}
    location={location}
    target="_blank"
  >
    <h3 className="text-2xl font-bold m-2">{title}</h3>
  </FormattedLink>
}

function Card({ href, src, title, desc, location, colors = "bg-slate-300 dark:bg-slate-800", alsoSite }: { href?: string, src?: string, title: string, desc: string, colors?: string, location: string, alsoSite?: string | boolean }) {
  const className = `px-6 py-1.5 m-1.5 h-full text-left border max-w-full items-start justify-center flex flex-col rounded-2xl ${colors}`

  if (href)
    return <FormattedLink
    href={href}
    className={className}
    style={{ minHeight: "12rem" }}
    location={location}
  >
      <h3 className="text-3xl font-semibold">{src && <Image src={src} width={24} height={24} alt="Icon"/>} {title}</h3>
      {alsoSite && <p className="mt-0 text-xs">
        {alsoSite == true ? "Also available on the site" : alsoSite}
      </p>}
      <p className="mt-2 text-lg">
        {desc}
      </p>
   </FormattedLink>
  else
    return <div className={className} style={{ minHeight: "12rem" }}>
      <h3 className="text-3xl font-semibold">{src && <Image src={src} width={24} height={24} alt="Icon"/>} {title}</h3>
      <p className="mt-2 text-lg">
        {desc}
      </p>
    </div>
}
