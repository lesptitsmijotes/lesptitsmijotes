"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { UserPlus, Trash2, Edit2, X, Check } from "lucide-react"
import { toast } from "sonner"

interface AdminUser {
  id: string
  username: string
  email: string
  password: string
  is_active: boolean
  created_at: string
  last_login: string | null
}

export function UsersManagement() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  })
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from("admin_credentials")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Erreur lors du chargement des utilisateurs")
    } finally {
      setLoading(false)
    }
  }

  async function handleAddUser() {
    if (!formData.username || !formData.email || !formData.password) {
      toast.error("Tous les champs sont requis")
      return
    }

    try {
      const { error } = await supabase
        .from("admin_credentials")
        .insert({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          is_active: true
        })

      if (error) throw error

      toast.success("Utilisateur ajouté")
      setFormData({ username: "", email: "", password: "" })
      setShowAddForm(false)
      await fetchUsers()
    } catch (error) {
      console.error("Error adding user:", error)
      toast.error("Erreur lors de l'ajout")
    }
  }

  async function handleUpdatePassword(id: string, newPassword: string) {
    if (!newPassword) {
      toast.error("Le mot de passe ne peut pas être vide")
      return
    }

    try {
      const { error } = await supabase
        .from("admin_credentials")
        .update({ password: newPassword })
        .eq("id", id)

      if (error) throw error

      toast.success("Mot de passe mis à jour")
      setEditingId(null)
      await fetchUsers()
    } catch (error) {
      console.error("Error updating password:", error)
      toast.error("Erreur lors de la mise à jour")
    }
  }

  async function handleDeleteUser(id: string, username: string) {
    if (username === "admin") {
      toast.error("Impossible de supprimer l'admin par défaut")
      return
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${username} ?`)) return

    try {
      const { error } = await supabase
        .from("admin_credentials")
        .delete()
        .eq("id", id)

      if (error) throw error

      toast.success("Utilisateur supprimé")
      await fetchUsers()
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Erreur lors de la suppression")
    }
  }

  async function toggleUserStatus(id: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from("admin_credentials")
        .update({ is_active: !currentStatus })
        .eq("id", id)

      if (error) throw error

      toast.success(currentStatus ? "Utilisateur désactivé" : "Utilisateur activé")
      await fetchUsers()
    } catch (error) {
      console.error("Error toggling status:", error)
      toast.error("Erreur lors du changement de statut")
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Utilisateurs</h2>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? <X className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
          {showAddForm ? "Annuler" : "Ajouter un utilisateur"}
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-username">Nom d&apos;utilisateur</Label>
                <Input
                  id="new-username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="johndoe"
                />
              </div>
              <div>
                <Label htmlFor="new-email">Email</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="johndoe@example.com"
                />
              </div>
              <div>
                <Label htmlFor="new-password">Mot de passe</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <Button onClick={handleAddUser} className="w-full">
                <Check className="w-4 h-4 mr-2" />
                Créer l&apos;utilisateur
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{user.username}</h3>
                    {user.username === "admin" && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                        Admin par défaut
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded ${user.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                      {user.is_active ? "Actif" : "Inactif"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  {user.last_login && (
                    <p className="text-xs text-gray-500">
                      Dernière connexion: {new Date(user.last_login).toLocaleString("fr-FR")}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {editingId === user.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="password"
                        placeholder="Nouveau mot de passe"
                        className="w-48"
                        id={`password-${user.id}`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const input = e.target as HTMLInputElement
                            handleUpdatePassword(user.id, input.value)
                          }
                        }}
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => {
                          const input = document.getElementById(`password-${user.id}`) as HTMLInputElement
                          handleUpdatePassword(user.id, input.value)
                        }}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setEditingId(user.id)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => toggleUserStatus(user.id, user.is_active)}
                      >
                        {user.is_active ? "🔓" : "🔒"}
                      </Button>
                      {user.username !== "admin" && (
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => handleDeleteUser(user.id, user.username)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
