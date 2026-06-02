import { prisma } from "@/lib/prisma"

export async function getAllVisits() {
  return prisma.visit.findMany({
    include: { patient: true, appointment: { include: { doctor: true } } },
    orderBy: { createdAt: "desc" },
  })
}

export async function getVisitById(id: string) {
  return prisma.visit.findUnique({
    where: { id },
    include: { patient: true, appointment: { include: { doctor: true } } },
  })
}

export async function getVisitByAppointmentId(appointmentId: string) {
  return prisma.visit.findUnique({
    where: { appointmentId },
    include: { patient: true, appointment: { include: { doctor: true } } },
  })
}

export async function getPatientVisits(patientId: string) {
  return prisma.visit.findMany({
    where: { patientId },
    include: { appointment: { include: { doctor: true } } },
    orderBy: { createdAt: "desc" },
  })
}

export async function createVisit(data: {
  patientId: string
  appointmentId: string
  notes: string
}) {
  return prisma.visit.create({
    data,
    include: { patient: true, appointment: { include: { doctor: true } } },
  })
}

export async function updateVisitNotes(id: string, notes: string) {
  return prisma.visit.update({
    where: { id },
    data: { notes },
    include: { patient: true, appointment: { include: { doctor: true } } },
  })
}

export async function updateVisitSummary(id: string, summary: string) {
  return prisma.visit.update({
    where: { id },
    data: { summary },
    include: { patient: true, appointment: { include: { doctor: true } } },
  })
}

export async function getRecentVisitsForDoctor(doctorId: string, limit = 10) {
  return prisma.visit.findMany({
    where: {
      appointment: { doctorId },
    },
    include: {
      patient: true,
      appointment: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

export async function countVisits() {
  return prisma.visit.count()
}
