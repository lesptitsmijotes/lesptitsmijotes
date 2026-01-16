"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function AdminLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from("admin_credentials")
        .select("*")
        .eq("username", username)
        .eq("password", password)
        .eq("is_active", true)
        .single()

      if (error || !data) {
        toast.error("Identifiants incorrects")
        setLoading(false)
        return
      }

      await supabase
        .from("admin_credentials")
        .update({ last_login: new Date().toISOString() })
        .eq("id", data.id)

      localStorage.setItem("admin_session", JSON.stringify({
        id: data.id,
        username: data.username,
        email: data.email
      }))

      toast.success("Connexion réussie")
      router.push("/admin")
    } catch (error) {
      toast.error("Erreur de connexion")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-white px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src="/images/logo-web.svg"
              alt="Les P'tits Mijotés - Cuisine et Traiteur Africain"
              style={{ height: "80px", width: "auto" }}
            />
          </div>
          <CardTitle className="text-2xl font-charmonman">Administration</CardTitle>
          <CardDescription>Connectez-vous pour accéder au panneau d&apos;administration</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="username">Nom d&apos;utilisateur</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full bg-[#ff3131] hover:bg-[#ff3131]/90" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
