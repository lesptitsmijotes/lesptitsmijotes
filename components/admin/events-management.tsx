"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import {
  Bold,
  Calendar,
  Edit,
  Eye,
  EyeOff,
  FileText,
  Heading1,
  Heading2,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Plus,
  Redo,
  Save,
  Strikethrough,
  Trash2,
  Underline,
  Undo,
  Upload,
  Users,
  X,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import TiptapLink from "@tiptap/extension-link"
import TiptapUnderline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import Highlight from "@tiptap/extension-highlight"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"

interface Event {
  id: string
  title: string
  description: string | null
  image_urls: string[] | null
  event_date: string
  image_url: string | null
  is_visible: boolean
  created_at: string
  updated_at: string
}

interface EventParticipant {
  id: string
  event_id: string
  name: string
  email: string | null
  phone: string | null
  number_of_people: number | null
  created_at: string
}

export function EventsManagement() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [showPast, setShowPast] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [participants, setParticipants] = useState<EventParticipant[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [selectedEventTitle, setSelectedEventTitle] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<Partial<Event>>({
    title: "",
    description: "",
    image_urls: [],
    event_date: new Date().toISOString().split("T")[0],
    image_url: "",
    is_visible: true,
  })

  const supabase = createClient()

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TiptapLink.configure({
        openOnClick: false,
      }),
      TiptapUnderline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight,
      TextStyle,
      Color,
    ],
    content: formData.description || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      setFormData((prev) => ({ ...prev, description: html }))
    },
  })

  useEffect(() => {
    if (editor && formData.description !== editor.getHTML()) {
      editor.commands.setContent(formData.description || "")
    }
  }, [editingId, editor])

  useEffect(() => {
    loadEvents()
  }, [showPast])

  const loadEvents = async () => {
    setIsLoading(true)
    try {
      const today = new Date().toISOString().split("T")[0]

      // Auto-hide past events
      await supabase.from("events").update({ is_visible: false }).lt("event_date", today).eq("is_visible", true)

      let query = supabase.from("events").select("*").order("event_date", { ascending: true })

      if (!showPast) {
        query = query.gte("event_date", today)
      }

      const { data, error } = await query

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error("[v0] Error loading events:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les événements",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.title || !formData.event_date) {
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
          .from("events")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId)

        if (error) throw error
        toast({
          title: "Succès",
          description: "Événement mis à jour avec succès",
        })
      } else {
        const { error } = await supabase.from("events").insert([formData])

        if (error) throw error
        toast({
          title: "Succès",
          description: "Événement créé avec succès",
        })
      }

      setEditingId(null)
      setIsAdding(false)
      editor?.commands.clearContent()
      setFormData({
        title: "",
        description: "",
        image_urls: [],
        event_date: new Date().toISOString().split("T")[0],
        image_url: "",
        is_visible: true,
      })
      loadEvents()
    } catch (error) {
      console.error("[v0] Error saving event:", error)
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'événement",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) return

    try {
      const { error } = await supabase.from("events").delete().eq("id", id)

      if (error) throw error
      toast({
        title: "Succès",
        description: "Événement supprimé avec succès",
      })
      loadEvents()
    } catch (error) {
      console.error("[v0] Error deleting event:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'événement",
        variant: "destructive",
      })
    }
  }

  const toggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase.from("events").update({ is_visible: !currentVisibility }).eq("id", id)

      if (error) throw error
      toast({
        title: "Succès",
        description: `Événement ${!currentVisibility ? "affiché" : "masqué"} avec succès`,
      })
      loadEvents()
    } catch (error) {
      console.error("[v0] Error toggling visibility:", error)
      toast({
        title: "Erreur",
        description: "Impossible de modifier la visibilité",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (event: Event) => {
    setEditingId(event.id)
    setFormData(event)
    setIsAdding(false)
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsAdding(false)
    editor?.commands.clearContent()
    setFormData({
      title: "",
      description: "",
      image_urls: [],
      event_date: new Date().toISOString().split("T")[0],
      image_url: "",
      is_visible: true,
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date)
  }

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value)
  }

  const RichTextEditor = ({ value, onChange }: { value: string | null; onChange: (val: string) => void }) => {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (ref.current && (ref.current.innerHTML || "") !== (value || "")) {
        ref.current.innerHTML = value || ""
      }
    }, [value])

    const handleInput = () => {
      if (!ref.current) return
      onChange(ref.current.innerHTML)
    }

    return (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2 text-sm">
          <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("bold")}>Gras</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("italic")}>Italique</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("underline")}>
            Souligné
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => applyFormat("insertUnorderedList")}>
            Liste
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const url = prompt("Lien (https://...)") || ""
              if (url) applyFormat("createLink", url)
            }}
          >
            Lien
          </Button>
        </div>
        <div
          ref={ref}
          className="min-h-[180px] w-full border rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff3131]"
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          aria-label="Description riche"
        />
      </div>
    )
  }

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const maxFiles = 2
    const selected = Array.from(files).slice(0, maxFiles)
    setUploading(true)

    try {
      const uploads = await Promise.all(
        selected.map(async (file) => {
          const fileExt = file.name.split(".").pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
          const filePath = `evenement/${fileName}`

          const { error: uploadError } = await supabase.storage.from("bucket_lesptitsmijotes").upload(filePath, file, {
            upsert: true,
          })

          if (uploadError) throw uploadError

          const { data } = supabase.storage.from("bucket_lesptitsmijotes").getPublicUrl(filePath)
          return data.publicUrl
        }),
      )

      setFormData((prev) => {
        const newList = [...(prev.image_urls || []), ...uploads].slice(0, maxFiles)
        return {
          ...prev,
          image_urls: newList,
          image_url: newList[0] || "",
        }
      })
      toast({ title: "Succès", description: "Images ajoutées." })
    } catch (error) {
      console.error("[events] Upload failed:", error)
      toast({ title: "Erreur", description: "Échec de l'upload des images", variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  const openParticipants = async (eventId: string, title: string) => {
    if (selectedEventId === eventId) {
      setSelectedEventId(null)
      setParticipants([])
      return
    }
    setSelectedEventTitle(title)
    const { data, error } = await supabase
      .from("event_participants")
      .select("id,event_id,name,email,phone,number_of_people,created_at")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[events] Failed to load participants:", error)
      toast({ title: "Erreur", description: "Impossible de charger les participants", variant: "destructive" })
      return
    }
    setParticipants(data || [])
    setSelectedEventId(eventId)
  }

  const isPastEvent = (dateString: string) => {
    const eventDate = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return eventDate < today
  }

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
            Créer un événement
          </Button>
        )}

        <div className="flex items-center space-x-2">
          <Switch id="show-past" checked={showPast} onCheckedChange={setShowPast} />
          <Label htmlFor="show-past" className="cursor-pointer text-sm">
            Afficher les événements passés
          </Label>
        </div>

        <div className="ml-auto text-sm text-gray-600">
          <span className="font-medium">{events.length}</span> événement(s)
        </div>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <Card className="p-6 space-y-4 border-2 border-[#ff3131]">
          <h3 className="text-lg font-semibold">{editingId ? "Modifier l'événement" : "Nouvel événement"}</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Titre de l'événement *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Festival de la Cuisine Africaine"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-date">Date de l'événement *</Label>
              <Input
                id="event-date"
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Images de l'événement</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleUpload(e.target.files)}
                className="hidden"
              />
              <div className="flex items-start gap-4">
                {(formData.image_urls || []).length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {(formData.image_urls || []).map((url, idx) => (
                      <div key={url} className="relative w-32 h-32 bg-gray-100 rounded border overflow-hidden flex-shrink-0">
                        <Image src={url} alt={`Aperçu ${idx + 1}`} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || (formData.image_urls || []).length >= 2}
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
                        Choisir des images
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-gray-500">
                    Jusqu'à 2 images. Format: JPG, PNG, WebP. Stockées dans le dossier evenement.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Description de l'événement</Label>
              <div className="border rounded-md overflow-hidden">
                <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    className={editor?.isActive("bold") ? "bg-gray-200" : ""}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    className={editor?.isActive("italic") ? "bg-gray-200" : ""}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => editor?.chain().focus().toggleStrike().run()}
                    className={editor?.isActive("strike") ? "bg-gray-200" : ""}
                  >
                    <Strikethrough className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => editor?.chain().focus().toggleUnderline().run()}
                    className={editor?.isActive("underline") ? "bg-gray-200" : ""}
                  >
                    <Underline className="h-4 w-4" />
                  </Button>
                  <div className="w-px bg-gray-300 mx-1" />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={editor?.isActive("heading", { level: 1 }) ? "bg-gray-200" : ""}
                  >
                    <Heading1 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={editor?.isActive("heading", { level: 2 }) ? "bg-gray-200" : ""}
                  >
                    <Heading2 className="h-4 w-4" />
                  </Button>
                  <div className="w-px bg-gray-300 mx-1" />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    className={editor?.isActive("bulletList") ? "bg-gray-200" : ""}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                    className={editor?.isActive("orderedList") ? "bg-gray-200" : ""}
                  >
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  <div className="w-px bg-gray-300 mx-1" />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const url = window.prompt("URL du lien:")
                      if (url) {
                        editor?.chain().focus().setLink({ href: url }).run()
                      }
                    }}
                    className={editor?.isActive("link") ? "bg-gray-200" : ""}
                  >
                    <Link2 className="h-4 w-4" />
                  </Button>
                  <div className="w-px bg-gray-300 mx-1" />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => editor?.chain().focus().toggleHighlight().run()}
                    className={editor?.isActive("highlight") ? "bg-yellow-200" : ""}
                    title="Surligner"
                  >
                    <span className="h-4 w-4 flex items-center justify-center">✨</span>
                  </Button>
                  <input
                    type="color"
                    onChange={(e) => editor?.chain().focus().setColor(e.target.value).run()}
                    className="w-8 h-8 border rounded cursor-pointer"
                    title="Couleur du texte"
                  />
                  <div className="w-px bg-gray-300 mx-1" />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                    className={editor?.isActive({ textAlign: 'left' }) ? "bg-gray-200" : ""}
                    title="Aligner à gauche"
                  >
                    <span className="h-4 w-4 flex items-center justify-center">⬅️</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                    className={editor?.isActive({ textAlign: 'center' }) ? "bg-gray-200" : ""}
                    title="Centrer"
                  >
                    <span className="h-4 w-4 flex items-center justify-center">↔️</span>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                    className={editor?.isActive({ textAlign: 'right' }) ? "bg-gray-200" : ""}
                    title="Aligner à droite"
                  >
                    <span className="h-4 w-4 flex items-center justify-center">➡️</span>
                  </Button>
                  <div className="w-px bg-gray-300 mx-1" />
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => editor?.chain().focus().undo().run()}
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => editor?.chain().focus().redo().run()}
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                </div>
                <EditorContent
                  editor={editor}
                  className="prose prose-sm max-w-none min-h-[200px] px-4 py-2 focus:outline-none"
                />
              </div>
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

      {/* Events List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => {
          const past = isPastEvent(event.event_date)
          const cover = event.image_urls?.[0] || event.image_url
          return (
            <Card
              key={event.id}
              className={`overflow-hidden ${past ? "opacity-60" : ""} ${event.is_visible ? "border-green-200" : "border-gray-300"}`}
            >
              <div className="relative h-48 bg-gray-200">
                <Image
                  src={cover || "/placeholder.svg?height=200&width=300"}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
                {past && (
                  <div className="absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 rounded text-xs font-medium">
                    Passé
                  </div>
                )}
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <h4 className="font-semibold text-lg mb-1">{event.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    {formatDate(event.event_date)}
                  </div>
                </div>
                {event.description && <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => toggleVisibility(event.id, event.is_visible)}
                    variant="outline"
                    size="sm"
                    className="gap-1 flex-1"
                  >
                    {event.is_visible ? (
                      <>
                        <Eye className="h-3 w-3" />
                        Visible
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3" />
                        Masqué
                      </>
                    )}
                  </Button>
                  <Button onClick={() => handleEdit(event)} variant="outline" size="sm" className="gap-1">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    onClick={() => openParticipants(event.id, event.title)}
                    variant="outline"
                    size="sm"
                    className="gap-1"
                  >
                    <Users className="h-3 w-3" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(event.id)}
                    variant="outline"
                    size="sm"
                    className="gap-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                {selectedEventId === event.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-4 w-4 text-[#ff3131]" />
                      <h4 className="font-semibold text-gray-900">Participants - {selectedEventTitle}</h4>
                    </div>
                    {participants.length === 0 ? (
                      <p className="text-sm text-gray-600">Aucun participant enregistré.</p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-auto">
                        {participants.map((p) => (
                          <div key={p.id} className="p-3 bg-white border rounded">
                            <div className="font-medium text-gray-900">{p.name}</div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>Email: {p.email}</div>
                              <div>Téléphone: {p.phone}</div>
                              <div>Personnes: {p.number_of_people ?? 1}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>Aucun événement {!showPast && "à venir"} pour le moment.</p>
          <p className="text-sm">Cliquez sur "Créer un événement" pour commencer.</p>
        </div>
      )}
    </div>
  )
}
