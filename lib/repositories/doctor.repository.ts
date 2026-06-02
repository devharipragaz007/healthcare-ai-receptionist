import { prisma } from "@/lib/prisma"

export async function getAllDoctors() {
  return prisma.doctor.findMany({
    orderBy: { lastName: "asc" },
  })
}

export async function getDoctorByEmail(email: string) {
  return prisma.doctor.findUnique({
    where: { email },
  })
}

export async function getDoctorById(id: string) {
  return prisma.doctor.findUnique({
    where: { id },
    include: {
      appointments: { orderBy: { scheduledAt: "desc" } },
    },
  })
}

export async function getDoctorsBySpecialization(specialization: string) {
  return prisma.doctor.findMany({
    where: { specialization },
    orderBy: { lastName: "asc" },
  })
}

export async function countDoctors() {
  return prisma.doctor.count()
}
