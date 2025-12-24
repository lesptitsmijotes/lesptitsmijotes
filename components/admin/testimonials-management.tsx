"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { Star, Eye, EyeOff, RefreshCw, Plus, Edit, Trash2, Save, X, Tag } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"

interface Testimonial {
  id: string
  author_name: string
  author_image: string | null
  content: string
  rating: number
  google_review_id: string | null
  is_visible: boolean
  display_order: number
  created_at: string
}

export function TestimonialsManagement() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [showGoogleConfig, setShowGoogleConfig] = useState(false)
  const [googlePlaceId, setGooglePlaceId] = useState("")
  const [formData, setFormData] = useState<Partial<Testimonial>>({
    author_name: "",
    author_image: null,
    content: "",
    rating: 5,
    is_visible: false,
    display_order: 0,
  })

  const supabase = createClient()

  useEffect(() => {
    loadTestimonials()
    loadGoogleConfig()
  }, [])

  const loadGoogleConfig = async () => {
    try {
      const { data: placeIdData } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "google_place_id")
        .single()

      if (placeIdData?.value) setGooglePlaceId(placeIdData.value)
    } catch (error) {
    }
  }

  const loadTestimonials = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false })

      if (error) throw error
      setTestimonials(data || [])
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les avis",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSyncGoogleReviews = async () => {
    if (!googlePlaceId) {
      setShowGoogleConfig(true)
      toast({
        title: "Configuration requise",
        description: "Veuillez configurer votre Place ID Google",
      })
      return
    }

    setIsSyncing(true)
    try {
      const response = await fetch("/api/google-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId: googlePlaceId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      toast({
        title: "Succès",
        description: `${data.imported} avis importés, ${data.updated} mis à jour`,
      })
      loadTestimonials()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de synchroniser les avis Google",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleSaveGoogleConfig = async () => {
    try {
      await supabase
        .from("app_settings")
        .upsert({ key: "google_place_id", value: googlePlaceId, updated_at: new Date().toISOString() })

      setShowGoogleConfig(false)
      toast({
        title: "Succès",
        description: "Configuration Google enregistrée",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive",
      })
    }
  }

  const handleSave = async () => {
    if (!formData.author_name || !formData.content) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      })
      return
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from("testimonials")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId)

        if (error) throw error
        toast({
          title: "Succès",
          description: "Avis mis à jour avec succès",
        })
      } else {
        const { error } = await supabase.from("testimonials").insert([formData])

        if (error) throw error
        toast({
          title: "Succès",
          description: "Avis ajouté avec succès",
        })
      }

      setEditingId(null)
      setIsAdding(false)
      setFormData({
        author_name: "",
        author_image: null,
        content: "",
        rating: 5,
        is_visible: false,
        display_order: 0,
      })
      loadTestimonials()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'avis",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet avis ?")) return

    try {
      const { error } = await supabase.from("testimonials").delete().eq("id", id)

      if (error) throw error
      toast({
        title: "Succès",
        description: "Avis supprimé avec succès",
      })
      loadTestimonials()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'avis",
        variant: "destructive",
      })
    }
  }

  const toggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase.from("testimonials").update({ is_visible: !currentVisibility }).eq("id", id)

      if (error) throw error
      toast({
        title: "Succès",
        description: `Avis ${!currentVisibility ? "affiché" : "masqué"} avec succès`,
      })
      loadTestimonials()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la visibilité",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (testimonial: Testimonial) => {
    setEditingId(testimonial.id)
    setFormData(testimonial)
    setIsAdding(false)
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsAdding(false)
    setFormData({
      author_name: "",
      author_image: null,
      content: "",
      rating: 5,
      is_visible: false,
      display_order: 0,
    })
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  const visibleCount = testimonials.filter((t) => t.is_visible).length

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      {/* Configuration Google */}
      {showGoogleConfig && (
        <Card className="p-6 space-y-4 border-2 border-blue-500">
          <h3 className="text-lg font-semibold">Configuration Google Reviews</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="place-id">Google Place ID</Label>
              <Input
                id="place-id"
                value={googlePlaceId}
                onChange={(e) => setGooglePlaceId(e.target.value)}
                placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveGoogleConfig} className="gap-2 bg-[#ff3131] hover:bg-[#cc2727]">
                <Save className="h-4 w-4" />
                Enregistrer
              </Button>
              <Button onClick={() => setShowGoogleConfig(false)} variant="outline" className="gap-2 bg-transparent">
                <X className="h-4 w-4" />
                Annuler
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleSyncGoogleReviews}
          disabled={isSyncing}
          variant="outline"
          className="gap-2 bg-transparent"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Synchronisation..." : "Synchroniser Google"}
        </Button>

        {!showGoogleConfig && googlePlaceId && (
          <Button
            onClick={() => setShowGoogleConfig(true)}
            variant="outline"
            className="gap-2 bg-transparent"
          >
            Modifier la config
          </Button>
        )}

        {!isAdding && !editingId && (
          <Button onClick={() => setIsAdding(true)} className="gap-2 bg-[#ff3131] hover:bg-[#cc2727]">
            <Plus className="h-4 w-4" />
            Ajouter manuellement
          </Button>
        )}

        <div className="ml-auto text-sm text-gray-600 flex items-center gap-2">
          <span className="font-medium">{visibleCount}</span> avis visibles sur
          <span className="font-medium">{testimonials.length}</span> total
        </div>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <Card className="p-6 space-y-4 border-2 border-[#ff3131]">
          <h3 className="text-lg font-semibold">{editingId ? "Modifier l'avis" : "Nouvel avis"}</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="author">Nom de l'auteur *</Label>
              <Input
                id="author"
                value={formData.author_name}
                onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                placeholder="Jean Dupont"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">Note *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: Number.parseInt(e.target.value) })}
                  className="w-20"
                />
                {renderStars(formData.rating || 5)}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="content">Contenu de l'avis *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Excellent service, nourriture délicieuse..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author-image">URL de la photo (optionnel)</Label>
              <Input
                id="author-image"
                value={formData.author_image || ""}
                onChange={(e) => setFormData({ ...formData, author_image: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display-order">Ordre d'affichage</Label>
              <Input
                id="display-order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: Number.parseInt(e.target.value) })}
                placeholder="0"
              />
            </div>

            <div className="flex items-center space-x-2 md:col-span-2">
              <Switch
                id="visible"
                checked={formData.is_visible}
                onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
              />
              <Label htmlFor="visible" className="cursor-pointer">
                Afficher sur le site
              </Label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="gap-2 bg-[#ff3131] hover:bg-[#cc2727]">
              <Save className="h-4 w-4" />
              Enregistrer
            </Button>
            <Button onClick={handleCancel} variant="outline" className="gap-2 bg-transparent">
              <X className="h-4 w-4" />
              Annuler
            </Button>
          </div>
        </Card>
      )}

      {/* Testimonials List */}
      <div className="space-y-3">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id} className={`p-4 ${testimonial.is_visible ? "border-green-200 bg-green-50" : ""}`}>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                {testimonial.author_image ? (
                  <Image
                    src={testimonial.author_image || "/placeholder.svg"}
                    alt={testimonial.author_name}
                    width={60}
                    height={60}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-15 h-15 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-xl">
                    {testimonial.author_name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{testimonial.author_name}</h4>
                      {testimonial.google_review_id ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          <Tag className="h-3 w-3" />
                          Google
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                          <Tag className="h-3 w-3" />
                          Manuel
                        </span>
                      )}
                    </div>
                    {renderStars(testimonial.rating)}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      onClick={() => toggleVisibility(testimonial.id, testimonial.is_visible)}
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                    >
                      {testimonial.is_visible ? (
                        <>
                          <Eye className="h-4 w-4" />
                          Visible
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-4 w-4" />
                          Masqué
                        </>
                      )}
                    </Button>
                    <Button onClick={() => handleEdit(testimonial)} variant="outline" size="sm" className="gap-1">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(testimonial.id)}
                      variant="outline"
                      size="sm"
                      className="gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{testimonial.content}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {testimonials.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>Aucun avis enregistré.</p>
          <p className="text-sm">Synchronisez avec Google ou ajoutez des avis manuellement.</p>
        </div>
      )}
    </div>
  )
}
