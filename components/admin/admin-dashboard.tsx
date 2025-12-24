"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MenuManagement } from "@/components/admin/menu-management"
import { TestimonialsManagement } from "@/components/admin/testimonials-management"
import { EventsManagement } from "@/components/admin/events-management"
import { GalleryManagement } from "@/components/admin/gallery-management"
import { OrdersManagement } from "@/components/admin/orders-management"
import { HeroImagesManagement } from "@/components/admin/hero-images-management"
import { UsersManagement } from "@/components/admin/users-management"
import { useRouter } from "next/navigation"
import { LogOut, Menu, Calendar, Star, ImageIcon, ShoppingCart, Home, Users } from "lucide-react"
import Image from "next/image"

interface AdminDashboardProps {
  user: {
    id: string
    email: string
  }
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("home")

  const handleLogout = async () => {
    localStorage.removeItem("admin_session")
    router.push("/admin/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Image
              src="/images/logo.png"
              alt="Les P'tits Mijotés - Cuisine et Traiteur Africain"
              width={140}
              height={60}
              className="h-11 w-auto"
            />
            <div className="hidden md:block">
              <h1 className="text-xl font-bold">Administration</h1>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" className="gap-2 bg-transparent">
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-grid">
            <TabsTrigger value="home" className="gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Accueil</span>
            </TabsTrigger>
            <TabsTrigger value="menu" className="gap-2">
              <Menu className="h-4 w-4" />
              <span className="hidden sm:inline">Menu</span>
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="gap-2">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Avis</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Événements</span>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Galerie</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Commandes</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Utilisateurs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Images d&apos;Accueil</CardTitle>
                <CardDescription>
                  Gérez les images du carousel de la page d&apos;accueil. Les images défilent automatiquement toutes les 5 secondes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HeroImagesManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="menu" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion du Menu du Jour</CardTitle>
                <CardDescription>
                  Gérez les plats du menu quotidien. Vous pouvez ajouter, modifier ou supprimer des plats.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MenuManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testimonials" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Avis</CardTitle>
                <CardDescription>Importez les avis Google et sélectionnez ceux à afficher sur le site.</CardDescription>
              </CardHeader>
              <CardContent>
                <TestimonialsManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Événements</CardTitle>
                <CardDescription>
                  Créez et planifiez des événements. Ils s'afficheront automatiquement sur le site jusqu'à la date
                  définie.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EventsManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion de la Galerie</CardTitle>
                <CardDescription>
                  Ajoutez, modifiez ou supprimez des images de la galerie photo du site.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GalleryManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Commandes et Devis</CardTitle>
                <CardDescription>Consultez et gérez les commandes et demandes de devis reçues.</CardDescription>
              </CardHeader>
              <CardContent>
                <OrdersManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Utilisateurs</CardTitle>
                <CardDescription>Créez, modifiez ou supprimez des comptes administrateurs.</CardDescription>
              </CardHeader>
              <CardContent>
                <UsersManagement />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
