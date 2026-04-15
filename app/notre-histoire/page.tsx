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
                  Derrière Les P&apos;tits Mijotés, il y a une femme profondément attachée à la cuisine et à ses racines
                  africaines. Elle a appris à cuisiner par la transmission : les gestes précis, le choix juste des
                  épices et l&apos;art de prendre le temps pour construire patiemment des accords de saveurs.
                </p>
                <p>
                  Formée par l&apos;héritage familial, elle défend une gastronomie africaine authentique, généreuse et
                  assumée. Ici, la cuisine devient une invitation au voyage, au partage et à la création de souvenirs
                  autour de recettes sincères et maîtrisées.
                </p>
              </div>
            </div>
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-xl">
              <Image src="/fondatrice-1.JPG" alt="La fondatrice des Petits Mijotés" fill className="object-cover object-center" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl order-2 md:order-1">
              <Image src="/african-spices-and-ingredients-on-wooden-table.jpg" alt="Notre vision culinaire" fill className="object-cover" />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="font-charmonman text-4xl text-[#ff3131] mb-6">Notre vision</h2>
              <div className="space-y-4 font-simonetta text-lg text-gray-700 leading-relaxed">
                <p>
                  Avec Les P&apos;tits Mijotés, l&apos;ambition est claire : apporter plus de diversité, d&apos;élégance et
                  de caractère à vos repas et à vos événements. L&apos;idée n&apos;est pas seulement de proposer des
                  plats africains, mais d&apos;offrir une expérience culinaire qui allie tradition et création,
                  générosité et raffinement.
                </p>
                <p>
                  Nous faisons découvrir — ou redécouvrir — la richesse de la cuisine africaine traditionnelle, tout en
                  proposant des créations d&apos;inspiration africaine revisitées, pensées pour s&apos;adapter aux
                  événements les plus exigeants.
                </p>
                <p>
                  Qu&apos;il s&apos;agisse d&apos;un repas du quotidien ou d&apos;un moment d&apos;exception, notre
                  engagement est le même : mettre notre savoir-faire au service de votre expérience, et transformer
                  chaque table en un véritable moment de découverte et de plaisir.
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
                  Nous valorisons une cuisine africaine sincère, inspirée de traditions riches, avec des saveurs vraies
                  et généreuses.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-[#ff3131] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl text-white">🤝</span>
                </div>
                <h3 className="font-charmonman text-2xl text-black mb-3">Fiabilité</h3>
                <p className="font-simonetta text-gray-600">
                  Nous nous engageons à offrir un service rigoureux, ponctuel et sans imprévu, pour répondre aux
                  exigences du monde professionnel.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-[#ff3131] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl text-white">✨</span>
                </div>
                <h3 className="font-charmonman text-2xl text-black mb-3">Respect</h3>
                <p className="font-simonetta text-gray-600">
                  Le respect guide chacune de nos actions : dans la qualité de nos produits, la tenue de nos
                  engagements et l&apos;attention portée à chaque client.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#ff3131] text-white py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-charmonman text-3xl md:text-4xl mb-3">Prêt à Découvrir Nos Créations ?</h2>
          <p className="font-simonetta text-base mb-5">Explorez nos services et commandez dès aujourd&apos;hui</p>
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
