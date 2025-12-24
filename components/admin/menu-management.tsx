"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Plus, Edit, Trash2, Save, X, Calendar, Upload, ImageIcon } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  is_menu_of_day: boolean
  menu_date: string | null
  display_order: number
  is_available: boolean
  show_on_homepage: boolean
}

export function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingOriginalDate, setEditingOriginalDate] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 20
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: "",
    description: "",
    price: 0,
    image_url: "",
    category: "Plat principal",
    is_menu_of_day: true,
    menu_date: new Date().toISOString().split("T")[0],
    display_order: 0,
    is_available: true,
    show_on_homepage: true,
  })

  const supabase = createClient()

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "L'image ne doit pas dépasser 5MB",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `menu/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('bucket_lesptitsmijotes')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('bucket_lesptitsmijotes')
        .getPublicUrl(filePath)

      setFormData({ ...formData, image_url: publicUrl })

      toast({
        title: "Succès",
        description: "Image uploadée avec succès",
      })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'uploader l'image",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    loadMenuItems()
  }, [currentPage])

  const loadMenuItems = async () => {
    setIsLoading(true)
    try {
      // Désactiver automatiquement les menus avec dates dépassées
      const today = new Date().toISOString().split("T")[0]
      await supabase
        .from("menu_items")
        .update({ show_on_homepage: false })
        .lt("menu_date", today)
        .eq("show_on_homepage", true)

      const offset = (currentPage - 1) * itemsPerPage

      const { count } = await supabase
        .from("menu_items")
        .select("*", { count: "exact", head: true })
        .eq("is_menu_of_day", true)

      setTotalItems(count || 0)

      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("is_menu_of_day", true)
        .order("menu_date", { ascending: false })
        .order("display_order", { ascending: true })
        .range(offset, offset + itemsPerPage - 1)

      if (error) throw error
      setMenuItems(data || [])
    } catch (error) {
      console.error("[v0] Error loading menu items:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger le menu",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const dataToSave = {
        ...formData,
        image_url: formData.image_url || null,
        description: formData.description || "",
      }

      if (editingId && formData.menu_date !== editingOriginalDate) {
        // Date changée : dupliquer au lieu de modifier
        // Retirer l'id pour créer un nouveau plat
        const { id, ...dataWithoutId } = dataToSave
        const { error } = await supabase.from("menu_items").insert([dataWithoutId])

        if (error) {
          alert(`Erreur DB: ${JSON.stringify(error)}`)
          throw error
        }
        toast({
          title: "Succès",
          description: "Plat dupliqué avec succès pour la nouvelle date",
        })
      } else if (editingId) {
        // Même date : modifier normalement
        const { error } = await supabase
          .from("menu_items")
          .update({
            ...dataToSave,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId)

        if (error) {
          alert(`Erreur DB: ${JSON.stringify(error)}`)
          throw error
        }
        toast({
          title: "Succès",
          description: "Plat mis à jour avec succès",
        })
      } else {
        // Nouveau plat
        const { error } = await supabase.from("menu_items").insert([dataToSave])

        if (error) {
          alert(`Erreur DB: ${JSON.stringify(error)}`)
          throw error
        }
        toast({
          title: "Succès",
          description: "Plat ajouté avec succès",
        })
      }

      setEditingId(null)
      setEditingOriginalDate(null)
      setIsAdding(false)
      setFormData({
        name: "",
        description: "",
        price: 0,
        image_url: "",
        category: "Plat principal",
        is_menu_of_day: true,
        menu_date: new Date().toISOString().split("T")[0],
        display_order: 0,
        is_available: true,
        show_on_homepage: true,
      })
      loadMenuItems()
    } catch (error: any) {
      alert(`Erreur catch: ${error?.message || JSON.stringify(error)}`)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le plat",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce plat ?")) return

    try {
      const { error } = await supabase.from("menu_items").delete().eq("id", id)

      if (error) throw error
      toast({
        title: "Succès",
        description: "Plat supprimé avec succès",
      })
      loadMenuItems()
    } catch (error) {
      console.error("[v0] Error deleting menu item:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le plat",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (item: MenuItem) => {
    setEditingId(item.id)
    setEditingOriginalDate(item.menu_date)
    setFormData(item)
    setIsAdding(false)
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditingOriginalDate(null)
    setIsAdding(false)
    setFormData({
      name: "",
      description: "",
      price: 0,
      image_url: "",
      category: "Plat principal",
      is_menu_of_day: true,
      menu_date: new Date().toISOString().split("T")[0],
      display_order: 0,
      is_available: true,
      show_on_homepage: true,
    })
  }

  const formatMenuDate = (menuDate: string | null) => {
    if (!menuDate) return ""

    const date = new Date(menuDate + 'T00:00:00')
    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
    const dayName = days[date.getDay()]
    const dayNumber = date.getDate()
    const month = date.getMonth() + 1

    return `${dayName} ${dayNumber}/${month}`
  }

  const groupMenuItemsByDate = () => {
    const grouped: { [key: string]: MenuItem[] } = {}
    menuItems.forEach(item => {
      const date = item.menu_date || ""
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(item)
    })
    return grouped
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>
  }

  const groupedMenus = groupMenuItemsByDate()

  return (
    <div className="space-y-6">
      {/* Header avec stats et bouton */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <span className="font-semibold">{totalItems}</span> plat(s) au total
        </div>
        {!isAdding && !editingId && (
          <Button onClick={() => setIsAdding(true)} className="gap-2 bg-[#ff3131] hover:bg-[#cc2727]">
            <Plus className="h-4 w-4" />
            Ajouter un plat
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <Card className="p-6 space-y-4 border-2 border-[#ff3131]">
          <h3 className="text-lg font-semibold">
            {editingId ? "Modifier le plat" : "Nouveau plat"}
            {editingId && formData.menu_date !== editingOriginalDate && (
              <span className="ml-2 text-sm text-orange-600 font-normal">
                (sera dupliqué pour la nouvelle date)
              </span>
            )}
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="menu-date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date du menu *
              </Label>
              <Input
                id="menu-date"
                type="date"
                value={formData.menu_date || ""}
                onChange={(e) => setFormData({ ...formData, menu_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Prix (€) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price || ""}
                onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })}
                placeholder="15.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nom du plat *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Poulet DG"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez le plat..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Plat principal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display-order">Ordre d'affichage</Label>
              <Input
                id="display-order"
                type="number"
                value={formData.display_order || ""}
                onChange={(e) => setFormData({ ...formData, display_order: Number.parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Image du plat</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="flex items-start gap-4">
                {formData.image_url && (
                  <div className="relative w-32 h-32 bg-gray-100 rounded border overflow-hidden flex-shrink-0">
                    <Image
                      src={formData.image_url}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    {uploading ? (
                      <>
                        <Upload className="w-4 h-4 mr-2 animate-spin" />
                        Upload en cours...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Choisir une image
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-gray-500">
                    Format: JPG, PNG, WebP. Taille max: 5MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button" onClick={handleSave} className="gap-2 bg-[#ff3131] hover:bg-[#cc2727]">
              <Save className="h-4 w-4" />
              Enregistrer
            </Button>
            <Button type="button" onClick={handleCancel} variant="outline" className="gap-2 bg-transparent">
              <X className="h-4 w-4" />
              Annuler
            </Button>
          </div>
        </Card>
      )}

      {/* Menu Items List - Grouped by Date */}
      {Object.keys(groupedMenus).length > 0 ? (
        <>
          <div className="space-y-6">
            {Object.entries(groupedMenus).sort().reverse().map(([date, items]) => (
              <div key={date} className="space-y-3">
                <h3 className="text-lg font-semibold text-[#ff3131] border-b border-[#ff3131] pb-1">
                  {formatMenuDate(date)} - {items.length} plat(s)
                </h3>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  {items.map((item) => (
                    <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative h-32 bg-gray-200">
                        <Image
                          src={item.image_url || "/placeholder.svg?height=200&width=300"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-3 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-sm leading-tight">{item.name}</h4>
                          <span className="text-sm font-bold text-[#ff3131] whitespace-nowrap">{item.price.toFixed(2)}€</span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>
                        <div className="flex items-center gap-1.5 pt-1">
                          <input
                            type="checkbox"
                            checked={item.show_on_homepage}
                            onChange={async (e) => {
                              const newValue = e.target.checked
                              const { error } = await supabase
                                .from("menu_items")
                                .update({ show_on_homepage: newValue })
                                .eq("id", item.id)

                              if (!error) {
                                loadMenuItems()
                                toast({
                                  title: "Succès",
                                  description: newValue ? "Menu activé sur l'accueil" : "Menu retiré de l'accueil",
                                })
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-xs text-gray-600">Accueil</span>
                        </div>
                        <div className="flex gap-1.5">
                          <Button onClick={() => handleEdit(item)} variant="outline" size="sm" className="gap-1 flex-1 h-8 text-xs">
                            <Edit className="h-3 w-3" />
                            Modifier
                          </Button>
                          <Button
                            onClick={() => handleDelete(item.id)}
                            variant="outline"
                            size="sm"
                            className="gap-1 h-8 text-xs text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
              >
                Précédent
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className={currentPage === page ? "bg-[#ff3131] hover:bg-[#cc2727]" : ""}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
              >
                Suivant
              </Button>
            </div>
          )}
        </>
      ) : (
        !isAdding && (
          <div className="text-center py-12 text-gray-500">
            <p>Aucun plat enregistré.</p>
            <p className="text-sm">Cliquez sur "Ajouter un plat" pour commencer.</p>
          </div>
        )
      )}
    </div>
  )
}
