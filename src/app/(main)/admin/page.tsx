import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AdminClient } from "./admin-client"

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  if (session.user.role !== "admin" || session.user.email !== "seb.bouquet31@gmail.com") redirect("/dashboard")

  return <AdminClient />
}
