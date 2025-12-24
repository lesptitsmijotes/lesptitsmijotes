"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, MapPin, ArrowLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

interface Event {
  id: number
  title: string
  description: string
  image_urls: string[]
  event_date: string
  location: string
  is_visible: boolean
}

interface ParticipantForm {
  name: string
  phone: string
  email: string
  number_of_people: number
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState<ParticipantForm>({
    name: "",
    phone: "",
    email: "",
    number_of_people: 1,
  })

  useEffect(() => {
    if (params.id) {
      loadEvent()
    }
  }, [params.id])

  const loadEvent = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", params.id)
        .eq("is_visible", true)
        .single()

      if (error) throw error
      setEvent(data)
    } catch (error) {
      console.error("Erreur lors du chargement de l'événement:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger l'événement",
        variant: "destructive",
      })
      router.push("/evenements")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("event_participants").insert({
        event_id: params.id,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        number_of_people: formData.number_of_people,
      })

      if (error) throw error

      toast({
        title: "Inscription réussie !",
        description: "Votre participation a bien été enregistrée. À bientôt !",
      })

      setSuccess(true)
      setFormData({
        name: "",
        phone: "",
        email: "",
        number_of_people: 1,
      })
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre participation",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff3131]" />
      </div>
    )
  }

  if (!event) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#a6a6a6] to-white">
      <div className="container mx-auto px-4 py-12">
        <Link href="/evenements">
          <Button variant="ghost" className="mb-6 font-simonetta hover:text-[#ff3131]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux événements
          </Button>
        </Link>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-charmonman text-4xl md:text-6xl font-bold text-[#ff3131] mb-4">
              {event.title}
            </h1>
            <div className="flex items-center justify-center gap-6 text-gray-700">
              <div className="flex items-center font-simonetta">
                <Calendar className="w-5 h-5 mr-2" />
                <span className="text-lg">{formatDate(event.event_date)}</span>
              </div>
              {event.location && (
                <div className="flex items-center font-simonetta">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span className="text-lg">{event.location}</span>
                </div>
              )}
            </div>
          </div>

          {event.image_urls && event.image_urls.length > 0 && (
            <div className="mb-12">
              {event.image_urls.length === 1 ? (
                <div className="relative h-[500px] w-full rounded-lg overflow-hidden shadow-2xl">
                  <Image
                    src={event.image_urls[0]}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <Carousel
                  className="w-full"
                  plugins={[
                    Autoplay({
                      delay: 4000,
                    }),
                  ]}
                >
                  <CarouselContent>
                    {event.image_urls.map((url, index) => (
                      <CarouselItem key={index}>
                        <div className="relative h-[500px] w-full rounded-lg overflow-hidden shadow-2xl">
                          <Image
                            src={url}
                            alt={`${event.title} - Image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                </Carousel>
              )}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="font-charmonman text-3xl text-[#ff3131]">
                    À propos de l'événement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="font-simonetta text-gray-700 prose prose-lg max-w-none
                      prose-headings:font-charmonman prose-headings:text-[#ff3131]
                      prose-p:font-simonetta prose-p:text-gray-700
                      prose-strong:text-gray-900 prose-strong:font-semibold
                      prose-ul:font-simonetta prose-ol:font-simonetta
                      prose-li:text-gray-700
                      prose-a:text-[#ff3131] prose-a:no-underline hover:prose-a:underline"
                    dangerouslySetInnerHTML={{ __html: event.description }}
                  />
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="border-2 sticky top-8">
                <CardHeader>
                  <CardTitle className="font-charmonman text-3xl text-[#ff3131]">
                    {success ? "Inscription confirmée !" : "Je participe"}
                  </CardTitle>
                  <CardDescription className="font-simonetta text-base">
                    {success
                      ? "Nous avons bien reçu votre inscription. À très bientôt !"
                      : "Remplissez le formulaire pour confirmer votre participation"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {success ? (
                    <div className="py-8 text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <p className="font-simonetta text-gray-600 mb-6">
                        Votre participation a été enregistrée avec succès.
                      </p>
                      <Button
                        onClick={() => setSuccess(false)}
                        variant="outline"
                        className="font-simonetta"
                      >
                        Nouvelle inscription
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="font-simonetta">
                          Nom complet *
                        </Label>
                        <Input
                          id="name"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="Jean Dupont"
                          className="font-simonetta"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="font-simonetta">
                          Numéro de téléphone *
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          placeholder="+33 6 12 34 56 78"
                          className="font-simonetta"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="font-simonetta">
                          Email *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="jean.dupont@example.com"
                          className="font-simonetta"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="people" className="font-simonetta">
                          Nombre de personnes *
                        </Label>
                        <Input
                          id="people"
                          type="number"
                          min="1"
                          required
                          value={formData.number_of_people}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              number_of_people: parseInt(e.target.value) || 1,
                            })
                          }
                          className="font-simonetta"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-[#ff3131] hover:bg-[#ff3131]/90 font-simonetta text-lg h-12"
                        disabled={submitting}
                      >
                        {submitting ? "Inscription en cours..." : "Confirmer ma participation"}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

