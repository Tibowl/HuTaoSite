import React, { useState } from "react"
import FormattedLink from "./FormattedLink"

const pages = ["Guides", "Characters", "Weapons", "Materials", "Artifacts", "Reminders"]

export default function NavBar({ location }: {location: string}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const navLinks = pages.map(page => <FormattedLink key={page} href={`/${page.toLowerCase()}`} location={location}>{page}</FormattedLink>)

  return (
    <div className="text-xl bg-gradient-to-r from-blue-200 to-blue-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-between md:justify-start p-4 w-full top-0">
      <div className={`flex items-center pr-20 ${menuOpen ? "hidden": ""} sm:block`}>
        <Logo />
        <FormattedLink location={location} href="/" className="font-bold">Hu Tao</FormattedLink>
      </div>
      <nav className="hidden md:block space-x-6">
        {navLinks}
      </nav>
      <div className={`flex flex-row items-start justify-between md:hidden ${menuOpen?"w-full":""}`}>
        {menuOpen && <MobileMenu navLinks={navLinks} />}
        <button type="button" aria-label="Toggle mobile menu" onClick={() => setMenuOpen(!menuOpen)}>
          <MenuAlt4Svg menuOpen={menuOpen} />
        </button>
      </div>
    </div>
  )
};

function MobileMenu({ navLinks }: {navLinks: JSX.Element[] }) {
  return (
    <nav className="p-4 flex flex-col space-y-3 md:hidden">
      {navLinks}
    </nav>
  )
}

function Logo() {
  return null
}


function MenuAlt4Svg({ menuOpen }: {menuOpen: boolean}) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`transition duration-100 ease h-7 w-7 ${menuOpen ? "transform rotate-90 origin-center" : ""}`} viewBox="0 0 49 49" fill="currentColor">
      <rect fillRule="evenodd" clipRule="evenodd" x="3" y="3"  width="45" height="7" rx="2"></rect>
      <rect fillRule="evenodd" clipRule="evenodd" x="3" y="22" width="45" height="7" rx="2"></rect>
      <rect fillRule="evenodd" clipRule="evenodd" x="3" y="41" width="45" height="7" rx="2"></rect>
    </svg>
  )
}
// 1|7|1 10 1|7|1 10 1|7|1
