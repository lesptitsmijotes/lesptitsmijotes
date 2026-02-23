"use client"

import type React from "react"
import { useState } from "react"
import { Phone, CheckCircle, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function BientotPage() {
  const [phone, setPhone] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 10)
    return digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value))
    setErrorMsg("")
  }

  const isValid = (p: string) => /^0[1-9](\d{2}){4}$/.test(p.replace(/\s/g, ""))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")

    if (!isValid(phone)) {
      setErrorMsg("Numéro français invalide — ex : 06 12 34 56 78")
      return
    }

    setStatus("loading")

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.replace(/\s/g, "") }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erreur inattendue")
      }

      setStatus("success")
    } catch (err) {
      setStatus("error")
      setErrorMsg(err instanceof Error ? err.message : "Erreur inattendue")
    }
  }

  return (
    <main className="min-h-[calc(100vh-96px)] bg-[#f5efe8] flex flex-col items-center justify-center px-4 py-16">
      {/* Logo */}
      <div className="mb-8">
        <img
          src="/images/logo-web.svg"
          alt="Les P'tits Mijotés - Cuisine et Traiteur Africain"
          className="h-36 w-auto mx-auto drop-shadow-md"
        />
      </div>

      {/* Card principale */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[#ff3131]/10 text-[#ff3131] text-sm font-simonetta px-4 py-1.5 rounded-full mb-6">
          <Sparkles className="h-4 w-4" />
          Lancement imminent
        </div>

        {/* Titre */}
        <h1 className="font-charmonman text-4xl md:text-5xl text-gray-900 font-bold leading-tight mb-4">
          On mijote<br />
          <span className="text-[#ff3131]">quelque chose</span>
        </h1>

        {/* Description */}
        <p className="font-simonetta text-base text-gray-600 mb-8 leading-relaxed">
          Notre site est en cours de finalisation. Laissez votre numéro pour être parmi les premiers
          à découvrir nos offres avec un{" "}
          <span className="text-[#ff3131] font-bold">bon de réduction exclusif</span>.
        </p>

        {/* Succès */}
        {status === "success" ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle className="text-green-500 w-10 h-10" />
            </div>
            <p className="font-charmonman text-2xl text-gray-900 font-bold">Parfait, merci !</p>
            <p className="font-simonetta text-gray-600 text-sm leading-relaxed">
              Vous serez contacté dès l'ouverture et recevrez votre bon de réduction.
            </p>
          </div>
        ) : (
          /* Formulaire */
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-[#ff3131]/60" />
              </div>
              <Input
                type="tel"
                inputMode="numeric"
                placeholder="06 12 34 56 78"
                value={phone}
                onChange={handleChange}
                className="pl-12 h-14 text-lg font-simonetta rounded-xl border-2 border-gray-100 focus-visible:border-[#ff3131] focus-visible:ring-0"
                disabled={status === "loading"}
              />
            </div>

            {errorMsg && (
              <p className="text-sm text-red-500 font-simonetta text-left px-1">{errorMsg}</p>
            )}

            <Button
              type="submit"
              disabled={status === "loading" || phone.replace(/\s/g, "").length < 10}
              className="h-14 bg-[#ff3131] hover:bg-[#ff3131]/90 text-white font-simonetta text-base rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Prévenez-moi à l'ouverture !"
              )}
            </Button>

            <p className="text-xs text-gray-400 font-simonetta mt-1">
              Numéros français uniquement · Aucun démarchage · Désabonnement sur simple demande
            </p>
          </form>
        )}
      </div>

      {/* Footer minimal */}
      <p className="mt-8 font-simonetta text-gray-400 text-sm text-center">
        © {new Date().getFullYear()} Les P'tits Mijotés · Cuisine et Traiteur Africain
      </p>
    </main>
  )
}
