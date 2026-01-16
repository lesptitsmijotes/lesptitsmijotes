"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

export function Navigation() {
  const [open, setOpen] = useState(false)
  const [showLogo, setShowLogo] = useState(false)
  const pathname = usePathname()
  const isHomePage = pathname === "/"

  useEffect(() => {
    // Si ce n'est pas la page d'accueil, toujours afficher le logo
    if (!isHomePage) {
      setShowLogo(true)
      return
    }

    const handleScroll = () => {
      // Hauteur du hero section (70vh)
      const heroHeight = window.innerHeight * 0.7
      const scrollPosition = window.scrollY

      // Afficher le logo quand on dépasse le hero
      setShowLogo(scrollPosition > heroHeight - 100)
    }

    // Vérifier la position initiale
    handleScroll()

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isHomePage])

  const navItems = [
    { href: "/", label: "Accueil" },
    { href: "/notre-histoire", label: "Notre histoire" },
    { href: "/services/particuliers", label: "Particuliers" },
    { href: "/services/professionnels", label: "Professionnels" },
    { href: "/services/evenements", label: "Événements" },
    { href: "/galerie", label: "Galerie" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-[#f5efe8]/95 backdrop-blur supports-[backdrop-filter]:bg-[#f5efe8]/80">
      <div className="w-full px-4 sm:px-6 lg:px-12">
        <div className="flex h-24 items-center justify-between">
          {/* Logo - visible uniquement après avoir scrollé au-delà du hero sur la page d'accueil */}
          <Link
            href="/"
            className={`flex items-center shrink-0 transition-opacity duration-300 ${showLogo ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            <img
              src="/images/logo-web.svg"
              alt="Les P'tits Mijotés - Cuisine et Traiteur Africain"
              style={{ height: "88px", width: "auto" }}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-4 xl:gap-6">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href))
              return (
                <Link
                  key={index}
                  href={item.href}
                  className={`font-simonetta text-lg xl:text-xl whitespace-nowrap transition-colors ${
                    isActive
                      ? "text-[#ff3131] font-bold"
                      : "text-gray-700 hover:text-[#ff3131]"
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
            <Button asChild className="bg-[#ff3131] hover:bg-[#ff3131]/90 text-white font-simonetta ml-4 xl:ml-8 shrink-0">
              <Link href="/order">Commander</Link>
            </Button>
          </div>

          {/* Mobile Navigation */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-4 mt-8">
                {navItems.map((item, index) => {
                  const isActive = pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href))
                  return (
                    <Link
                      key={index}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`font-simonetta text-xl transition-colors ${
                        isActive
                          ? "text-[#ff3131] font-bold"
                          : "text-gray-700 hover:text-[#ff3131]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
                <Button asChild className="bg-[#ff3131] hover:bg-[#ff3131]/90 text-white font-simonetta mt-4">
                  <Link href="/order" onClick={() => setOpen(false)}>
                    Commander
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
