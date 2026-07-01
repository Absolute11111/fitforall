import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "admin" || session.user.email !== "seb.bouquet31@gmail.com") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [
    userCount,
    exerciseCount,
    programCount,
    workoutLogCount,
    activeThisWeek,
    users,
    recentActivity,
    exercisesByLevel,
    programsByGoal,
    newUsersThisWeek,
  ] = await Promise.all([
    db.user.count(),
    db.exercise.count(),
    db.program.count(),
    db.workoutLog.count(),
    db.workoutLog.groupBy({
      by: ["userId"],
      where: { completedAt: { gte: oneWeekAgo } },
    }).then((r) => r.length),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        profile: { select: { goals: true, level: true, sessionsPerWeek: true } },
        _count: { select: { workoutLogs: true } },
        workoutLogs: {
          orderBy: { completedAt: "desc" },
          take: 1,
          select: { completedAt: true, durationMin: true, rpe: true },
        },
      },
    }),
    db.workoutLog.findMany({
      orderBy: { completedAt: "desc" },
      take: 25,
      select: {
        id: true,
        completedAt: true,
        durationMin: true,
        rpe: true,
        user: { select: { name: true, email: true } },
        programSession: {
          select: {
            sessionName: true,
            program: { select: { name: true } },
          },
        },
      },
    }),
    db.exercise.groupBy({ by: ["level"], _count: true }),
    db.program.groupBy({ by: ["goal"], _count: true }),
    db.user.count({ where: { createdAt: { gte: oneWeekAgo } } }),
  ])

  return NextResponse.json({
    stats: { userCount, exerciseCount, programCount, workoutLogCount, activeThisWeek, newUsersThisWeek },
    users,
    recentActivity,
    exercisesByLevel,
    programsByGoal,
    fetchedAt: new Date().toISOString(),
  })
}
