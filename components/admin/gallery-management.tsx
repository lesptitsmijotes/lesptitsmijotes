"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Plus, Edit, Trash2, Save, X, Eye, EyeOff, ImageIcon, Upload } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"

interface GalleryImage {
  id: string
  title: string
  description: string | null
  image_url: string
  category: string
  is_visible: boolean
  display_order: number
  social_link: string | null
  created_at: string
}

const CATEGORIES = ["Plats", "Événements", "Buffets", "Mariages", "Entreprises", "Fêtes d'anniversaire", "Autre"]

export function GalleryManagement() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<Partial<GalleryImage>>({
    title: "",
    description: "",
    image_url: "",
    category: "Plats",
    is_visible: true,
    display_order: 0,
    social_link: "",
  })

  const supabase = createClient()

  useEffect(() => {
    loadImages()
  }, [filterCategory])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `gallery/${fileName}`

      const { error: uploadError } = await supabase.storage.from("bucket_lesptitsmijotes").upload(filePath, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("bucket_lesptitsmijotes").getPublicUrl(filePath)

      setFormData({ ...formData, image_url: publicUrl })

      toast({
        title: "Succès",
        description: "Image uploadée avec succès",
      })
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'uploader l'image",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const loadImages = async () => {
    setIsLoading(true)
    try {
      let query = supabase.from("gallery_images").select("*").order("display_order", { ascending: true })

      if (filterCategory !== "all") {
        query = query.eq("category", filterCategory)
      }

      const { data, error } = await query

      if (error) throw error
      setImages(data || [])
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la galerie",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.title || !formData.image_url) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      })
      return
    }

    try {
      if (editingId) {
        const { error } = await supabase.from("gallery_images").update(formData).eq("id", editingId)

        if (error) throw error
        toast({
          title: "Succès",
          description: "Image mise à jour avec succès",
        })
      } else {
        const { error } = await supabase.from("gallery_images").insert([formData])

        if (error) throw error
        toast({
          title: "Succès",
          description: "Image ajoutée avec succès",
        })
      }

      setEditingId(null)
      setIsAdding(false)
      setFormData({
        title: "",
        description: "",
        image_url: "",
        category: "Plats",
        is_visible: true,
        display_order: 0,
        social_link: "",
      })
      loadImages()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'image",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette image ?")) return

    try {
      const { error } = await supabase.from("gallery_images").delete().eq("id", id)

      if (error) throw error
      toast({
        title: "Succès",
        description: "Image supprimée avec succès",
      })
      loadImages()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'image",
        variant: "destructive",
      })
    }
  }

  const toggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase.from("gallery_images").update({ is_visible: !currentVisibility }).eq("id", id)

      if (error) throw error
      toast({
        title: "Succès",
        description: `Image ${!currentVisibility ? "affichée" : "masquée"} avec succès`,
      })
      loadImages()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la visibilité",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (image: GalleryImage) => {
    setEditingId(image.id)
    setFormData(image)
    setIsAdding(false)
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsAdding(false)
    setFormData({
      title: "",
      description: "",
      image_url: "",
      category: "Plats",
      is_visible: true,
      display_order: 0,
      social_link: "",
    })
  }

  const visibleCount = images.filter((img) => img.is_visible).length

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {!isAdding && !editingId && (
          <Button onClick={() => setIsAdding(true)} className="gap-2 bg-[#ff3131] hover:bg-[#cc2727]">
            <Plus className="h-4 w-4" />
            Ajouter une image
          </Button>
        )}

        <div className="flex items-center gap-2">
          <Label className="text-sm">Catégorie:</Label>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Toutes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto text-sm text-gray-600 flex items-center gap-2">
          <span className="font-medium">{visibleCount}</span> visible(s) sur
          <span className="font-medium">{images.length}</span> total
        </div>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <Card className="p-6 space-y-4 border-2 border-[#ff3131]">
          <h3 className="text-lg font-semibold">{editingId ? "Modifier l'image" : "Nouvelle image"}</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Poulet DG - Mariage Dupont"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Catégorie *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="image-upload">Image *</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="w-full gap-2"
                disabled={uploading}
              >
                <Upload className="h-4 w-4" />
                {uploading ? "Upload en cours..." : "Choisir une image"}
              </Button>
              {formData.image_url && (
                <div className="mt-2 relative h-40 bg-gray-100 rounded-lg overflow-hidden">
                  <Image src={formData.image_url || "/placeholder.svg"} alt="Aperçu" fill className="object-cover" />
                </div>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="social-link">Lien réseau social (optionnel)</Label>
              <Input
                id="social-link"
                value={formData.social_link || ""}
                onChange={(e) => setFormData({ ...formData, social_link: e.target.value })}
                placeholder="https://instagram.com/p/... ou https://facebook.com/..."
              />
              <p className="text-xs text-gray-500">
                Si renseigné, un icône du réseau social apparaîtra sur l'image dans la galerie publique
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description (optionnelle)</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez l'image..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2 md:col-span-2">
              <Switch
                id="visible"
                checked={formData.is_visible}
                onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
              />
              <Label htmlFor="visible" className="cursor-pointer">
                Visible sur le site
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

      {/* Gallery Grid */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {images.map((image) => (
          <Card
            key={image.id}
            className={`overflow-hidden ${image.is_visible ? "border-green-200" : "border-gray-300"}`}
          >
            <div className="relative h-48 bg-gray-200">
              <Image src={image.image_url || "/placeholder.svg"} alt={image.title} fill className="object-cover" />
              {!image.is_visible && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <EyeOff className="h-8 w-8 text-white" />
                </div>
              )}
            </div>
            <div className="p-3 space-y-2">
              <div>
                <h4 className="font-semibold text-sm line-clamp-1">{image.title}</h4>
                <p className="text-xs text-gray-600">{image.category}</p>
              </div>
              <div className="flex gap-1">
                <Button
                  onClick={() => toggleVisibility(image.id, image.is_visible)}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 flex-1"
                >
                  {image.is_visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </Button>
                <Button onClick={() => handleEdit(image)} variant="ghost" size="sm" className="h-8 px-2">
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  onClick={() => handleDelete(image.id)}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p>Aucune image dans cette catégorie.</p>
          <p className="text-sm">Cliquez sur "Ajouter une image" pour commencer.</p>
        </div>
      )}
    </div>
  )
}
