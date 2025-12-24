import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NotreHistoirePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#a6a6a6] to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-charmonman text-5xl md:text-6xl font-bold text-[#ff3131] mb-6 text-balance">
            Notre Histoire
          </h1>
          <p className="font-simonetta text-xl text-gray-700 text-pretty">
            Découvrez la passion qui anime Les P&apos;tits Mijotés
          </p>
        </div>
      </section>

      {/* Story Content */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="font-charmonman text-4xl text-[#ff3131] mb-6">La Fondatrice</h2>
              <div className="space-y-4 font-simonetta text-lg text-gray-700 leading-relaxed">
                <p>
                  Les P&apos;tits Mijotés est né de la passion d&apos;une femme pour la cuisine africaine authentique et
                  le désir de partager les saveurs traditionnelles avec le plus grand nombre.
                </p>
                <p>
                  Forte d&apos;une expérience familiale transmise de génération en génération, notre fondatrice a su
                  allier tradition et modernité pour créer des plats qui célèbrent la richesse culinaire du continent
                  africain.
                </p>
                <p>
                  Chaque recette est préparée avec des ingrédients soigneusement sélectionnés, dans le respect des
                  méthodes traditionnelles, pour vous offrir une expérience gustative inoubliable.
                </p>
              </div>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl">
              <Image src="/african-woman-chef-cooking-traditional-food.jpg" alt="Notre fondatrice" fill className="object-cover" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl order-2 md:order-1">
              <Image src="/african-spices-and-ingredients-on-wooden-table.jpg" alt="Notre vision culinaire" fill className="object-cover" />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="font-charmonman text-4xl text-[#ff3131] mb-6">Notre Vision Culinaire</h2>
              <div className="space-y-4 font-simonetta text-lg text-gray-700 leading-relaxed">
                <p>
                  Notre mission est de faire découvrir la diversité et la richesse de la cuisine africaine à travers des
                  plats authentiques et raffinés.
                </p>
                <p>
                  Nous croyons que la cuisine est un vecteur de partage, de découverte et de convivialité. Chaque plat
                  raconte une histoire, évoque un souvenir, crée un lien.
                </p>
                <p>
                  Que ce soit pour un repas du quotidien ou un événement spécial, nous mettons tout notre savoir-faire
                  au service de votre satisfaction.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#f5f5f5] rounded-lg p-8 md:p-12">
            <h2 className="font-charmonman text-4xl text-[#ff3131] mb-8 text-center">Nos Valeurs</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-[#ff3131] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl text-white">🔥</span>
                </div>
                <h3 className="font-charmonman text-2xl text-black mb-3">Authenticité</h3>
                <p className="font-simonetta text-gray-600">
                  Nous restons fidèles aux recettes traditionnelles et aux saveurs authentiques de la cuisine africaine.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-[#ff3131] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl text-white">❤️</span>
                </div>
                <h3 className="font-charmonman text-2xl text-black mb-3">Passion</h3>
                <p className="font-simonetta text-gray-600">
                  Chaque plat est préparé avec amour et dévouement pour vous offrir la meilleure expérience possible.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-[#ff3131] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl text-white">✨</span>
                </div>
                <h3 className="font-charmonman text-2xl text-black mb-3">Excellence</h3>
                <p className="font-simonetta text-gray-600">
                  Nous sélectionnons les meilleurs ingrédients et appliquons des standards de qualité rigoureux.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#ff3131] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-charmonman text-4xl md:text-5xl mb-6">Prêt à Découvrir Nos Créations ?</h2>
          <p className="font-simonetta text-xl mb-8">Explorez nos services et commandez dès aujourd&apos;hui</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-[#ff3131] hover:bg-gray-100 font-simonetta text-lg h-14 px-8"
            >
              <Link href="/services/particuliers">Découvrir nos services</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-[#ff3131] font-simonetta text-lg h-14 px-8 bg-transparent"
            >
              <Link href="/order">Commander maintenant</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
