import { GetStaticPropsContext, GetStaticPropsResult } from "next"
import Head from "next/head"
import FormattedLink from "../../components/FormattedLink"
import Main from "../../components/Main"
import { getGuides, urlify } from "../../utils/data-cache"

interface Props {
  guides: string[]
}

export default function Guides(props: Props & { location: string }) {
  return (
    <Main>
      <Head>
        <title>Guides | Hu Tao</title>
        <meta name="twitter:card" content="summary" />
        <meta property="og:title" content="Guides | Hu Tao" />
        <meta property="og:description" content="View currently available guides and routes" />
      </Head>

      <h1 className="text-5xl font-bold pb-2">
        Guides
      </h1>

      <ul>
        {props.guides.map(g => (
          <li key={g}>
            -{" "}
            <FormattedLink font="semibold" size="xl" location={props.location} href={`/guides/${urlify(g, false)}`} >
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
      revalidate: 5 * 60
    }
  }

  return {
    props: {
      guides: data.map(g => g.name)
    },
    revalidate: 60 * 60
  }
}
