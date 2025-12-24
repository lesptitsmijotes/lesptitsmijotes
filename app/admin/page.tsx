"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<{id: string, username: string, email: string} | null>(null)

  useEffect(() => {
    const sessionData = localStorage.getItem("admin_session")
    if (!sessionData) {
      router.push("/admin/login")
      return
    }

    try {
      const userData = JSON.parse(sessionData)
      setUser(userData)
    } catch {
      router.push("/admin/login")
    }
  }, [router])

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center">Chargement...</div>
  }

  return <AdminDashboard user={{ id: user.id, email: user.email }} />
}
