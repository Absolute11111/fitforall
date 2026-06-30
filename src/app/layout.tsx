import type { Metadata } from "next"
import { Bebas_Neue, Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"

const display = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-display" })
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "FitForAll — Ton programme sport personnalisé",
  description: "Application de sport inclusive, motivante et personnalisée. Programmes au poids du corps, suivi progression, nutrition. Pour tous les niveaux.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${jakarta.variable} dark`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

