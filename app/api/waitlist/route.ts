import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const phone = body?.phone as string | undefined

  // Validation : numéro français uniquement (0X XX XX XX XX)
  if (!phone || !/^0[1-9](\d{2}){4}$/.test(phone)) {
    return NextResponse.json({ error: "Numéro de téléphone invalide" }, { status: 400 })
  }

  const supabase = await createClient()

  const { error } = await supabase.from("waitlist_phones").insert([{ phone }])

  if (error) {
    // Numéro déjà enregistré (contrainte unique)
    if (error.code === "23505") {
      return NextResponse.json({ error: "Ce numéro est déjà enregistré" }, { status: 409 })
    }
    return NextResponse.json({ error: "Erreur lors de l'enregistrement" }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
