# FitForAll 🏋️

Application web de sport inclusive, motivante et personnalisée. Programmes au poids du corps, suivi de progression, nutrition — sans compléments alimentaires obligatoires.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS 4** + **shadcn/ui** + Lucide Icons
- **Neon PostgreSQL** (serverless)
- **Prisma 7** ORM (avec `@prisma/adapter-pg`)
- **Zod** + **React Hook Form**
- **NextAuth v5** (credentials / email+mot de passe)
- **Recharts** pour les graphiques de progression
- **Vercel** pour le déploiement

## Installation locale

```bash
npm install
```

### 1. Variables d'environnement

Copie `.env` et renseigne :

```env
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/fitforall?sslmode=require"
AUTH_SECRET="génère avec: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

Crée une base sur [neon.tech](https://neon.tech) (gratuit) et copie la connection string.

### 2. Base de données

```bash
npm run db:push     # synchronise le schéma Prisma avec Neon
npm run db:seed      # insère 55 exercices et 12 programmes
```

### 3. Lancer en local

```bash
npm run dev
```

→ http://localhost:3000

## Scripts utiles

| Commande | Description |
|---|---|
| `npm run dev` | Lance le serveur de développement |
| `npm run build` | Build de production |
| `npm run db:push` | Synchronise le schéma Prisma → Neon |
| `npm run db:seed` | Seed les exercices et programmes |
| `npm run db:studio` | Ouvre Prisma Studio (admin BDD visuel) |

## Architecture

```
src/
  app/
    (auth)/login, register        — pages d'authentification
    (main)/dashboard, programs,   — pages protégées (avec navbar)
           workout/[id], progress,
           nutrition, exercises,
           settings, admin
    api/                          — routes API (register, onboarding, settings...)
    onboarding/                   — questionnaire post-inscription
    page.tsx                      — landing page publique
  components/
    ui/                           — composants shadcn/ui
    layout/navbar.tsx
  lib/
    auth.ts                       — config NextAuth
    db.ts                         — client Prisma
    nutrition.ts                  — calculs calories/protéines/IMC
  data/
    exercises.ts                  — 55 exercices seed
    programs.ts                   — 12 programmes seed (dont 2 spécial féminin)
  schemas/                        — schémas Zod (validation forms + API)
  types/                          — types partagés + labels FR
prisma/
  schema.prisma                   — modèle de données
  seed.ts                         — script de seed
```

## Modèle de données

Tables principales : `users`, `profiles`, `exercises`, `programs`, `program_sessions`,
`program_exercises`, `user_programs`, `workout_logs`, `measurements`, `supplement_preferences`.

## Règles métier clés

- Le sport fonctionne **sans whey ni créatine** — toujours présentés comme optionnels.
- Chaque programme propose un niveau, un objectif et une durée de séance adaptés.
- Le poids actuel/cible sert au suivi de progression, jamais à culpabiliser.
- 2 programmes dédiés "Féminin" (fessiers/galbe/recomposition) avec exercices ciblés.

## Déploiement sur Vercel

1. Pousse le repo sur GitHub :
   ```bash
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```
2. Importe le repo sur [vercel.com/new](https://vercel.com/new)
3. Ajoute les variables d'environnement (`DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL` → ton domaine Vercel)
4. Déploie — Vercel build automatiquement avec `npm run build`

### Compte admin

L'email `admin@fitforall.com` a accès à `/admin`. Modifie `ADMIN_EMAILS` dans
`src/app/(main)/admin/page.tsx` pour changer ça.

## Critères d'acceptation ✅

- [x] Le site se lance localement sans erreur
- [x] La BDD Neon se connecte via `DATABASE_URL`
- [x] L'onboarding sauvegarde un profil et assigne un programme
- [x] Le dashboard affiche poids actuel/cible, progression, séance du jour
- [x] Une séance peut être terminée et enregistrée (avec RPE)
- [x] La progression affiche un graphique Recharts
- [x] Le site est responsive mobile (navbar burger, grids adaptatifs)
- [x] La whey/créatine sont présentées comme options, jamais comme obligation
