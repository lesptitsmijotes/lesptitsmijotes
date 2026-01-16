"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

type NotificationType = "order" | "quote" | "contact"

interface Notification {
  id: string
  type: NotificationType
  message: string
  timestamp: Date
}

interface UseAdminNotificationsOptions {
  enabled?: boolean
  onNewOrder?: (payload: unknown) => void
  onNewQuote?: (payload: unknown) => void
  onNewContact?: (payload: unknown) => void
}

// AudioContext global pour éviter qu'il soit fermé par le cleanup du React HMR
let globalAudioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!globalAudioContext || globalAudioContext.state === "closed") {
    globalAudioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  return globalAudioContext
}

// Fonction pour jouer le son (définie hors du hook pour éviter les problèmes de scope)
function playSound(ctx: AudioContext) {
  try {
    // Créer un son "ding" agréable
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    // Son de type "ding" - deux notes pour un effet plus agréable
    oscillator.frequency.setValueAtTime(830, ctx.currentTime)
    oscillator.frequency.setValueAtTime(1050, ctx.currentTime + 0.1)
    oscillator.type = "sine"

    // Enveloppe du volume pour un son doux
    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02)
    gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1)
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.5)

    // Deuxième "ding" légèrement décalé pour un effet "ding-ding"
    setTimeout(() => {
      if (ctx.state === "closed") return

      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()

      osc2.connect(gain2)
      gain2.connect(ctx.destination)

      osc2.frequency.setValueAtTime(1050, ctx.currentTime)
      osc2.type = "sine"

      gain2.gain.setValueAtTime(0, ctx.currentTime)
      gain2.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.02)
      gain2.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4)

      osc2.start(ctx.currentTime)
      osc2.stop(ctx.currentTime + 0.4)
    }, 150)
  } catch (error) {
    console.error("Erreur playSound:", error)
  }
}

export function useAdminNotifications(options: UseAdminNotificationsOptions = {}) {
  const { enabled = true, onNewOrder, onNewQuote, onNewContact } = options
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [audioReady, setAudioReady] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)

  // Initialiser l'AudioContext au montage et écouter les interactions utilisateur
  useEffect(() => {
    const initAudioContext = () => {
      try {
        const ctx = getAudioContext()

        if (ctx.state === "suspended") {
          ctx.resume().then(() => {
            setAudioReady(true)
            console.log("Audio context activé")
          }).catch(() => {
            // Ignore - sera activé après interaction utilisateur
          })
        } else if (ctx.state === "running") {
          setAudioReady(true)
        }
      } catch (error) {
        console.error("Erreur init audio:", error)
      }
    }

    // Initialiser immédiatement
    initAudioContext()

    // Écouter les interactions utilisateur pour débloquer l'audio
    const handleUserInteraction = () => {
      try {
        const ctx = getAudioContext()
        if (ctx.state === "suspended") {
          ctx.resume().then(() => {
            setAudioReady(true)
            console.log("Audio context débloqué après interaction")
          })
        } else if (ctx.state === "running") {
          setAudioReady(true)
        }
      } catch (error) {
        console.error("Erreur interaction audio:", error)
      }
    }

    // Ajouter les listeners pour différents types d'interactions
    document.addEventListener("click", handleUserInteraction)
    document.addEventListener("keydown", handleUserInteraction)
    document.addEventListener("touchstart", handleUserInteraction)

    return () => {
      document.removeEventListener("click", handleUserInteraction)
      document.removeEventListener("keydown", handleUserInteraction)
      document.removeEventListener("touchstart", handleUserInteraction)
      // NE PAS fermer l'AudioContext ici - il est global
    }
  }, [])

  // Fonction pour jouer un son de notification
  const playNotificationSound = useCallback(() => {
    if (!soundEnabled) return

    try {
      const ctx = getAudioContext()

      // Vérifier si le contexte est fermé et le recréer si nécessaire
      if (ctx.state === "closed") {
        console.warn("AudioContext fermé, recréation...")
        globalAudioContext = null
        const newCtx = getAudioContext()
        newCtx.resume().then(() => playSound(newCtx))
        return
      }

      // Reprendre le contexte si suspendu
      if (ctx.state === "suspended") {
        ctx.resume().then(() => {
          setAudioReady(true)
          playSound(ctx)
        })
        return
      }

      playSound(ctx)

    } catch (error) {
      console.error("Erreur lors de la lecture du son:", error)
    }
  }, [soundEnabled])

  // Ajouter une notification
  const addNotification = useCallback((type: NotificationType, message: string) => {
    const notification: Notification = {
      id: `${type}-${Date.now()}`,
      type,
      message,
      timestamp: new Date(),
    }
    setNotifications(prev => [notification, ...prev].slice(0, 50))
    setUnreadCount(prev => prev + 1)
    playNotificationSound()
  }, [playNotificationSound])

  // Marquer comme lu
  const markAllAsRead = useCallback(() => {
    setUnreadCount(0)
  }, [])

  // Effacer les notifications
  const clearNotifications = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  // Configuration des listeners Supabase Realtime
  useEffect(() => {
    if (!enabled) return

    const supabase = createClient()

    // Créer un canal unique pour toutes les notifications admin
    const channel = supabase
      .channel("admin-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          const order = payload.new as { customer_name?: string; total_amount?: number }
          addNotification("order", `Nouvelle commande de ${order.customer_name || "Client"} - ${order.total_amount?.toFixed(2) || "0.00"}€`)
          onNewOrder?.(payload)
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "quote_requests",
        },
        (payload) => {
          const quote = payload.new as { customer_name?: string; service_type?: string }
          addNotification("quote", `Nouvelle demande de devis de ${quote.customer_name || "Client"} - ${quote.service_type || "Service"}`)
          onNewQuote?.(payload)
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "contact_messages",
        },
        (payload) => {
          const contact = payload.new as { name?: string; subject?: string }
          addNotification("contact", `Nouveau message de ${contact.name || "Visiteur"}${contact.subject ? ` - ${contact.subject}` : ""}`)
          onNewContact?.(payload)
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("Notifications admin activées")
        }
      })

    channelRef.current = channel

    // Cleanup
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [enabled, addNotification, onNewOrder, onNewQuote, onNewContact])

  return {
    notifications,
    unreadCount,
    soundEnabled,
    setSoundEnabled,
    audioReady,
    markAllAsRead,
    clearNotifications,
    playNotificationSound,
  }
}
