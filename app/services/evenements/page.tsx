"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Event {
  id: number
  title: string
  description: string
  image_urls: string[]
  event_date: string
  location: string
  is_visible: boolean
}

export default function EvenementsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_visible", true)
        .gte("event_date", new Date().toISOString().split("T")[0])
        .order("event_date", { ascending: true })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error("Erreur lors du chargement des événements:", error)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="font-charmonman text-4xl md:text-5xl font-bold text-[#ff3131] mb-4">
            Nos Événements
          </h1>
          <p className="font-simonetta text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez nos événements à venir et rejoignez-nous pour des moments
            inoubliables
          </p>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-simonetta text-xl text-gray-500">
              Aucun événement en cours pour le moment.
            </p>
            <p className="font-simonetta text-gray-400 mt-2">
              Revenez bientôt pour découvrir nos prochains événements !
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <Link key={event.id} href={`/evenements/${event.id}`}>
                <Card className="group cursor-pointer overflow-hidden hover:shadow-2xl transition-all duration-300 h-full border-2 hover:border-[#ff3131]">
                  <div className="relative h-64 overflow-hidden">
                    {event.image_urls && event.image_urls.length > 0 ? (
                      <Image
                        src={event.image_urls[0]}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                        <Calendar className="w-24 h-24 text-white opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-[#ff3131] text-white font-simonetta">
                        À venir
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h2 className="font-charmonman text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#ff3131] transition-colors">
                      {event.title}
                    </h2>
                    <div className="flex items-center text-gray-600 mb-4">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="font-simonetta text-sm">{formatDate(event.event_date)}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center text-gray-600 mb-4">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="font-simonetta text-sm">{event.location}</span>
                      </div>
                    )}
                    <div
                      className="font-simonetta text-gray-700 line-clamp-3"
                      dangerouslySetInnerHTML={{
                        __html: event.description.substring(0, 150) + "...",
                      }}
                    />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
