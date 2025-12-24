"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"

export default function AdminSetupPage() {
  const [email, setEmail] = useState("admin@lesptitsmijotes.com")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      // Create user in Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      })

      if (signUpError) throw signUpError

      if (!signUpData.user) {
        throw new Error("Erreur lors de la création de l'utilisateur")
      }

      // Make the user an admin
      const { error: adminError } = await supabase.rpc("make_user_admin", {
        user_email: email,
      })

      if (adminError) throw adminError

      setSuccess(true)
      setEmail("")
      setPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      console.error("[v0] Admin creation error:", err)
      setError(err.message || "Erreur lors de la création du compte administrateur")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Configuration initiale</CardTitle>
          <CardDescription>Créez votre premier compte administrateur pour Les P'tits Mijotés</CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <Alert className="mb-4 bg-green-50 text-green-900 border-green-200">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Compte administrateur créé avec succès ! Vérifiez votre email pour confirmer votre compte, puis
                connectez-vous à{" "}
                <a href="/admin/login" className="font-medium underline">
                  /admin/login
                </a>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-4 bg-red-50 text-red-900 border-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email administrateur
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@lesptitsmijotes.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Mot de passe
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Minimum 6 caractères"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirmer le mot de passe
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Retapez votre mot de passe"
              />
            </div>

            <Button type="submit" className="w-full bg-[#ff3131]" disabled={loading}>
              {loading ? "Création en cours..." : "Créer le compte administrateur"}
            </Button>
          </form>

          <div className="mt-4 text-sm text-gray-600">
            <p className="font-medium mb-1">Note importante :</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Cette page ne devrait être utilisée qu'une seule fois</li>
              <li>Vérifiez votre email pour confirmer votre compte</li>
              <li>Conservez vos identifiants en lieu sûr</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
