"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import Image from "next/image"

export function Navigation() {
  const [open, setOpen] = useState(false)

  const navItems = [
    { href: "/", label: "Accueil" },
    { href: "/notre-histoire", label: "Notre histoire" },
    {
      label: "Nos services",
      submenu: [
        { href: "/services/particuliers", label: "Particuliers" },
        { href: "/services/professionnels", label: "Professionnels" },
        { href: "/services/evenements", label: "Événements" },
      ],
    },
    { href: "/galerie", label: "Galerie" },
    { href: "/contact", label: "Contact" },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center -ml-2">
            <Image
              src="/images/logo.png"
              alt="Les P'tits Mijotés - Cuisine et Traiteur Africain"
              width={240}
              height={105}
              className="h-16 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-6 md:flex-1 md:justify-end">
            {navItems.map((item, index) =>
              item.submenu ? (
                <div key={index} className="relative group">
                  <button className="font-simonetta text-xl text-gray-700 hover:text-[#ff3131] transition-colors py-2">
                    {item.label}
                  </button>
                  <div className="absolute left-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 bg-white border rounded-md shadow-lg">
                    {item.submenu.map((subitem, subindex) => (
                      <Link
                        key={subindex}
                        href={subitem.href}
                        className="block px-4 py-3 font-simonetta text-lg text-gray-700 hover:bg-[#ff3131]/10 hover:text-[#ff3131] transition-colors"
                      >
                        {subitem.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={index}
                  href={item.href}
                  className="font-simonetta text-xl text-gray-700 hover:text-[#ff3131] transition-colors"
                >
                  {item.label}
                </Link>
              ),
            )}
            <Button asChild className="bg-[#ff3131] hover:bg-[#ff3131]/90 text-white font-simonetta ml-28">
              <Link href="/order">Commander</Link>
            </Button>
          </div>

          {/* Mobile Navigation */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-4 mt-8">
                {navItems.map((item, index) =>
                  item.submenu ? (
                    <div key={index} className="space-y-2">
                      <div className="font-simonetta text-lg font-semibold text-gray-900">{item.label}</div>
                      <div className="pl-4 space-y-2">
                        {item.submenu.map((subitem, subindex) => (
                          <Link
                            key={subindex}
                            href={subitem.href}
                            onClick={() => setOpen(false)}
                            className="block font-simonetta text-base text-gray-700 hover:text-[#ff3131] transition-colors py-1"
                          >
                            {subitem.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={index}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="font-simonetta text-lg text-gray-700 hover:text-[#ff3131] transition-colors"
                    >
                      {item.label}
                    </Link>
                  ),
                )}
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
