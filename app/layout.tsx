import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Charmonman, Simonetta } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const charmonman = Charmonman({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-charmonman",
})

const simonetta = Simonetta({
  weight: ["400", "900"],
  subsets: ["latin"],
  variable: "--font-simonetta",
})

export const metadata: Metadata = {
  title: "Les P'tits Mijotés - Cuisine et Traiteur Africain",
  description:
    "Traiteur et livraison de repas africains traditionnels. Buffets élégants pour particuliers, professionnels et événements.",
  icons: {
    icon: "/images/logo-web.svg",
    apple: "/images/logo-web.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${charmonman.variable} ${simonetta.variable}`}>
      <body className={`font-sans antialiased`}>
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  )
}
