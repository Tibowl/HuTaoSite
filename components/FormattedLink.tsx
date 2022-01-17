import Link from "next/link"
import { ForwardedRef, forwardRef } from "react"


const Wrapped = forwardRef(function FLink({ children, onClick, href, className = "", style={}, location, target = undefined }: any, innerRef: ForwardedRef<HTMLAnchorElement>) {
    let colors = "text-blue-800 dark:text-blue-100 hover:text-blue-500 dark:hover:text-blue-400"
    if (href == location)
        colors = "text-blue-600 dark:text-blue-400 hover:text-blue-400 dark:hover:text-blue-500"
    else if (location?.startsWith(href) && href != "/")
        colors = "text-blue-700 dark:text-blue-300 hover:text-blue-400 dark:hover:text-blue-400"

    return (
        <a ref={innerRef} className={`${className} no-underline transition-all duration-200 ${colors}`} style={style} onClick={onClick} href={href} target={target} >
            {children}
        </a>
    )
})

function FormattedLink({ children, href, className = "", style = {}, location, target = undefined, prefetch = undefined }: any) {
    return (
        <Link href={href} passHref prefetch={prefetch}><Wrapped location={location} className={className} target={target} style={style}>{children}</Wrapped></Link>
    )
}

export default FormattedLink
