"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { ShoppingCart, FileText, MessageSquare, Clock, CheckCircle, XCircle, Package } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Order {
  id: string
  customer_name: string
  customer_email: string | null
  customer_phone: string
  customer_address: string
  delivery_date: string
  delivery_time: string | null
  total_amount: number
  status: string
  notes: string | null
  created_at: string
}

interface OrderItem {
  id: string
  order_id: string
  menu_item_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

interface QuoteRequest {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  event_date: string
  service_type: string
  number_of_guests: number
  message: string | null
  status: string
  created_at: string
}

interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  status: string
  created_at: string
}

type OrderStatus = "pending" | "confirmed" | "completed" | "cancelled"
type QuoteStatus = "pending" | "confirmed" | "completed" | "cancelled"
type MessageStatus = "new" | "read" | "replied"

export function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [quotes, setQuotes] = useState<QuoteRequest[]>([])
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({})
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [ordersResult, quotesResult, messagesResult, orderItemsResult] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("quote_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("contact_messages").select("*").order("created_at", { ascending: false }),
        supabase.from("order_items").select("*"),
      ])

      if (ordersResult.error) throw ordersResult.error
      if (quotesResult.error) throw quotesResult.error
      if (messagesResult.error) throw messagesResult.error
      if (orderItemsResult.error) throw orderItemsResult.error

      setOrders(ordersResult.data || [])
      setQuotes(quotesResult.data || [])
      setMessages(messagesResult.data || [])

      // Group order items by order_id
      const itemsByOrder: Record<string, OrderItem[]> = {}
      orderItemsResult.data?.forEach((item) => {
        if (!itemsByOrder[item.order_id]) {
          itemsByOrder[item.order_id] = []
        }
        itemsByOrder[item.order_id].push(item)
      })
      setOrderItems(itemsByOrder)
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrderStatus = async (id: string, newStatus: OrderStatus) => {
    try {
      const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", id)

      if (error) throw error

      setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status: newStatus } : order)))

      toast({
        title: "Succès",
        description: "Statut de la commande mis à jour",
      })
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      })
    }
  }

  const updateQuoteStatus = async (id: string, newStatus: QuoteStatus) => {
    try {
      const { error } = await supabase.from("quote_requests").update({ status: newStatus }).eq("id", id)

      if (error) throw error

      setQuotes((prev) => prev.map((quote) => (quote.id === id ? { ...quote, status: newStatus } : quote)))

      toast({
        title: "Succès",
        description: "Statut du devis mis à jour",
      })
    } catch (error) {
      console.error("Error updating quote status:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      })
    }
  }

  const updateMessageStatus = async (id: string, newStatus: MessageStatus) => {
    try {
      const { error } = await supabase.from("contact_messages").update({ status: newStatus }).eq("id", id)

      if (error) throw error

      setMessages((prev) => prev.map((message) => (message.id === id ? { ...message, status: newStatus } : message)))

      toast({
        title: "Succès",
        description: "Statut du message mis à jour",
      })
    } catch (error) {
      console.error("Error updating message status:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString))
  }

  const formatDeliveryDate = (dateString: string) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateString))
  }

  const getOrderStatusConfig = (status: string) => {
    const configs: Record<
      string,
      {
        label: string
        bgColor: string
        textColor: string
        borderColor: string
        icon: React.ReactNode
      }
    > = {
      pending: {
        label: "En Attente",
        bgColor: "bg-amber-50",
        textColor: "text-amber-700",
        borderColor: "border-amber-300",
        icon: <Clock className="h-4 w-4" />,
      },
      confirmed: {
        label: "Confirmé",
        bgColor: "bg-blue-50",
        textColor: "text-blue-700",
        borderColor: "border-blue-300",
        icon: <CheckCircle className="h-4 w-4" />,
      },
      completed: {
        label: "Terminé",
        bgColor: "bg-green-50",
        textColor: "text-green-700",
        borderColor: "border-green-300",
        icon: <Package className="h-4 w-4" />,
      },
      cancelled: {
        label: "Annulé",
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        borderColor: "border-red-300",
        icon: <XCircle className="h-4 w-4" />,
      },
    }

    return (
      configs[status] || {
        label: status,
        bgColor: "bg-gray-50",
        textColor: "text-gray-700",
        borderColor: "border-gray-300",
        icon: <Clock className="h-4 w-4" />,
      }
    )
  }

  const getMessageStatusConfig = (status: string) => {
    const configs: Record<
      string,
      {
        label: string
        bgColor: string
        textColor: string
        borderColor: string
      }
    > = {
      new: {
        label: "Nouveau",
        bgColor: "bg-purple-50",
        textColor: "text-purple-700",
        borderColor: "border-purple-300",
      },
      read: {
        label: "Lu",
        bgColor: "bg-blue-50",
        textColor: "text-blue-700",
        borderColor: "border-blue-300",
      },
      replied: {
        label: "Répondu",
        bgColor: "bg-green-50",
        textColor: "text-green-700",
        borderColor: "border-green-300",
      },
    }

    return (
      configs[status] || {
        label: status,
        bgColor: "bg-gray-50",
        textColor: "text-gray-700",
        borderColor: "border-gray-300",
      }
    )
  }

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders" className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Commandes ({orders.length})
          </TabsTrigger>
          <TabsTrigger value="quotes" className="gap-2">
            <FileText className="h-4 w-4" />
            Devis ({quotes.length})
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages ({messages.length})
          </TabsTrigger>
        </TabsList>

        {/* COMMANDES */}
        <TabsContent value="orders" className="space-y-4">
          {orders.map((order) => {
            const statusConfig = getOrderStatusConfig(order.status)
            return (
              <Card key={order.id} className={`p-6 border-2 ${statusConfig.borderColor} transition-all hover:shadow-lg`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-charmonman text-2xl text-[#ff3131] mb-1">{order.customer_name}</h4>
                    <p className="text-sm text-gray-500 font-simonetta">{formatDate(order.created_at)}</p>
                  </div>
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 ${statusConfig.borderColor} ${statusConfig.bgColor}`}
                  >
                    <span className={statusConfig.textColor}>{statusConfig.icon}</span>
                    <span className={`font-semibold ${statusConfig.textColor}`}>{statusConfig.label}</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4 font-simonetta">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-gray-700 min-w-[100px]">Téléphone:</span>
                      <span className="text-gray-900">{order.customer_phone}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-gray-700 min-w-[100px]">Adresse:</span>
                      <span className="text-gray-900">{order.customer_address}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-gray-700 min-w-[100px]">Livraison:</span>
                      <span className="text-gray-900">
                        {formatDeliveryDate(order.delivery_date)}
                        {order.delivery_time && ` à ${order.delivery_time}`}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-gray-700 min-w-[100px]">Total:</span>
                      <span className="text-[#ff3131] font-bold text-lg">{order.total_amount.toFixed(2)}€</span>
                    </div>
                  </div>
                </div>

                {order.notes && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="font-semibold text-gray-700 font-simonetta">Notes:</span>
                    <p className="text-gray-900 mt-1 font-simonetta">{order.notes}</p>
                  </div>
                )}

                {orderItems[order.id] && orderItems[order.id].length > 0 && (
                  <div className="mb-4 p-4 bg-gradient-to-br from-[#ff3131]/5 to-white rounded-lg border-2 border-[#ff3131]/20">
                    <div className="flex items-center gap-2 mb-3">
                      <ShoppingCart className="h-5 w-5 text-[#ff3131]" />
                      <span className="font-semibold text-gray-700 font-charmonman text-xl">Articles commandés:</span>
                    </div>
                    <div className="space-y-2">
                      {orderItems[order.id].map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                          <div className="flex items-center gap-3 flex-1">
                            <span className="font-bold text-[#ff3131] text-lg min-w-[40px]">{item.quantity}x</span>
                            <span className="font-simonetta text-gray-900 font-medium">{item.menu_item_name}</span>
                          </div>
                          <span className="font-simonetta text-gray-600 text-sm">{item.subtotal.toFixed(2)}€</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => updateOrderStatus(order.id, "pending")}
                    variant={order.status === "pending" ? "default" : "outline"}
                    className="gap-2 bg-amber-500 hover:bg-amber-600 text-white border-amber-500"
                  >
                    <Clock className="h-4 w-4" />
                    En Attente
                  </Button>
                  <Button
                    onClick={() => updateOrderStatus(order.id, "confirmed")}
                    variant={order.status === "confirmed" ? "default" : "outline"}
                    className="gap-2 bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Confirmé
                  </Button>
                  <Button
                    onClick={() => updateOrderStatus(order.id, "completed")}
                    variant={order.status === "completed" ? "default" : "outline"}
                    className="gap-2 bg-green-500 hover:bg-green-600 text-white border-green-500"
                  >
                    <Package className="h-4 w-4" />
                    Terminé
                  </Button>
                  <Button
                    onClick={() => updateOrderStatus(order.id, "cancelled")}
                    variant={order.status === "cancelled" ? "default" : "outline"}
                    className="gap-2 bg-red-500 hover:bg-red-600 text-white border-red-500"
                  >
                    <XCircle className="h-4 w-4" />
                    Annulé
                  </Button>
                </div>
              </Card>
            )
          })}
          {orders.length === 0 && (
            <div className="text-center py-12 text-gray-500 font-simonetta">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p>Aucune commande pour le moment.</p>
            </div>
          )}
        </TabsContent>

        {/* DEVIS */}
        <TabsContent value="quotes" className="space-y-4">
          {quotes.map((quote) => {
            const statusConfig = getOrderStatusConfig(quote.status)
            return (
              <Card key={quote.id} className={`p-6 border-2 ${statusConfig.borderColor} transition-all hover:shadow-lg`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-charmonman text-2xl text-[#ff3131] mb-1">{quote.customer_name}</h4>
                    <p className="text-sm text-gray-500 font-simonetta">{formatDate(quote.created_at)}</p>
                  </div>
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 ${statusConfig.borderColor} ${statusConfig.bgColor}`}
                  >
                    <span className={statusConfig.textColor}>{statusConfig.icon}</span>
                    <span className={`font-semibold ${statusConfig.textColor}`}>{statusConfig.label}</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4 font-simonetta">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-gray-700 min-w-[100px]">Email:</span>
                      <span className="text-gray-900">{quote.customer_email}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-gray-700 min-w-[100px]">Téléphone:</span>
                      <span className="text-gray-900">{quote.customer_phone}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-gray-700 min-w-[100px]">Événement:</span>
                      <span className="text-gray-900">{formatDeliveryDate(quote.event_date)}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-gray-700 min-w-[100px]">Type:</span>
                      <span className="text-gray-900">{quote.service_type}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-gray-700 min-w-[100px]">Invités:</span>
                      <span className="text-[#ff3131] font-bold">{quote.number_of_guests}</span>
                    </div>
                  </div>
                </div>

                {quote.message && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="font-semibold text-gray-700 font-simonetta">Message:</span>
                    <p className="text-gray-900 mt-1 font-simonetta">{quote.message}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => updateQuoteStatus(quote.id, "pending")}
                    variant={quote.status === "pending" ? "default" : "outline"}
                    className="gap-2 bg-amber-500 hover:bg-amber-600 text-white border-amber-500"
                  >
                    <Clock className="h-4 w-4" />
                    En Attente
                  </Button>
                  <Button
                    onClick={() => updateQuoteStatus(quote.id, "confirmed")}
                    variant={quote.status === "confirmed" ? "default" : "outline"}
                    className="gap-2 bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Confirmé
                  </Button>
                  <Button
                    onClick={() => updateQuoteStatus(quote.id, "completed")}
                    variant={quote.status === "completed" ? "default" : "outline"}
                    className="gap-2 bg-green-500 hover:bg-green-600 text-white border-green-500"
                  >
                    <Package className="h-4 w-4" />
                    Terminé
                  </Button>
                  <Button
                    onClick={() => updateQuoteStatus(quote.id, "cancelled")}
                    variant={quote.status === "cancelled" ? "default" : "outline"}
                    className="gap-2 bg-red-500 hover:bg-red-600 text-white border-red-500"
                  >
                    <XCircle className="h-4 w-4" />
                    Annulé
                  </Button>
                </div>
              </Card>
            )
          })}
          {quotes.length === 0 && (
            <div className="text-center py-12 text-gray-500 font-simonetta">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p>Aucune demande de devis pour le moment.</p>
            </div>
          )}
        </TabsContent>

        {/* MESSAGES */}
        <TabsContent value="messages" className="space-y-4">
          {messages.map((message) => {
            const statusConfig = getMessageStatusConfig(message.status)
            return (
              <Card
                key={message.id}
                className={`p-6 border-2 ${statusConfig.borderColor} transition-all hover:shadow-lg`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-charmonman text-2xl text-[#ff3131] mb-1">{message.name}</h4>
                    <p className="text-sm text-gray-500 font-simonetta">{formatDate(message.created_at)}</p>
                  </div>
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 ${statusConfig.borderColor} ${statusConfig.bgColor}`}
                  >
                    <span className={`font-semibold ${statusConfig.textColor}`}>{statusConfig.label}</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4 font-simonetta">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-gray-700 min-w-[100px]">Email:</span>
                      <span className="text-gray-900">{message.email}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-gray-700 min-w-[100px]">Téléphone:</span>
                      <span className="text-gray-900">{message.phone}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-gray-700 min-w-[100px]">Sujet:</span>
                      <span className="text-gray-900 font-semibold">{message.subject}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="font-semibold text-gray-700 font-simonetta">Message:</span>
                  <p className="text-gray-900 mt-1 font-simonetta whitespace-pre-wrap">{message.message}</p>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => updateMessageStatus(message.id, "new")}
                    variant={message.status === "new" ? "default" : "outline"}
                    className="gap-2 bg-purple-500 hover:bg-purple-600 text-white border-purple-500"
                  >
                    Nouveau
                  </Button>
                  <Button
                    onClick={() => updateMessageStatus(message.id, "read")}
                    variant={message.status === "read" ? "default" : "outline"}
                    className="gap-2 bg-blue-500 hover:bg-blue-600 text-white border-blue-500"
                  >
                    Lu
                  </Button>
                  <Button
                    onClick={() => updateMessageStatus(message.id, "replied")}
                    variant={message.status === "replied" ? "default" : "outline"}
                    className="gap-2 bg-green-500 hover:bg-green-600 text-white border-green-500"
                  >
                    Répondu
                  </Button>
                </div>
              </Card>
            )
          })}
          {messages.length === 0 && (
            <div className="text-center py-12 text-gray-500 font-simonetta">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p>Aucun message pour le moment.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
