"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@supabase/ssr"
import { Instagram, Facebook, ExternalLink } from "lucide-react"

type GalleryImage = {
  id: string
  title: string | null
  description: string | null
  image_url: string
  category: string | null
  social_link: string | null
}

const getSocialIcon = (url: string | null) => {
  if (!url) return null
  if (url.includes("instagram.com")) return <Instagram className="h-5 w-5" />
  if (url.includes("facebook.com")) return <Facebook className="h-5 w-5" />
  return <ExternalLink className="h-5 w-5" />
}

const categories = ["Tous", "Plats", "Buffets", "Événements"]

export default function GaleriePage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [selectedCategory, setSelectedCategory] = useState("Tous")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGallery() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .eq("is_visible", true)
        .order("display_order", { ascending: true })

      if (error) {
        console.error("[v0] Error fetching gallery:", error)
      } else {
        setImages(data || [])
      }
      setLoading(false)
    }

    fetchGallery()
  }, [])

  const filtered =
    selectedCategory === "Tous" ? images : images.filter((img) => img.category === selectedCategory)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#a6a6a6] to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-charmonman text-5xl md:text-6xl font-bold text-[#ff3131] mb-6 text-balance">
            Notre Galerie
          </h1>
          <p className="font-simonetta text-xl text-gray-700 text-pretty">
            Découvrez nos créations culinaires et nos plus belles réalisations
          </p>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-12 px-4 bg-white border-b">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? "default" : "outline"}
                className={
                  selectedCategory === category
                    ? "bg-[#ff3131] hover:bg-[#ff3131]/90 text-white font-simonetta"
                    : "border-2 border-gray-300 hover:border-[#ff3131] font-simonetta bg-transparent"
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-20">
              <p className="font-simonetta text-lg text-gray-600">Chargement de la galerie...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-simonetta text-lg text-gray-600">Aucune image dans cette catégorie pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((image) => (
                <Card
                  key={image.id}
                  className="border-2 hover:border-[#ff3131] transition-all overflow-hidden group cursor-pointer"
                  onClick={() => {
                    if (image.social_link) {
                      window.open(image.social_link, "_blank")
                    }
                  }}
                >
                  <div className="relative h-80">
                    <Image
                      src={image.image_url || "/placeholder.svg"}
                      alt={image.title || "Gallery image"}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {image.social_link && (
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-80 group-hover:opacity-100 transition-opacity">
                        {getSocialIcon(image.social_link)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      {image.title && <h3 className="font-charmonman text-2xl mb-1">{image.title}</h3>}
                      {image.description && <p className="font-simonetta text-sm">{image.description}</p>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#ff3131] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-charmonman text-4xl md:text-5xl mb-6">Envie de Créer Votre Propre Événement ?</h2>
          <p className="font-simonetta text-xl mb-8">
            Contactez-nous pour discuter de votre projet et recevoir un devis personnalisé
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-[#ff3131] hover:bg-gray-100 font-simonetta text-lg h-14 px-8"
            >
              <a href="/quote">Demander un devis</a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-[#ff3131] font-simonetta text-lg h-14 px-8 bg-transparent"
            >
              <a href="/contact">Nous contacter</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
