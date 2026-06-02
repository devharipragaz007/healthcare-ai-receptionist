import { prisma } from "@/lib/prisma"

export async function getAllPatients() {
  return prisma.patient.findMany({
    orderBy: { lastName: "asc" },
  })
}

export async function getPatientById(id: string) {
  return prisma.patient.findUnique({
    where: { id },
    include: {
      appointments: { orderBy: { scheduledAt: "desc" } },
      visits: { orderBy: { createdAt: "desc" } },
    },
  })
}

export async function getPatientByEmail(email: string) {
  return prisma.patient.findUnique({ where: { email } })
}

export async function countPatients() {
  return prisma.patient.count()
}
