import { GetStaticPropsContext, GetStaticPropsResult } from "next"
import Head from "next/head"
import Image from "next/image"
import FormattedLink from "../../components/FormattedLink"
import Main from "../../components/Main"
import { getCharacters, urlify } from "../../utils/data-cache"
import { Character, CharacterFull } from "../../utils/types"

import Cryo from "../../public/img/element/Cryo.png"
import Anemo from "../../public/img/element/Anemo.png"
import Dendro from "../../public/img/element/Dendro.png"
import Geo from "../../public/img/element/Geo.png"
import Electro from "../../public/img/element/Electro.png"
import Hydro from "../../public/img/element/Hydro.png"
import Pyro from "../../public/img/element/Pyro.png"

const elements = {
    Anemo, Cryo, Dendro, Geo, Electro, Hydro, Pyro
}

type Element = "Anemo"

interface SmallChar {
    name: string
    stars?: number
    element?: (keyof (typeof elements))[]
    weapon?: string
    icon?: string
}

interface Props {
    characters: SmallChar[]
}

export default function Characters(props: Props & { location: string }) {
    return (
        <Main>
            <Head>
                <title>Characters | Hu Tao</title>
                <meta name="twitter:card" content="summary" />
                <meta property="og:title" content="Characters | Hu Tao" />
                <meta property="og:description" content="View information about different Genshin Impact characters!" />
            </Head>

            <h1 className="text-5xl font-bold pb-2">
                Characters
            </h1>

            <div className="flex flex-wrap justify-around text-center">
                {props.characters.map(char => (
                    <FormattedLink key={char.name} font="semibold" size="xl" location={props.location} href={`/characters/${urlify(char.name, false)}`} >
                        <div className="bg-slate-600 w-24 h-24 m-2">
                            <div className="absolute w-6 m-1">
                                {char.element && char.element.map(e => <Image src={elements[e]} key={e} alt={`${e} Element`}/>)}
                                <Image alt={char.name} src={char.icon ?? "/img/unknown.png"} className="w-24" width={256} height={256} onError={(e) => (e.target as HTMLImageElement).src = "/img/unknown.png"}/>
                            </div>
                            {char.name}
                        </div>
                    </FormattedLink>
                ))}
            </div>
        </Main>
    )
}

function isFullCharacter(char: Character): char is CharacterFull {
    return typeof (char as CharacterFull).releasedOn == "string"
}

export async function getStaticProps(context: GetStaticPropsContext): Promise<GetStaticPropsResult<Props>> {
    const data = await getCharacters()

    if (!data) {
        return {
            notFound: true,
            revalidate: 5 * 60
        }
    }

    return {
        props: {
            characters: Object
                .values(data)
                .sort((a, b) => {
                    if (isFullCharacter(a) && isFullCharacter(b))
                        return b.releasedOn.localeCompare(a.releasedOn) || b.star - a.star || a.name.localeCompare(b.name)
                    else if (!isFullCharacter(b))
                        return 1
                    else if (!isFullCharacter(a))
                        return -1
                    else return a.name.localeCompare(b.name)
                })
                .map(c => {
                    const char: SmallChar = { name: c.name }
                    if (c.star) char.stars = c.star
                    if (c.skills) char.element = c.skills.map(skill => skill.ult?.type).filter(x => x) as Element[]
                    if (c.weaponType) char.weapon = c.weaponType
                    if (c.icon) char.icon = c.icon
                    return char
                })
        },
        revalidate: 60 * 60
    }
}
