"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Testimonial {
  id: string
  author_name: string
  content: string
  rating: number
}

export function TestimonialsSlider() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [current, setCurrent] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    async function fetchTestimonials() {
      const { data, error } = await supabase
        .from("testimonials")
        .select("id, author_name, content, rating")
        .eq("is_visible", true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false })

      if (!error && data && data.length > 0) {
        setTestimonials(data)
      }
    }

    fetchTestimonials()
  }, [])

  useEffect(() => {
    if (testimonials.length === 0) return

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [testimonials.length])

  const next = () => {
    setCurrent((current + 1) % testimonials.length)
  }

  const prev = () => {
    setCurrent((current - 1 + testimonials.length) % testimonials.length)
  }

  if (testimonials.length === 0) {
    return null
  }

  return (
    <div className="relative max-w-3xl mx-auto">
      <Card className="border-2">
        <CardContent className="pt-12 pb-12 px-8 text-center">
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(testimonials[current].rating)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-[#ff3131] text-[#ff3131]" />
            ))}
          </div>
          <p className="font-simonetta text-lg text-gray-700 mb-6 italic">&quot;{testimonials[current].content}&quot;</p>
          <p className="font-charmonman text-xl text-[#ff3131]">— {testimonials[current].author_name}</p>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-4 mt-6">
        <Button
          variant="outline"
          size="icon"
          onClick={prev}
          className="rounded-full border-2 border-gray-300 hover:border-[#ff3131] bg-transparent"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === current ? "bg-[#ff3131] w-8" : "bg-gray-300"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={next}
          className="rounded-full border-2 border-gray-300 hover:border-[#ff3131] bg-transparent"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
