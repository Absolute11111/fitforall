"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { LogOut, Menu, X, ShieldCheck } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/programs", label: "Programmes" },
  { href: "/exercises", label: "Exercices" },
  { href: "/progress", label: "Progression" },
  { href: "/history", label: "Historique" },
  { href: "/nutrition", label: "Nutrition" },
  { href: "/equipment", label: "Équipement" },
  { href: "/settings", label: "Réglages" },
]

export function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between gap-4">

        {/* Wordmark */}
        <Link href="/dashboard" className="shrink-0">
          <span
            className="font-display italic font-light text-xl text-primary"
            style={{ letterSpacing: "0.04em" }}
          >
            FitForAll
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-3 py-1.5 text-xs tracking-widest uppercase transition-colors",
                pathname.startsWith(href)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              {label}
              {pathname.startsWith(href) && (
                <span className="block h-px bg-primary mt-0.5 w-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {session?.user?.role === "admin" && (
            <Link
              href="/admin"
              className="hidden lg:flex items-center gap-1.5 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="hidden lg:flex items-center gap-1.5 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
          <button
            className="lg:hidden w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden border-t border-border bg-background px-5 py-4 flex flex-col gap-0.5">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                "px-3 py-2.5 text-xs tracking-widest uppercase transition-colors border-b border-border/50 last:border-b-0",
                pathname.startsWith(href)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              {label}
            </Link>
          ))}
          {session?.user?.role === "admin" && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors border-t border-border mt-1 pt-3"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 px-3 py-2.5 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Déconnexion
          </button>
        </div>
      )}
    </header>
  )
}
