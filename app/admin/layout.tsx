import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Administration - Les P'tits Mijotés",
  description: "Panneau d'administration",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-gray-50">{children}</div>
}
