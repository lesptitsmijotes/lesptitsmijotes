"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image_url: string | null
  category: string
  is_available: boolean
  is_menu_of_day: boolean
  menu_date: string | null
  display_order: number
  show_on_homepage: boolean
}

export function MenuSection() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchMenuItems() {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("is_menu_of_day", true)
        .eq("is_available", true)
        .eq("show_on_homepage", true)
        .order("menu_date", { ascending: true })
        .order("display_order", { ascending: true })
        .limit(4)

      if (error) {
        return
      }

      if (data) {
        setMenuItems(data)
      }
    }

    fetchMenuItems()
  }, [])

  const formatMenuDate = (menuDate: string | null) => {
    if (!menuDate) return ""

    const date = new Date(menuDate + 'T00:00:00')
    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
    const dayName = days[date.getDay()]
    const dayNumber = date.getDate()

    return `${dayName} ${dayNumber}`
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-[#f5f5f5]">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-charmonman text-4xl md:text-5xl text-center text-[#ff3131] mb-4">Menu du Quotidien</h2>
        <p className="font-simonetta text-lg text-center text-gray-600 mb-12">
          Découvrez nos plats du jour préparés avec amour
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {menuItems.map((item, index) => (
            <Card key={item.id} className="border-2 hover:border-[#ff3131] transition-colors overflow-hidden">
              <div className="flex">
                <div className="w-32 h-32 flex-shrink-0 relative bg-gray-100">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="font-charmonman text-xl text-black">{item.name}</CardTitle>
                        <CardDescription className="font-simonetta text-sm text-gray-500 mt-1">
                          {formatMenuDate(item.menu_date)}
                        </CardDescription>
                      </div>
                      <span className="font-charmonman text-xl text-[#ff3131]">{item.price.toFixed(2)}€</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="font-simonetta text-sm text-gray-600 line-clamp-2">{item.description}</p>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg" className="bg-[#ff3131] hover:bg-[#ff3131]/90 text-white font-simonetta text-lg">
            <Link href="/order">Voir le menu complet et commander</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
