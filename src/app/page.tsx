import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"

const stats = [
  { val: "15 000+", label: "Exercices référencés" },
  { val: "12", label: "Programmes ciblés" },
  { val: "0 €", label: "Équipement requis" },
]

const principles = [
  {
    n: "01",
    title: "Aucune salle. Aucune excuse.",
    body: "Le poids de ton corps est suffisant. Une chaise et un tapis ouvrent l'accès à l'intégralité du catalogue d'exercices.",
  },
  {
    n: "02",
    title: "Ton temps, tes règles.",
    body: "15 à 60 minutes selon ta journée. Le programme se construit autour de toi, jamais l'inverse.",
  },
  {
    n: "03",
    title: "Zéro complément obligatoire.",
    body: "La whey et la créatine peuvent t'aider. Elles ne sont jamais nécessaires. FitForAll ne te vendra rien.",
  },
  {
    n: "04",
    title: "Progression mesurée.",
    body: "Chaque séance enregistrée. Chaque record noté. La progression devient visible, donc motivante.",
  },
]

const programs = [
  { n: "01", name: "Starter 15", meta: "Débutant · 15 min · 3×/sem", desc: "L'entrée parfaite. Full body progressif, zéro charge." },
  { n: "02", name: "Home Muscle", meta: "Intermédiaire · 35 min · 4×/sem", desc: "Hypertrophie au poids du corps avec surcharge progressive." },
  { n: "03", name: "Galbe & Tonus", meta: "Tous niveaux · 30 min · 3–4×/sem", desc: "Fessiers, jambes, gainage. Recomposition ciblée." },
  { n: "04", name: "Sans Saut Appart", meta: "Tous niveaux · 30 min · 4×/sem", desc: "Zéro bruit, zéro impact. Résultats réels en appartement." },
]

const testimonials = [
  { quote: "J'ai enfin trouvé un programme que je tiens vraiment. Quinze minutes le matin et tout change.", author: "Léa M.", context: "Perte de gras" },
  { quote: "Sans salle, sans whey, sans excuse. Huit semaines, des résultats visibles.", author: "Thomas R.", context: "Prise de muscle" },
  { quote: "L'app qui n'essaie pas de me vendre des compléments à chaque écran. Enfin.", author: "Camille B.", context: "Recomposition" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── Header ───────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 h-14 flex items-center justify-between">
          <span
            className="font-display italic text-xl sm:text-2xl font-light tracking-wide text-primary select-none"
            style={{ letterSpacing: "0.05em" }}
          >
            FitForAll
          </span>
          <nav className="flex items-center gap-6 sm:gap-8">
            <Link
              href="/login"
              className="text-xs tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="text-xs tracking-widest uppercase text-primary border border-primary px-4 py-1.5 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Commencer
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="min-h-screen flex flex-col justify-end pb-16 sm:pb-20 pt-32 sm:pt-40 px-6 sm:px-10 max-w-7xl mx-auto">
        <div className="mb-10 sm:mb-12">
          <p className="label-caps mb-6 sm:mb-8">Sport · Tous niveaux · Poids du corps</p>
          <h1
            className="font-display font-light italic leading-[0.85] text-foreground"
            style={{ fontSize: "clamp(3.5rem, 11vw, 9rem)", letterSpacing: "-0.02em" }}
          >
            Performance
            <br />
            <span style={{ paddingLeft: "clamp(1rem, 6vw, 5rem)" }}>sans</span>
            <br />
            compromis.
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 border-t border-border pt-8">
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-sm">
            Programme personnalisé en 3 minutes. Sans équipement obligatoire, sans compléments imposés, pour tous les niveaux.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 shrink-0">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-xs tracking-widest uppercase px-6 py-3 hover:bg-primary/90 transition-colors font-medium"
            >
              Créer mon programme <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="#programs"
              className="inline-flex items-center gap-2 border border-border text-xs tracking-widest uppercase px-6 py-3 text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            >
              Voir les programmes
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────── */}
      <section className="border-y border-border">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 grid grid-cols-3 divide-x divide-border">
          {stats.map((s) => (
            <div key={s.label} className="py-8 sm:py-14 px-4 sm:px-10">
              <div
                className="font-display font-light text-primary leading-none mb-2"
                style={{ fontSize: "clamp(1.8rem, 4vw, 3.5rem)" }}
              >
                {s.val}
              </div>
              <div className="label-caps">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Principes ────────────────────────────────────── */}
      <section className="py-24 sm:py-36 px-6 sm:px-10 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-14 gap-4">
          <h2
            className="font-display font-light italic"
            style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)" }}
          >
            L'approche
          </h2>
          <p className="label-caps sm:text-right">Ce qui nous différencie</p>
        </div>
        <div className="divide-y divide-border">
          {principles.map(({ n, title, body }) => (
            <div key={n} className="grid grid-cols-12 gap-4 sm:gap-8 py-8 sm:py-10 group">
              <div className="col-span-1 sm:col-span-1">
                <span className="label-caps text-muted-foreground/50">{n}</span>
              </div>
              <div className="col-span-11 sm:col-span-5">
                <h3 className="font-display font-light text-xl sm:text-2xl leading-tight">{title}</h3>
              </div>
              <div className="col-span-12 sm:col-span-6 sm:pl-4">
                <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Programmes ───────────────────────────────────── */}
      <section id="programs" className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-24 sm:py-36">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-14 gap-4">
            <h2
              className="font-display font-light italic"
              style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)" }}
            >
              Programmes
            </h2>
            <p className="label-caps sm:text-right max-w-xs">
              Sélection automatique à l'inscription selon tes objectifs
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border border border-border">
            {programs.map((p) => (
              <div key={p.n} className="p-7 sm:p-10 flex flex-col gap-6 group hover:bg-white/[0.02] transition-colors border-b border-border last:border-b-0 sm:[&:nth-child(1)]:border-b sm:[&:nth-child(2)]:border-b sm:[&:nth-child(3)]:border-b-0 sm:[&:nth-child(4)]:border-b-0">
                <div className="flex items-start justify-between">
                  <span className="font-display font-light text-4xl sm:text-5xl text-primary/20 group-hover:text-primary/60 transition-colors">
                    {p.n}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-primary/20 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <div>
                  <h3 className="font-display font-light text-xl sm:text-2xl mb-1">{p.name}</h3>
                  <p className="label-caps mb-3">{p.meta}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Statement ────────────────────────────────────── */}
      <section className="border-t border-border py-24 sm:py-36">
        <div className="max-w-4xl mx-auto px-6 sm:px-10 text-center">
          <p className="label-caps mb-10">Une précision importante</p>
          <p
            className="font-display font-light italic leading-[0.9] text-foreground"
            style={{ fontSize: "clamp(2rem, 5.5vw, 4.5rem)" }}
          >
            La whey et la créatine ne sont{" "}
            <em className="not-italic underline underline-offset-4">jamais</em>{" "}
            obligatoires pour progresser.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed mt-10 max-w-xl mx-auto">
            FitForAll fonctionne à 100% sans compléments alimentaires. Nous ne te vendrons rien.
            La progression vient de la régularité et d'un programme adapté — c'est tout.
          </p>
        </div>
      </section>

      {/* ── Témoignages ──────────────────────────────────── */}
      <section className="border-t border-border py-24 sm:py-36 px-6 sm:px-10 max-w-5xl mx-auto space-y-16 sm:space-y-20">
        <p className="label-caps">Témoignages</p>
        {testimonials.map((t, i) => (
          <div
            key={t.author}
            className={`flex flex-col gap-4 ${i % 2 === 1 ? "items-end text-right" : "items-start text-left"}`}
          >
            <p
              className="font-display font-light italic leading-snug text-foreground max-w-2xl"
              style={{ fontSize: "clamp(1.4rem, 3vw, 2.2rem)" }}
            >
              &ldquo;{t.quote}&rdquo;
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground">{t.author}</span>
              <span className="mx-2 text-border">·</span>
              {t.context}
            </p>
          </div>
        ))}
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-24 sm:py-36">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-20 items-end">
            <div>
              <h2
                className="font-display font-light italic leading-[0.88]"
                style={{ fontSize: "clamp(2.8rem, 7vw, 6rem)" }}
              >
                Prêt à commencer ?
              </h2>
            </div>
            <div className="flex flex-col gap-5">
              <p className="text-muted-foreground text-sm leading-relaxed">
                Gratuit, sans carte bancaire. Réponds à quelques questions et obtiens ton programme en moins de 3 minutes.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-3 bg-primary text-primary-foreground text-xs tracking-widest uppercase px-8 py-4 w-fit hover:bg-primary/90 transition-colors font-medium"
              >
                Je veux mon programme <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/login" className="text-xs tracking-wider text-muted-foreground hover:text-primary transition-colors">
                Déjà un compte ? Connexion →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="font-display italic font-light text-lg text-primary/80">FitForAll</span>
          <p className="label-caps">Le sport, accessible à tous.</p>
        </div>
      </footer>

    </div>
  )
}
