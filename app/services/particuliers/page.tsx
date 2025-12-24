import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Heart, Home, PartyPopper, Utensils } from "lucide-react"

export default function ParticuliersPage() {
  const services = [
    {
      icon: PartyPopper,
      title: "Événements Privés",
      description:
        "Anniversaires, baptêmes, mariages - nous créons des buffets mémorables pour célébrer vos moments importants avec style et authenticité.",
      features: [
        "Buffets personnalisés",
        "Présentation soignée",
        "Service sur place disponible",
        "Adaptation aux régimes spécifiques",
      ],
    },
    {
      icon: Utensils,
      title: "Buffets Raffinés",
      description:
        "Des buffets élégants et généreux qui allient tradition africaine et présentation moderne pour impressionner vos invités.",
      features: ["Large choix de plats", "Décoration africaine", "Options végétariennes", "Quantités adaptables"],
    },
    {
      icon: Home,
      title: "Repas Familiaux",
      description:
        "Des plats traditionnels pour régaler toute la famille, préparés avec soin pour vos déjeuners et dîners à la maison.",
      features: ["Portions généreuses", "Livraison à domicile", "Menus hebdomadaires", "Plats réconfortants"],
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-[#a6a6a6] to-white px-4 py-20">
        <div className="absolute inset-0 bg-[url('/african-family-dinner-celebration.jpg')] opacity-20 bg-cover bg-center" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="font-charmonman text-5xl md:text-6xl font-bold text-[#ff3131] mb-6 text-balance">
            Services pour Particuliers
          </h1>
          <p className="font-simonetta text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto text-pretty">
            Des prestations sur-mesure pour vos événements privés et repas familiaux
          </p>
          <Button
            asChild
            size="lg"
            className="bg-[#ff3131] hover:bg-[#ff3131]/90 text-white font-simonetta text-lg h-14 px-8"
          >
            <Link href="/quote">Demander un devis</Link>
          </Button>
        </div>
      </section>

      {/* Services Details */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-charmonman text-4xl md:text-5xl text-center text-[#ff3131] mb-4">Nos Prestations</h2>
          <p className="font-simonetta text-lg text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Des services adaptés à tous vos besoins
          </p>

          <div className="space-y-12">
            {services.map((service, index) => (
              <Card key={index} className="border-2 hover:border-[#ff3131] transition-colors overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative h-64 md:h-auto">
                    <Image
                      src={`/african-.jpg?height=400&width=600&query=african ${service.title.toLowerCase()}`}
                      alt={service.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-8">
                    <CardHeader className="p-0 mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-[#ff3131]/10 rounded-full flex items-center justify-center">
                          <service.icon className="w-6 h-6 text-[#ff3131]" />
                        </div>
                        <CardTitle className="font-charmonman text-3xl text-black">{service.title}</CardTitle>
                      </div>
                      <CardDescription className="font-simonetta text-base text-gray-600">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ul className="space-y-2 mb-6">
                        {service.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-center gap-2 font-simonetta text-gray-700">
                            <Heart className="w-4 h-4 text-[#ff3131] fill-[#ff3131]" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-[#f5f5f5]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-charmonman text-4xl md:text-5xl text-[#ff3131] mb-8">Pourquoi Nous Choisir ?</h2>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-transparent hover:border-[#ff3131] transition-colors">
              <h3 className="font-charmonman text-2xl text-black mb-3">Cuisine Authentique</h3>
              <p className="font-simonetta text-gray-600">
                Des recettes traditionnelles préparées avec des ingrédients de qualité pour une expérience gustative
                authentique.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-transparent hover:border-[#ff3131] transition-colors">
              <h3 className="font-charmonman text-2xl text-black mb-3">Service Personnalisé</h3>
              <p className="font-simonetta text-gray-600">
                Nous adaptons nos prestations à vos besoins spécifiques et aux contraintes de votre événement.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-transparent hover:border-[#ff3131] transition-colors">
              <h3 className="font-charmonman text-2xl text-black mb-3">Présentation Soignée</h3>
              <p className="font-simonetta text-gray-600">
                Une mise en valeur élégante de nos plats pour sublimer votre table et impressionner vos invités.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-transparent hover:border-[#ff3131] transition-colors">
              <h3 className="font-charmonman text-2xl text-black mb-3">Flexibilité</h3>
              <p className="font-simonetta text-gray-600">
                Options végétariennes, adaptation aux allergies, portions modulables selon le nombre d&apos;invités.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#ff3131] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-charmonman text-4xl md:text-5xl mb-6">Prêt à Organiser Votre Événement ?</h2>
          <p className="font-simonetta text-xl mb-8">Contactez-nous pour discuter de votre projet</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-[#ff3131] hover:bg-gray-100 font-simonetta text-lg h-14 px-8"
            >
              <Link href="/quote">Demander un devis</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-[#ff3131] font-simonetta text-lg h-14 px-8 bg-transparent"
            >
              <Link href="/contact">Nous contacter</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
