"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, MapPin, Phone, MessageCircle } from "lucide-react"

const initialFormData = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
}

export default function ContactPage() {
  const [formData, setFormData] = useState(initialFormData)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          subject: formData.subject.trim() || null,
          message: formData.message.trim(),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error("[contact] Error submitting contact form:", result)
        setError(result.error || "Une erreur est survenue. Veuillez réessayer.")
        return
      }

      setSuccess(true)
      setFormData(initialFormData)
    } catch (submitError) {
      console.error("[contact] Error submitting contact form:", submitError)
      setError("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#a6a6a6] to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-charmonman text-5xl md:text-6xl font-bold text-[#ff3131] mb-6 text-balance">
            Contactez-Nous
          </h1>
          <p className="font-simonetta text-xl text-gray-700 text-pretty">
            Une question ? Un projet ? Nous sommes à votre écoute
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="font-charmonman text-3xl text-[#ff3131]">Envoyez-nous un message</CardTitle>
                  <CardDescription className="font-simonetta text-base">
                    Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
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

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="font-simonetta">
                        Téléphone
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className="font-simonetta"
                        placeholder="+33 1 23 45 67 89"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="font-simonetta">
                        Sujet
                      </Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="font-simonetta"
                        placeholder="Objet de votre message"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="font-simonetta">
                        Message *
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="font-simonetta"
                        placeholder="Décrivez votre demande..."
                      />
                    </div>

                    {error && <p className="text-red-600 font-simonetta text-sm">{error}</p>}

                    {success && (
                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                        <p className="text-green-800 font-simonetta">
                          Merci pour votre message ! Nous vous contacterons bientôt.
                        </p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#ff3131] hover:bg-[#ff3131]/90 text-white font-simonetta text-lg h-12"
                    >
                      {loading ? "Envoi en cours..." : "Envoyer le message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="font-charmonman text-3xl text-[#ff3131] mb-6">Nos Coordonnées</h2>
                <div className="space-y-6">
                  <Card className="border-2 hover:border-[#ff3131] transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[#ff3131]/10 rounded-full flex items-center justify-center shrink-0">
                          <Phone className="w-6 h-6 text-[#ff3131]" />
                        </div>
                        <div>
                          <h3 className="font-charmonman text-xl text-black mb-1">Téléphone</h3>
                          <a
                            href="tel:+33695601821"
                            className="font-simonetta text-gray-600 hover:text-[#ff3131] transition-colors"
                          >
                            +33 6 95 60 18 21
                          </a>
                          <p className="font-simonetta text-sm text-gray-500 mt-1">Lundi - Samedi : 9h - 19h</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 hover:border-[#ff3131] transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[#ff3131]/10 rounded-full flex items-center justify-center shrink-0">
                          <Mail className="w-6 h-6 text-[#ff3131]" />
                        </div>
                        <div>
                          <h3 className="font-charmonman text-xl text-black mb-1">Email</h3>
                          <a
                            href="mailto:contact@lesptitsmijotes.fr"
                            className="font-simonetta text-gray-600 hover:text-[#ff3131] transition-colors"
                          >
                            contact@lesptitsmijotes.fr
                          </a>
                          <p className="font-simonetta text-sm text-gray-500 mt-1">Réponse sous 24h</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 hover:border-[#ff3131] transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[#ff3131]/10 rounded-full flex items-center justify-center shrink-0">
                          <MapPin className="w-6 h-6 text-[#ff3131]" />
                        </div>
                        <div>
                          <h3 className="font-charmonman text-xl text-black mb-1">Adresse</h3>
                          <p className="font-simonetta text-gray-600">Clermont-Ferrand, France</p>
                          <p className="font-simonetta text-sm text-gray-500 mt-1">Zone de livraison : Auvergne</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 bg-[#ff3131] text-white hover:bg-[#ff3131]/90 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                          <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-charmonman text-xl mb-1">WhatsApp</h3>
                          <p className="font-simonetta text-sm mb-3">Contactez-nous directement sur WhatsApp</p>
                          <Button
                            asChild
                            variant="outline"
                            className="border-2 border-white text-white hover:bg-white hover:text-[#ff3131] font-simonetta bg-transparent"
                          >
                            <a
                              href="https://wa.me/33123456789"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2"
                            >
                              <MessageCircle className="w-4 h-4" />
                              Ouvrir WhatsApp
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#f5f5f5] to-white p-8 rounded-lg border-2">
                <h3 className="font-charmonman text-2xl text-[#ff3131] mb-4">Horaires d&apos;Ouverture</h3>
                <div className="space-y-2 font-simonetta text-gray-700">
                  <div className="flex justify-between">
                    <span>Lundi - Vendredi</span>
                    <span className="font-semibold">9h00 - 19h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Samedi</span>
                    <span className="font-semibold">10h00 - 18h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dimanche</span>
                    <span className="font-semibold">Fermé</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
