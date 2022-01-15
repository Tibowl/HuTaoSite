import Image from "next/image"

export default function Icon({ icon, className }: { icon: {name: string, icon?: string}, className?: string }) {
    const src = icon.icon ?? "img/unknown.png"

    if (src.startsWith("img"))
      // eslint-disable-next-line @next/next/no-img-element
      return <img alt={icon.name} src={"/" + src} className={className} width={256} height={256} onError={(e) => (e.target as HTMLImageElement).src = "/img/unknown.png"} loading="eager" />

    return <Image alt={icon.name} src={src} className={className} width={256} height={256} onError={(e) => (e.target as HTMLImageElement).src = "/img/unknown.png"} loading="eager" />
  }
