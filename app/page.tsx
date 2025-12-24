"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MenuSection } from "@/components/menu-section"
import { TestimonialsSlider } from "@/components/testimonials-slider"
import { HeroCarousel } from "@/components/hero-carousel"
import { ChefHat, Users, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface HeroImage {
  id: string
  image_url: string
  alt_text: string
  order_index: number
}

export default function HomePage() {
  const [heroImages, setHeroImages] = useState<HeroImage[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchHeroImages() {
      const { data, error } = await supabase
        .from("hero_images")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true })

      if (error) {
        return
      }

      if (data) {
        setHeroImages(data)
      }
    }

    fetchHeroImages()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-[#a6a6a6] to-white px-4 py-20">
        <HeroCarousel images={heroImages} />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="font-charmonman text-5xl md:text-7xl font-bold text-[#ff3131] mb-12 text-balance">
            Savourez l&apos;Afrique Authentique
          </h1>

          <p className="font-simonetta text-xl md:text-2xl text-gray-800 mb-16 max-w-2xl mx-auto text-pretty">
            Cuisine et traiteur africain - Des plats traditionnels préparés avec passion pour vos événements et votre
            quotidien
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-[#ff3131] hover:bg-[#ff3131]/90 text-white font-simonetta text-lg h-14 px-8"
            >
              <Link href="/order">Commander</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-black hover:bg-black hover:text-white font-simonetta text-lg h-14 px-8 bg-transparent"
            >
              <Link href="/quote">Demander un devis</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-charmonman text-4xl md:text-5xl text-center text-[#ff3131] mb-4">Nos Services</h2>
          <p className="font-simonetta text-lg text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Des prestations sur-mesure pour tous vos besoins
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-[#ff3131] transition-colors">
              <CardContent className="pt-8 text-center">
                <div className="w-16 h-16 bg-[#ff3131]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-[#ff3131]" />
                </div>
                <h3 className="font-charmonman text-2xl mb-3 text-black">Particuliers</h3>
                <p className="font-simonetta text-gray-600 mb-4">
                  Repas familiaux, événements privés et buffets raffinés
                </p>
                <Button asChild variant="link" className="text-[#ff3131] font-simonetta">
                  <Link href="/services/particuliers">En savoir plus</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-[#ff3131] transition-colors">
              <CardContent className="pt-8 text-center">
                <div className="w-16 h-16 bg-[#ff3131]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChefHat className="w-8 h-8 text-[#ff3131]" />
                </div>
                <h3 className="font-charmonman text-2xl mb-3 text-black">Professionnels</h3>
                <p className="font-simonetta text-gray-600 mb-4">
                  Pauses déjeuner, plateaux repas et buffets d&apos;entreprise
                </p>
                <Button asChild variant="link" className="text-[#ff3131] font-simonetta">
                  <Link href="/services/professionnels">En savoir plus</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-[#ff3131] transition-colors">
              <CardContent className="pt-8 text-center">
                <div className="w-16 h-16 bg-[#ff3131]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-[#ff3131]" />
                </div>
                <h3 className="font-charmonman text-2xl mb-3 text-black">Événements</h3>
                <p className="font-simonetta text-gray-600 mb-4">Prestations sur-mesure et animations culinaires</p>
                <Button asChild variant="link" className="text-[#ff3131] font-simonetta">
                  <Link href="/services/evenements">En savoir plus</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Menu du Quotidien */}
      <MenuSection />

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-[#f5f5f5]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-charmonman text-4xl md:text-5xl text-center text-[#ff3131] mb-4">
            Ils Nous Font Confiance
          </h2>
          <p className="font-simonetta text-lg text-center text-gray-600 mb-12">Les avis de nos clients satisfaits</p>
          <TestimonialsSlider />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-8 px-4 bg-[#ff3131] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-charmonman text-3xl md:text-4xl mb-3 text-balance">Prêt à Découvrir Nos Créations ?</h2>
          <p className="font-simonetta text-base mb-5 text-pretty">
            Explorez nos services et commandez dès aujourd&apos;hui
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-[#ff3131] hover:bg-gray-100 font-simonetta text-lg h-14 px-8"
            >
              <Link href="/contact">Nous Contacter</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-[#ff3131] font-simonetta text-lg h-14 px-8 bg-transparent"
            >
              <Link href="/galerie">Voir la Galerie</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
