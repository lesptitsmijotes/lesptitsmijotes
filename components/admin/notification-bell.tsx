"use client"

import { useState } from "react"
import { Bell, BellOff, Volume2, VolumeX, ShoppingCart, FileText, Mail, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useAdminNotifications } from "@/hooks/use-admin-notifications"
import { cn } from "@/lib/utils"

interface NotificationBellProps {
  onNavigateToOrders?: () => void
}

export function NotificationBell({ onNavigateToOrders }: NotificationBellProps) {
  const [open, setOpen] = useState(false)
  const {
    notifications,
    unreadCount,
    soundEnabled,
    setSoundEnabled,
    audioReady,
    markAllAsRead,
    clearNotifications,
    playNotificationSound,
  } = useAdminNotifications({
    enabled: true,
  })

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen && unreadCount > 0) {
      markAllAsRead()
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingCart className="h-4 w-4 text-green-600" />
      case "quote":
        return <FileText className="h-4 w-4 text-blue-600" />
      case "contact":
        return <Mail className="h-4 w-4 text-purple-600" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationBg = (type: string) => {
    switch (type) {
      case "order":
        return "bg-green-50 border-green-200"
      case "quote":
        return "bg-blue-50 border-blue-200"
      case "contact":
        return "bg-purple-50 border-purple-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)

    if (minutes < 1) return "À l'instant"
    if (minutes < 60) return `Il y a ${minutes} min`
    if (hours < 24) return `Il y a ${hours}h`
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative bg-transparent">
          {soundEnabled ? (
            <Bell className="h-5 w-5" />
          ) : (
            <BellOff className="h-5 w-5 text-gray-400" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff3131] text-xs font-bold text-white animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="font-semibold">Notifications</h4>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Désactiver le son" : "Activer le son"}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4 text-green-600" />
              ) : (
                <VolumeX className="h-4 w-4 text-gray-400" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => playNotificationSound()}
              title="Tester le son"
            >
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Avertissement si l'audio n'est pas prêt */}
        {!audioReady && soundEnabled && (
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-200">
            <p className="text-xs text-amber-700">
              Cliquez n'importe où sur cette page pour activer les sons de notification
            </p>
          </div>
        )}

        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune notification</p>
              <p className="text-xs mt-1">Les nouvelles commandes, devis et messages apparaîtront ici</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors",
                    getNotificationBg(notification.type)
                  )}
                  onClick={() => {
                    if (onNavigateToOrders) {
                      onNavigateToOrders()
                      setOpen(false)
                    }
                  }}
                >
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(notification.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="border-t px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-gray-500 hover:text-gray-700"
              onClick={clearNotifications}
            >
              <X className="h-4 w-4 mr-2" />
              Effacer tout
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
