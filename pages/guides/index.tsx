import { GetStaticPropsContext, GetStaticPropsResult } from "next"
import Head from "next/head"
import FormattedLink from "../../components/FormattedLink"
import Main from "../../components/Main"
import { getGuides } from "../../utils/data-cache"
import { urlify } from "../../utils/utils"

interface Props {
  guides: string[]
}

export default function Guides(props: Props & { location: string }) {
  const desc = "Click to find our currently available guides and routes for Genshin Impact."
  return (
    <Main>
      <Head>
        <title>Guides | Hu Tao</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Guides | Hu Tao" />
        <meta property="og:description" content={desc} />
        <meta name="description" content={desc} />
      </Head>

      <h1 className="text-5xl font-bold pb-2">
        Guides
      </h1>

      <ul>
        {props.guides.map(g => (
          <li key={g}>
            -{" "}
            <FormattedLink className="font-semibold text-xl" location={props.location} href={`/guides/${urlify(g, false)}`} >
              {g}
            </FormattedLink>
          </li>
        ))}
      </ul>
    </Main>
  )
}

export async function getStaticProps(context: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> {
  const data = await getGuides()

  if (!data) {
    return {
      notFound: true,
      revalidate: 15 * 60
    }
  }

  return {
    props: {
      guides: data.map(g => g.name)
    },
    revalidate: 60 * 60 * 1
  }
}
