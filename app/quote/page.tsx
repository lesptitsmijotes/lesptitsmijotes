"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createBrowserClient } from "@supabase/ssr"
import { MessageCircle, Smartphone } from "lucide-react"

export default function QuotePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    serviceType: "",
    eventDate: "",
    numberOfGuests: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [lastQuote, setLastQuote] = useState<typeof formData | null>(null)
  const successRef = useRef<HTMLElement>(null)

  const serviceTypes = [
    { value: "Événement Privé (Anniversaire, Mariage, etc.)", label: "Événement Privé (Anniversaire, Mariage, etc.)" },
    { value: "Buffet Raffiné", label: "Buffet Raffiné" },
    { value: "Repas Familial", label: "Repas Familial" },
    { value: "Pauses Déjeuner Entreprise", label: "Pauses Déjeuner Entreprise" },
    { value: "Plateaux Repas", label: "Plateaux Repas" },
    { value: "Buffet d'Entreprise", label: "Buffet d'Entreprise" },
    { value: "Mariage", label: "Mariage" },
    { value: "Anniversaire", label: "Anniversaire" },
    { value: "Baptême / Communion", label: "Baptême / Communion" },
    { value: "Réception Privée", label: "Réception Privée" },
    { value: "Autre (précisez dans le message)", label: "Autre (précisez dans le message)" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    const { error: submitError } = await supabase.from("quote_requests").insert([
      {
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        service_type: formData.serviceType,
        event_date: formData.eventDate || null,
        number_of_guests: formData.numberOfGuests ? Number.parseInt(formData.numberOfGuests) : null,
        message: formData.message,
        status: "pending",
      },
    ])

    if (submitError) {
      console.error("Error submitting quote request:", submitError)
      setError("Une erreur est survenue. Veuillez réessayer.")
    } else {
      setLastQuote({ ...formData })
      setSuccess(true)
      setFormData({
        name: "",
        email: "",
        phone: "",
        serviceType: "",
        eventDate: "",
        numberOfGuests: "",
        message: "",
      })
    }

    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  // Scroll vers le message de succès quand la demande est validée
  useEffect(() => {
    if (success && successRef.current) {
      successRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [success])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#a6a6a6] to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-charmonman text-5xl md:text-6xl font-bold text-[#ff3131] mb-6 text-balance">
            Demander un Devis
          </h1>
          <p className="font-simonetta text-xl text-gray-700 text-pretty">
            Décrivez-nous votre projet et recevez une proposition personnalisée sous 24h
          </p>
        </div>
      </section>

      {/* Success Message */}
      {success && lastQuote && (
        <section ref={successRef} className="py-8 px-4 bg-gradient-to-b from-green-50 to-white">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-green-500 bg-gradient-to-br from-green-50 to-white shadow-xl">
              <CardContent className="pt-8 pb-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <span className="text-5xl text-white">✓</span>
                  </div>
                  <h3 className="font-charmonman text-4xl text-green-700 mb-3">Demande Enregistrée !</h3>
                  <p className="font-simonetta text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
                    Votre demande de devis a bien été prise en compte. Notre équipe vous contactera sous 24h. Pour
                    accélérer le traitement, envoyez-nous les détails via WhatsApp ou SMS
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                    <Button
                      onClick={() => {
                        const whatsappMessage = encodeURIComponent(
                          `Bonjour, je viens de faire une demande de devis sur Les P'tits Mijotés.\n\n` +
                            `Nom : ${lastQuote.name}\n` +
                            `Email : ${lastQuote.email}\n` +
                            `Téléphone : ${lastQuote.phone}\n` +
                            `Service : ${lastQuote.serviceType}\n` +
                            `Date événement : ${lastQuote.eventDate || "Non renseignée"}\n` +
                            `Nombre d'invités : ${lastQuote.numberOfGuests || "Non renseigné"}\n\n` +
                            `Message :\n${lastQuote.message}`,
                        )
                        window.open(`https://wa.me/33695601821?text=${whatsappMessage}`, "_blank")
                      }}
                      className="flex-1 bg-[#25D366] hover:bg-[#20BA5A] text-white font-simonetta text-base h-12 gap-2 shadow-md"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Envoyer via WhatsApp
                    </Button>

                    <Button
                      onClick={() => {
                        const smsMessage = encodeURIComponent(
                          `Bonjour, demande de devis Les P'tits Mijotés. ` +
                            `Nom : ${lastQuote.name}. ` +
                            `Tél : ${lastQuote.phone}. ` +
                            `Service : ${lastQuote.serviceType}. ` +
                            `Date : ${lastQuote.eventDate || "Non renseignée"}. ` +
                            `Invités : ${lastQuote.numberOfGuests || "Non renseigné"}`,
                        )
                        window.open(`sms:0695601821?body=${smsMessage}`, "_self")
                      }}
                      variant="outline"
                      className="flex-1 border-2 border-[#ff3131] text-[#ff3131] hover:bg-[#ff3131] hover:text-white font-simonetta text-base h-12 gap-2 shadow-md"
                    >
                      <Smartphone className="w-5 h-5" />
                      Envoyer par SMS
                    </Button>
                  </div>

                  <p className="font-simonetta text-sm text-gray-500 mt-6">
                    💡 Cliquez sur l&apos;un des boutons pour ouvrir votre application de messagerie
                  </p>

                  <Button
                    onClick={() => setSuccess(false)}
                    variant="ghost"
                    className="mt-4 text-gray-600 hover:text-gray-900 font-simonetta"
                  >
                    Faire une nouvelle demande
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Main Content */}
      {!success && (
        <section className="py-20 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="font-charmonman text-3xl text-[#ff3131]">Formulaire de Devis</CardTitle>
                <CardDescription className="font-simonetta text-base">
                  Remplissez ce formulaire avec le maximum d&apos;informations pour que nous puissions vous proposer
                  une offre adaptée à vos besoins.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Personal Information */}
                  <div className="space-y-6">
                    <h3 className="font-charmonman text-2xl text-black">Vos Coordonnées</h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="font-simonetta">
                          Nom complet *
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="font-simonetta"
                          placeholder="Votre nom"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="font-simonetta">
                          Email *
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="font-simonetta"
                          placeholder="votre@email.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="font-simonetta">
                        Téléphone *
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="font-simonetta"
                        placeholder="+33 6 12 34 56 78"
                      />
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-6">
                    <h3 className="font-charmonman text-2xl text-black">Détails de Votre Projet</h3>

                    <div className="space-y-2">
                      <Label className="font-simonetta">Type de service *</Label>
                      <RadioGroup
                        value={formData.serviceType}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, serviceType: value }))}
                        required
                        className="space-y-3"
                      >
                        {serviceTypes.map((service) => (
                          <div key={service.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={service.value} id={service.value} />
                            <Label htmlFor={service.value} className="font-simonetta cursor-pointer font-normal">
                              {service.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="eventDate" className="font-simonetta">
                          Date de l&apos;événement
                        </Label>
                        <Input
                          id="eventDate"
                          name="eventDate"
                          type="date"
                          value={formData.eventDate}
                          onChange={handleChange}
                          className="font-simonetta"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="numberOfGuests" className="font-simonetta">
                          Nombre d&apos;invités (environ)
                        </Label>
                        <Input
                          id="numberOfGuests"
                          name="numberOfGuests"
                          type="number"
                          min="1"
                          value={formData.numberOfGuests}
                          onChange={handleChange}
                          className="font-simonetta"
                          placeholder="Ex: 50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="font-simonetta">
                        Détails supplémentaires *
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="font-simonetta"
                        placeholder="Décrivez votre projet : type de plats souhaités, contraintes alimentaires, budget approximatif, services additionnels souhaités (animations, service sur place, etc.)"
                      />
                    </div>
                  </div>

                  {error && <p className="text-red-600 font-simonetta text-sm">{error}</p>}

                  <div className="bg-[#f5f5f5] p-6 rounded-lg">
                    <h4 className="font-charmonman text-xl text-black mb-2">À quoi s&apos;attendre ensuite ?</h4>
                    <ul className="space-y-2 font-simonetta text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-[#ff3131]">1.</span>
                        Nous recevons votre demande et l&apos;étudions attentivement
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#ff3131]">2.</span>
                        Notre équipe vous contacte sous 24h pour préciser vos besoins
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#ff3131]">3.</span>
                        Vous recevez un devis détaillé et personnalisé
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#ff3131]">4.</span>
                        Nous planifions ensemble votre événement parfait
                      </li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#ff3131] hover:bg-[#ff3131]/90 text-white font-simonetta text-lg h-14"
                  >
                    {loading ? "Envoi en cours..." : "Envoyer ma demande de devis"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Info Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-white to-[#f5f5f5]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-charmonman text-3xl text-[#ff3131] mb-8">Besoin d&apos;Aide ?</h2>
          <p className="font-simonetta text-lg text-gray-700 mb-8">
            Notre équipe est disponible pour répondre à toutes vos questions et vous accompagner dans votre projet.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-[#ff3131] text-[#ff3131] hover:bg-[#ff3131] hover:text-white font-simonetta text-lg bg-transparent"
            >
              <a href="/contact">Nous contacter</a>
            </Button>
            <Button asChild size="lg" className="bg-[#ff3131] hover:bg-[#ff3131]/90 text-white font-simonetta text-lg">
              <a href="https://wa.me/33695601821" target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
