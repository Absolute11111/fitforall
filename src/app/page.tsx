import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Dumbbell, Timer, TrendingUp, Heart, Zap, Trophy, ArrowRight, ArrowUpRight, Quote } from "lucide-react"

const marqueeItems = ["100% POIDS DU CORPS", "ZÉRO COMPLÉMENT OBLIGATOIRE", "15 À 60 MINUTES", "TOUS NIVEAUX", "PROGRAMME EN 3 MIN"]

const benefits = [
  { icon: Timer, title: "Ton temps, pas l'inverse", desc: "15 à 60 minutes. Tu choisis la durée, on construit la séance autour." },
  { icon: Dumbbell, title: "Aucune salle requise", desc: "Au poids du corps par défaut. Une chaise et un tapis suffisent largement." },
  { icon: TrendingUp, title: "Tout est suivi", desc: "Poids, séances, énergie, progression — un seul endroit, zéro tableur." },
  { icon: Heart, title: "Bienveillant, point final", desc: "Aucune phrase culpabilisante. Tu avances à ton rythme, on s'adapte." },
  { icon: Zap, title: "Compléments en option", desc: "Whey, créatine : utiles si tu veux, jamais nécessaires pour progresser." },
  { icon: Trophy, title: "Le sport devient habitude", desc: "Streak, progression visible, petites victoires qui s'accumulent." },
]

const programs = [
  { n: "01", name: "Starter 15", level: "Débutant", duration: "15 min · 3x/sem", desc: "Full body doux. Zéro excuse possible." },
  { n: "02", name: "Home Muscle", level: "Intermédiaire", duration: "35 min · 4x/sem", desc: "Prise de muscle au poids du corps, surcharge progressive." },
  { n: "03", name: "Féminin — Galbe & Tonus", level: "Tous niveaux", duration: "30 min · 3-4x/sem", desc: "Fessiers, jambes, gainage. Recomposition ciblée." },
  { n: "04", name: "Sans Saut Appartement", level: "Tous niveaux", duration: "30 min · 4x/sem", desc: "Zéro bruit, zéro impact, résultats réels." },
]

const testimonials = [
  { name: "Léa M.", goal: "Perte de gras", text: "J'ai enfin trouvé un programme que je tiens vraiment. 15 minutes le matin et tout change." },
  { name: "Thomas R.", goal: "Prise de muscle", text: "Sans salle, sans whey, sans excuse. Huit semaines, des résultats visibles." },
  { name: "Camille B.", goal: "Recomposition", text: "L'app qui n'essaie pas de me vendre des compléments à chaque page. Enfin." },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Marquee strip */}
      <div className="bg-primary text-primary-foreground overflow-hidden py-2 border-b border-border">
        <div className="flex whitespace-nowrap marquee-track w-fit">
          {[...Array(2)].map((_, rep) => (
            <div key={rep} className="flex shrink-0">
              {marqueeItems.map((item) => (
                <span key={item} className="font-display text-sm tracking-wider px-6 flex items-center gap-6">
                  {item} <span className="text-base">●</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl tracking-wide normal-case">FitForAll</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-display tracking-wide text-base normal-case">Connexion</Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="font-display tracking-wide text-base rounded-none px-5 normal-case">Commencer →</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — asymmetric, oversized type */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-9">
            <h1 className="font-display leading-[0.85] text-[15vw] sm:text-[9rem] lg:text-[8rem] xl:text-[9.5rem]">
              TON SPORT.
              <br />
              <span className="text-primary">TES RÈGLES.</span>
            </h1>
          </div>
          <div className="lg:col-span-3 pb-3">
            <p className="text-lg text-muted-foreground leading-relaxed normal-case font-sans">
              Un programme personnalisé en moins de 3 minutes. Poids du corps, sans complément obligatoire,
              adapté à ton niveau et ton temps disponible.
            </p>
            <div className="flex flex-col gap-3 mt-6">
              <Link href="/register">
                <Button size="lg" className="font-display tracking-wide text-lg rounded-none w-full h-14 normal-case gap-2">
                  Obtenir mon programme <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Big stat strip — typographic, no cards */}
      <section className="border-y border-border">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-3 divide-x divide-border">
          {[
            { val: "55", label: "Exercices référencés" },
            { val: "12", label: "Programmes prêts" },
            { val: "0€", label: "Complément requis" },
          ].map((s) => (
            <div key={s.label} className="py-8 sm:py-12 px-3 sm:px-8">
              <div className="font-display text-5xl sm:text-7xl text-primary leading-none">{s.val}</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-2 normal-case font-sans">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits — alternating editorial rows */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <h2 className="font-display text-4xl sm:text-6xl mb-16">POURQUOI FITFORALL</h2>
          <div className="divide-y divide-border">
            {benefits.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-10 py-7 ${i % 2 === 1 ? "sm:flex-row-reverse sm:text-right" : ""}`}>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className={`flex-1 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 ${i % 2 === 1 ? "sm:flex-row-reverse" : ""}`}>
                  <h3 className="font-display text-2xl sm:text-3xl normal-case shrink-0 sm:w-80">{title}</h3>
                  <p className="text-muted-foreground normal-case font-sans text-base leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs — catalog style */}
      <section id="programs" className="py-20 sm:py-28 bg-secondary/20 border-y border-border">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <h2 className="font-display text-4xl sm:text-6xl">PROGRAMMES</h2>
            <p className="text-muted-foreground text-sm normal-case font-sans max-w-xs">
              Extrait du catalogue. Le bon programme t'est assigné automatiquement à l'inscription.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border">
            {programs.map((p) => (
              <div key={p.n} className="bg-background p-7 sm:p-9 group hover:bg-primary/5 transition-colors">
                <div className="flex items-start justify-between mb-6">
                  <span className="font-display text-5xl text-primary/40 group-hover:text-primary transition-colors">{p.n}</span>
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </div>
                <h3 className="font-display text-2xl normal-case mb-1">{p.name}</h3>
                <p className="text-xs text-primary font-medium normal-case font-sans mb-3">{p.level} · {p.duration}</p>
                <p className="text-sm text-muted-foreground normal-case font-sans leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supplements — bold statement */}
      <section className="py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <p className="text-primary font-display text-sm tracking-[0.3em] mb-4">UNE PRÉCISION IMPORTANTE</p>
          <h2 className="font-display text-4xl sm:text-6xl leading-[0.95] mb-8">
            LA WHEY ET LA CRÉATINE NE SONT <span className="text-accent">JAMAIS</span> OBLIGATOIRES
          </h2>
          <p className="text-lg text-muted-foreground normal-case font-sans leading-relaxed max-w-2xl mx-auto">
            FitForAll fonctionne à 100% sans compléments alimentaires. La whey est une option pratique
            pour atteindre tes apports en protéines. La créatine peut aider la performance.
            Ni l'une ni l'autre ne sont nécessaires pour progresser.
          </p>
        </div>
      </section>

      {/* Testimonials — big quotes, alternating alignment */}
      <section className="py-20 sm:py-28 border-t border-border">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 space-y-16">
          {testimonials.map((t, i) => (
            <div key={t.name} className={`flex flex-col gap-3 ${i % 2 === 1 ? "items-end text-right" : "items-start text-left"}`}>
              <Quote className="w-8 h-8 text-primary/40" />
              <p className="font-display text-2xl sm:text-3xl normal-case leading-snug max-w-2xl">"{t.text}"</p>
              <p className="text-sm text-muted-foreground normal-case font-sans">
                <span className="text-foreground font-semibold">{t.name}</span> · {t.goal}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA — full bleed bold block */}
      <section className="bg-primary text-primary-foreground py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="font-display text-5xl sm:text-7xl leading-[0.9] mb-8">
            PRÊT À COMMENCER ?
          </h2>
          <p className="text-lg normal-case font-sans mb-10 opacity-80 max-w-xl mx-auto">
            Gratuit, sans carte bancaire. Réponds à quelques questions, obtiens ton programme.
          </p>
          <Link href="/register">
            <Button size="lg" variant="outline" className="font-display tracking-wide text-lg rounded-none h-14 px-10 normal-case gap-2 bg-primary-foreground text-primary border-primary-foreground hover:bg-primary-foreground/90">
              Je veux mon programme <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-display text-xl normal-case">
            <Dumbbell className="w-4 h-4 text-primary" />
            FitForAll
          </div>
          <p className="text-xs text-muted-foreground normal-case font-sans">Le sport accessible à tous. Aucun complément obligatoire.</p>
        </div>
      </footer>
    </div>
  )
}
