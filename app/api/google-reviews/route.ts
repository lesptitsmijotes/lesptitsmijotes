import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { placeId } = await request.json()
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!placeId) {
      return NextResponse.json({ error: "Place ID requis" }, { status: 400 })
    }

    if (!apiKey) {
      return NextResponse.json({ error: "API Key non configurée sur le serveur" }, { status: 500 })
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating&key=${apiKey}`
    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== "OK") {
      return NextResponse.json({ error: `Google API error: ${data.status}` }, { status: 400 })
    }

    const reviews = data.result?.reviews || []
    const supabase = await createClient()

    let imported = 0
    let updated = 0

    for (const review of reviews) {
      const { data: existing } = await supabase
        .from("testimonials")
        .select("id")
        .eq("google_review_id", review.time.toString())
        .single()

      const testimonialData = {
        author_name: review.author_name,
        author_image: review.profile_photo_url || null,
        content: review.text,
        rating: review.rating,
        google_review_id: review.time.toString(),
        is_visible: false,
        display_order: 0,
      }

      if (existing) {
        await supabase.from("testimonials").update(testimonialData).eq("id", existing.id)
        updated++
      } else {
        await supabase.from("testimonials").insert([testimonialData])
        imported++
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      updated,
      total: reviews.length,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
