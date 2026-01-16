"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, ShoppingCart, MessageCircle, Smartphone } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

type MenuItem = {
  id: string
  name: string
  description: string | null
  price: number
  menu_date: string | null
  category: string | null
  image_url: string | null
  is_available: boolean
  is_menu_of_day: boolean
  show_on_homepage: boolean
  display_order: number
}

type CartItem = MenuItem & {
  quantity: number
}

export default function OrderPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [lastOrder, setLastOrder] = useState<{
    cart: CartItem[]
    customerInfo: typeof customerInfo
    total: number
  } | null>(null)
  const successRef = useRef<HTMLDivElement>(null)

  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
    deliveryDate: getTodayDate(),
    deliveryTime: "",
    notes: "",
  })

  useEffect(() => {
    async function fetchMenu() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("is_menu_of_day", true)
        .eq("is_available", true)
        .eq("show_on_homepage", true)
        .order("menu_date", { ascending: true })
        .order("display_order", { ascending: true })

      if (error) {
        console.error("[v0] Error fetching menu:", error)
      } else {
        setMenuItems(data || [])
      }
      setLoading(false)
    }

    fetchMenu()
  }, [])

  const addToCart = (item: MenuItem) => {
    const existing = cart.find((i) => i.id === item.id)
    if (existing) {
      setCart(cart.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)))
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart(
      cart
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
        .filter((item) => item.quantity > 0),
    )
  }

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    if (cart.length === 0) {
      setError("Votre panier est vide")
      setSubmitting(false)
      return
    }

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    // Create order
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          customer_name: customerInfo.name,
          customer_email: null,
          customer_phone: customerInfo.phone,
          customer_address: customerInfo.address,
          delivery_date: customerInfo.deliveryDate,
          delivery_time: customerInfo.deliveryTime || null,
          total_amount: totalAmount,
          notes: customerInfo.notes || null,
          status: "pending",
        },
      ])
      .select()
      .single()

    if (orderError) {
      console.error("[v0] Error creating order:", orderError)
      setError("Une erreur est survenue lors de la création de la commande")
      setSubmitting(false)
      return
    }

    // Create order items
    const orderItems = cart.map((item) => ({
      order_id: orderData.id,
      menu_item_id: item.id,
      menu_item_name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      subtotal: item.price * item.quantity,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      console.error("[v0] Error creating order items:", itemsError)
      setError("Une erreur est survenue lors de l'enregistrement des articles")
      setSubmitting(false)
      return
    }

    setLastOrder({
      cart: [...cart],
      customerInfo: { ...customerInfo },
      total: totalAmount,
    })
    setSuccess(true)
    setCart([])
    setCustomerInfo({
      name: "",
      phone: "",
      address: "",
      deliveryDate: getTodayDate(),
      deliveryTime: "",
      notes: "",
    })
    setShowCheckout(false)
    setSubmitting(false)
  }

  const handleCustomerInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCustomerInfo((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  // Scroll vers le message de succès quand la commande est validée
  useEffect(() => {
    if (success && successRef.current) {
      successRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [success])

  // Format menu date helper
  const formatMenuDate = (menuDate: string | null) => {
    if (!menuDate) return "Sans date"

    const date = new Date(menuDate + 'T00:00:00')
    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
    const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]
    const dayName = days[date.getDay()]
    const dayNumber = date.getDate()
    const monthName = months[date.getMonth()]

    return `${dayName} ${dayNumber} ${monthName}`
  }

  // Group items by menu_date
  const groupedMenu = menuItems.reduce(
    (acc, item) => {
      const dateKey = item.menu_date || "sans-date"
      if (!acc[dateKey]) acc[dateKey] = []
      acc[dateKey].push(item)
      return acc
    },
    {} as Record<string, MenuItem[]>,
  )

  // Sort dates
  const sortedDates = Object.keys(groupedMenu).sort()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#a6a6a6] to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-charmonman text-5xl md:text-6xl font-bold text-[#ff3131] mb-6 text-balance">Commander</h1>
          <p className="font-simonetta text-xl text-gray-700 text-pretty">
            Sélectionnez vos plats et passez votre commande en toute simplicité
          </p>
        </div>
      </section>

      {/* Success Message */}
      {success && (
        <section ref={successRef} className="py-8 px-4 bg-gradient-to-b from-green-50 to-white">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2 border-green-500 bg-gradient-to-br from-green-50 to-white shadow-xl">
              <CardContent className="pt-8 pb-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <span className="text-5xl text-white">✓</span>
                  </div>
                  <h3 className="font-charmonman text-4xl text-green-700 mb-3">Commande Enregistrée !</h3>
                  <p className="font-simonetta text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
                    Votre commande a bien été prise en compte. Pour accélérer le traitement, envoyez-nous les détails via WhatsApp ou SMS
                  </p>

                  {lastOrder && (
                    <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                      <Button
                        onClick={() => {
                          const orderDetails = lastOrder.cart.map((item) => `${item.quantity}x ${item.name}`).join(", ")
                          const whatsappMessage = encodeURIComponent(
                            `Bonjour, je viens de passer une commande sur Les P'tits Mijotés.\n\n` +
                            `Nom : ${lastOrder.customerInfo.name}\n` +
                            `Téléphone : ${lastOrder.customerInfo.phone}\n` +
                            `Adresse : ${lastOrder.customerInfo.address}\n` +
                            `Livraison : ${lastOrder.customerInfo.deliveryDate}${lastOrder.customerInfo.deliveryTime ? ` à ${lastOrder.customerInfo.deliveryTime}` : ""}\n\n` +
                            `Commande : ${orderDetails}\n` +
                            `Total : ${lastOrder.total.toFixed(2)}€\n\n` +
                            `${lastOrder.customerInfo.notes ? `Notes : ${lastOrder.customerInfo.notes}` : ""}`
                          )
                          window.open(`https://wa.me/33695601821?text=${whatsappMessage}`, "_blank")
                        }}
                        className="flex-1 bg-[#25D366] hover:bg-[#20BA5A] text-white font-simonetta text-base h-12 gap-2 shadow-md"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Envoyer via WhatsApp
                      </Button>

                      <Button
                        onClick={() => {
                          const orderDetails = lastOrder.cart.map((item) => `${item.quantity}x ${item.name}`).join(", ")
                          const smsMessage = encodeURIComponent(
                            `Bonjour, commande Les P'tits Mijotés. ` +
                            `Nom : ${lastOrder.customerInfo.name}. ` +
                            `Tél : ${lastOrder.customerInfo.phone}. ` +
                            `Livraison : ${lastOrder.customerInfo.deliveryDate}. ` +
                            `Commande : ${orderDetails}. ` +
                            `Total : ${lastOrder.total.toFixed(2)}€`
                          )
                          window.open(`sms:0695601821?body=${smsMessage}`, "_self")
                        }}
                        variant="outline"
                        className="flex-1 border-2 border-[#ff3131] text-[#ff3131] hover:bg-[#ff3131] hover:text-white font-simonetta text-base h-12 gap-2 shadow-md"
                      >
                        <Smartphone className="w-5 h-5" />
                        Envoyer par SMS
                      </Button>
                    </div>
                  )}

                  <p className="font-simonetta text-sm text-gray-500 mt-6">
                    💡 Cliquez sur l'un des boutons pour ouvrir votre application de messagerie
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Menu Items */}
            <div className="lg:col-span-2">
              {loading ? (
                <div className="text-center py-20">
                  <p className="font-simonetta text-lg text-gray-600">Chargement du menu...</p>
                </div>
              ) : menuItems.length === 0 ? (
                <div className="text-center py-20">
                  <p className="font-simonetta text-lg text-gray-600">Aucun menu disponible pour le moment.</p>
                </div>
              ) : (
                <div className="space-y-12">
                  {sortedDates.map((dateKey) => (
                    <div key={dateKey}>
                      <h2 className="font-charmonman text-3xl text-[#ff3131] mb-6">
                        {formatMenuDate(dateKey === "sans-date" ? null : dateKey)}
                      </h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        {groupedMenu[dateKey].map((item) => (
                          <Card key={item.id} className="border-2 hover:border-[#ff3131] transition-colors">
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <CardTitle className="font-charmonman text-2xl text-black">{item.name}</CardTitle>
                                  {item.category && (
                                    <Badge variant="outline" className="mt-2 font-simonetta">
                                      {item.category}
                                    </Badge>
                                  )}
                                </div>
                                <span className="font-charmonman text-2xl text-[#ff3131]">
                                  {item.price.toFixed(2)}€
                                </span>
                              </div>
                              {item.description && (
                                <CardDescription className="font-simonetta mt-2">
                                  {item.description}
                                </CardDescription>
                              )}
                            </CardHeader>
                            <CardContent>
                              <Button
                                onClick={() => addToCart(item)}
                                className="w-full bg-[#ff3131] hover:bg-[#ff3131]/90 text-white font-simonetta"
                              >
                                Ajouter au panier
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Sidebar */}
            <div className="lg:sticky lg:top-24 h-fit">
              <Card className="border-2 border-[#ff3131]">
                <CardHeader>
                  <CardTitle className="font-charmonman text-3xl text-[#ff3131] flex items-center gap-2">
                    <ShoppingCart className="w-8 h-8" />
                    Votre Panier
                  </CardTitle>
                  <CardDescription className="font-simonetta">
                    {cart.length === 0 ? "Votre panier est vide" : `${cart.length} article(s)`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {cart.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="font-simonetta text-gray-500">Ajoutez des plats à votre panier</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4 mb-6">
                        {cart.map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-4 pb-4 border-b">
                            <div className="flex-1">
                              <h4 className="font-simonetta font-semibold text-black">{item.name}</h4>
                              <p className="font-simonetta text-sm text-gray-600">{item.price.toFixed(2)}€</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon-sm"
                                onClick={() => updateQuantity(item.id, -1)}
                                className="border-2"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="font-simonetta font-semibold w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon-sm"
                                onClick={() => updateQuantity(item.id, 1)}
                                className="border-2"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-[#f5f5f5] p-4 rounded-lg mb-6">
                        <div className="flex justify-between items-center">
                          <span className="font-charmonman text-2xl text-black">Total</span>
                          <span className="font-charmonman text-3xl text-[#ff3131]">{totalAmount.toFixed(2)}€</span>
                        </div>
                      </div>

                      {!showCheckout ? (
                        <Button
                          onClick={() => setShowCheckout(true)}
                          className="w-full bg-[#ff3131] hover:bg-[#ff3131]/90 text-white font-simonetta text-lg h-12"
                        >
                          Passer la commande
                        </Button>
                      ) : (
                        <form onSubmit={handleSubmitOrder} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="font-simonetta">
                              Nom complet *
                            </Label>
                            <Input
                              id="name"
                              name="name"
                              value={customerInfo.name}
                              onChange={handleCustomerInfoChange}
                              required
                              className="font-simonetta"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone" className="font-simonetta">
                              Téléphone *
                            </Label>
                            <Input
                              id="phone"
                              name="phone"
                              type="tel"
                              value={customerInfo.phone}
                              onChange={handleCustomerInfoChange}
                              required
                              className="font-simonetta"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="address" className="font-simonetta">
                              Adresse de livraison *
                            </Label>
                            <Input
                              id="address"
                              name="address"
                              value={customerInfo.address}
                              onChange={handleCustomerInfoChange}
                              required
                              className="font-simonetta"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="deliveryDate" className="font-simonetta">
                              Date de livraison *
                            </Label>
                            <Input
                              id="deliveryDate"
                              name="deliveryDate"
                              type="date"
                              value={customerInfo.deliveryDate}
                              onChange={handleCustomerInfoChange}
                              required
                              className="font-simonetta"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="deliveryTime" className="font-simonetta">
                              Heure de livraison *
                            </Label>
                            <select
                              id="deliveryTime"
                              name="deliveryTime"
                              value={customerInfo.deliveryTime}
                              onChange={(e) => setCustomerInfo(prev => ({ ...prev, deliveryTime: e.target.value }))}
                              required
                              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-simonetta"
                            >
                              <option value="">Choisir une heure</option>
                              <optgroup label="Midi (12h - 14h)">
                                <option value="12:00">12:00</option>
                                <option value="12:15">12:15</option>
                                <option value="12:30">12:30</option>
                                <option value="12:45">12:45</option>
                                <option value="13:00">13:00</option>
                                <option value="13:15">13:15</option>
                                <option value="13:30">13:30</option>
                                <option value="13:45">13:45</option>
                                <option value="14:00">14:00</option>
                              </optgroup>
                              <optgroup label="Soir (19h - 23h)">
                                <option value="19:00">19:00</option>
                                <option value="19:15">19:15</option>
                                <option value="19:30">19:30</option>
                                <option value="19:45">19:45</option>
                                <option value="20:00">20:00</option>
                                <option value="20:15">20:15</option>
                                <option value="20:30">20:30</option>
                                <option value="20:45">20:45</option>
                                <option value="21:00">21:00</option>
                                <option value="21:15">21:15</option>
                                <option value="21:30">21:30</option>
                                <option value="21:45">21:45</option>
                                <option value="22:00">22:00</option>
                                <option value="22:15">22:15</option>
                                <option value="22:30">22:30</option>
                                <option value="22:45">22:45</option>
                                <option value="23:00">23:00</option>
                              </optgroup>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="notes" className="font-simonetta">
                              Notes / Instructions
                            </Label>
                            <Textarea
                              id="notes"
                              name="notes"
                              value={customerInfo.notes}
                              onChange={handleCustomerInfoChange}
                              rows={3}
                              className="font-simonetta"
                            />
                          </div>

                          {error && <p className="text-red-600 font-simonetta text-sm">{error}</p>}

                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowCheckout(false)}
                              className="flex-1 font-simonetta"
                            >
                              Retour
                            </Button>
                            <Button
                              type="submit"
                              disabled={submitting}
                              className="flex-1 bg-[#ff3131] hover:bg-[#ff3131]/90 text-white font-simonetta"
                            >
                              {submitting ? "Envoi..." : "Confirmer"}
                            </Button>
                          </div>
                        </form>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
