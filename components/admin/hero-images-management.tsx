"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Upload, Trash2, MoveUp, MoveDown, ImagePlus } from "lucide-react"
import { toast } from "sonner"

interface HeroImage {
  id: string
  image_url: string
  alt_text: string
  order_index: number
  is_active: boolean
}

export function HeroImagesManagement() {
  const [images, setImages] = useState<HeroImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchImages()
  }, [])

  async function fetchImages() {
    try {
      const { data, error } = await supabase
        .from("hero_images")
        .select("*")
        .order("order_index", { ascending: true })

      if (error) throw error
      setImages(data || [])
    } catch (error) {
      console.error("Error fetching images:", error)
      toast.error("Erreur lors du chargement des images")
    } finally {
      setLoading(false)
    }
  }

  async function updateImage(id: string, updates: Partial<HeroImage>) {
    try {
      const { error } = await supabase
        .from("hero_images")
        .update(updates)
        .eq("id", id)

      if (error) throw error
      await fetchImages()
      toast.success("Image mise à jour")
    } catch (error) {
      console.error("Error updating image:", error)
      toast.error("Erreur lors de la mise à jour")
    }
  }

  async function deleteImage(id: string) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette image ?")) return

    try {
      const { error} = await supabase
        .from("hero_images")
        .delete()
        .eq("id", id)

      if (error) throw error
      await fetchImages()
      toast.success("Image supprimée")
    } catch (error) {
      console.error("Error deleting image:", error)
      toast.error("Erreur lors de la suppression")
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error("Veuillez sélectionner une image valide")
      return
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5MB")
      return
    }

    setUploading(true)

    try {
      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `carousel/${fileName}`

      // Upload vers Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('bucket_lesptitsmijotes')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('bucket_lesptitsmijotes')
        .getPublicUrl(filePath)

      // Ajouter l'entrée dans la base de données
      const maxOrder = Math.max(...images.map(img => img.order_index), 0)
      const { error: dbError } = await supabase
        .from("hero_images")
        .insert({
          image_url: publicUrl,
          alt_text: file.name.replace(/\.[^/.]+$/, ""), // Nom du fichier sans extension
          order_index: maxOrder + 1,
          is_active: true
        })

      if (dbError) throw dbError

      await fetchImages()
      toast.success("Image uploadée avec succès")

      // Réinitialiser l'input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Erreur lors de l'upload de l'image")
    } finally {
      setUploading(false)
    }
  }

  async function addImage() {
    // Ouvrir le sélecteur de fichier
    fileInputRef.current?.click()
  }

  async function moveImage(id: string, direction: "up" | "down") {
    const currentIndex = images.findIndex(img => img.id === id)
    if (currentIndex === -1) return

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (targetIndex < 0 || targetIndex >= images.length) return

    const currentImage = images[currentIndex]
    const targetImage = images[targetIndex]

    try {
      await updateImage(currentImage.id, { order_index: targetImage.order_index })
      await updateImage(targetImage.id, { order_index: currentImage.order_index })
    } catch (error) {
      console.error("Error moving image:", error)
      toast.error("Erreur lors du déplacement")
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Images d&apos;accueil</h2>
        <Button onClick={addImage} disabled={uploading}>
          {uploading ? (
            <>
              <Upload className="w-4 h-4 mr-2 animate-spin" />
              Upload en cours...
            </>
          ) : (
            <>
              <ImagePlus className="w-4 h-4 mr-2" />
              Ajouter une image
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4">
        {images.map((image, index) => (
          <Card key={image.id}>
            <CardContent className="pt-6">
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-48 h-32 bg-gray-100 rounded overflow-hidden">
                  <img
                    src={image.image_url}
                    alt={image.alt_text}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <Label htmlFor={`url-${image.id}`}>URL de l&apos;image</Label>
                    <Input
                      id={`url-${image.id}`}
                      value={image.image_url}
                      onChange={(e) => updateImage(image.id, { image_url: e.target.value })}
                      placeholder="/images/votre-image.jpg"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`alt-${image.id}`}>Texte alternatif</Label>
                    <Input
                      id={`alt-${image.id}`}
                      value={image.alt_text}
                      onChange={(e) => updateImage(image.id, { alt_text: e.target.value })}
                      placeholder="Description de l'image"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`active-${image.id}`}
                      checked={image.is_active}
                      onChange={(e) => updateImage(image.id, { is_active: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor={`active-${image.id}`}>Image active</Label>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => moveImage(image.id, "up")}
                    disabled={index === 0}
                  >
                    <MoveUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => moveImage(image.id, "down")}
                    disabled={index === images.length - 1}
                  >
                    <MoveDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteImage(image.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
