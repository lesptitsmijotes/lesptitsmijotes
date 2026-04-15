import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Briefcase, Clock, Coffee, TrendingUp } from "lucide-react"

export default function ProfessionnelsPage() {
  const services = [
    {
      icon: Coffee,
      title: "Déjeuners d'entreprise",
      image: "/Plateau dejeuner.JPG",
      description:
        "Offrez à vos équipes des pauses gourmandes, pratiques et de qualité au quotidien.",
      features: [
        "Plateaux repas individuels",
        "Formules déjeuner complètes",
        "Livraison ponctuelle",
        "Commandes régulières possibles",
        "Menus variés et équilibrés",
      ],
    },
    {
      icon: Briefcase,
      title: "Reunions et seminaires",
      image: "/Pause dejeuner.jpeg",
      description:
        "Simplifiez l'organisation de vos journées de travail avec une offre adaptée à vos temps forts.",
      features: [
        "Plateaux repas pratiques et élégants",
        "Pauses café (boissons, snacks, douceurs)",
        "Buffets froids ou chauds",
        "Service simple et rapide",
        "Adapté aux groupes et formats longs",
      ],
    },
    {
      icon: TrendingUp,
      title: "Événements professionnels",
      image: "/Buffet d'entreprises.JPG",
      description:
        "Marquez les esprits avec une prestation conviviale et raffinée.",
      features: [
        "Buffets sur-mesure",
        "Cocktails apéritifs",
        "Animation culinaire",
        "Mise en place et décoration",
        "Service professionnel",
      ],
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-[#a6a6a6] to-white px-4 py-20">
        <div className="absolute inset-0 bg-[url('/professional-business-lunch-buffet.jpg')] opacity-20 bg-cover bg-center" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="font-charmonman text-5xl md:text-6xl font-bold text-[#ff3131] mb-6 text-balance">
            Services Professionnels
          </h1>
          <p className="font-simonetta text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto text-pretty">
            Des solutions traiteur adaptées aux besoins de votre entreprise
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
          <h2 className="font-charmonman text-4xl md:text-5xl text-center text-[#ff3131] mb-4">
            Nos solutions corporate
          </h2>
          <p className="font-simonetta text-lg text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Des prestations professionnelles pour toutes vos occasions
          </p>

          <div className="space-y-12">
            {services.map((service, index) => (
              <Card key={index} className="border-2 hover:border-[#ff3131] transition-colors overflow-hidden">
                <div className={`grid md:grid-cols-2 gap-0 ${index % 2 === 1 ? "md:*:order-2" : ""}`}>
                  <div className="relative h-64 md:h-auto">
                    <Image
                      src={service.image}
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
                            <Clock className="w-4 h-4 text-[#ff3131]" />
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

      {/* Benefits */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-[#f5f5f5]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-charmonman text-4xl md:text-5xl text-center text-[#ff3131] mb-12">
            Les avantages pour votre entreprise
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 text-center">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-[#ff3131]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🍽️</span>
                </div>
                <h3 className="font-charmonman text-2xl mb-3 text-black">Expérience culinaire unique</h3>
                <p className="font-simonetta text-gray-600">
                  Une cuisine originale qui marquera positivement vos invités.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 text-center">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-[#ff3131]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="font-charmonman text-2xl mb-3 text-black">Qualité constante</h3>
                <p className="font-simonetta text-gray-600">
                  Des standards élevés pour chaque prestation, sans compromis.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 text-center">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-[#ff3131]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔑</span>
                </div>
                <h3 className="font-charmonman text-2xl mb-3 text-black">Service clé en mains</h3>
                <p className="font-simonetta text-gray-600">
                  Concentrez-vous sur votre activité, nous nous occupons de la restauration.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 bg-white p-8 md:p-12 rounded-lg shadow-sm border-2">
            <h3 className="font-charmonman text-3xl text-[#ff3131] mb-6 text-center">Tarifs entreprise</h3>
            <p className="font-simonetta text-lg text-gray-700 text-center mb-8">
              Bénéficiez de tarifs préférentiels pour les commandes régulières et les volumes importants. Contactez-nous
              pour établir un partenariat sur-mesure.
            </p>
            <div className="flex justify-center">
              <Button
                asChild
                size="lg"
                className="bg-[#ff3131] hover:bg-[#ff3131]/90 text-white font-simonetta text-lg"
              >
                <Link href="/quote">Demander une offre personnalisée</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#ff3131] text-white py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-charmonman text-3xl md:text-4xl mb-3">Développez votre partenariat</h2>
          <p className="font-simonetta text-base mb-5">
            Discutons de vos besoins et créons une solution adaptée à votre entreprise
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-[#ff3131] hover:bg-gray-100 font-simonetta text-lg h-14 px-8"
            >
              <Link href="/contact">Nous contacter</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-[#ff3131] font-simonetta text-lg h-14 px-8 bg-transparent"
            >
              <Link href="/galerie">Voir nos réalisations</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
