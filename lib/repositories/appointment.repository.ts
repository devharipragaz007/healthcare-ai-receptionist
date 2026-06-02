import { prisma } from "@/lib/prisma"

export async function createAppointment(data: {
  patientId: string
  doctorId: string
  scheduledAt: Date
  reason: string
}) {
  return prisma.appointment.create({
    data: { ...data, status: "BOOKED" },
    include: { patient: true, doctor: true },
  })
}

export async function updateAppointmentSchedule(
  id: string,
  scheduledAt: Date,
) {
  return prisma.appointment.update({
    where: { id },
    data: { scheduledAt, status: "RESCHEDULED" },
    include: { patient: true, doctor: true },
  })
}

export async function cancelAppointment(id: string) {
  return prisma.appointment.update({
    where: { id },
    data: { status: "CANCELLED" },
    include: { patient: true, doctor: true },
  })
}

export async function getAllAppointments() {
  return prisma.appointment.findMany({
    include: { patient: true, doctor: true },
    orderBy: { scheduledAt: "desc" },
  })
}

export async function getAppointmentById(id: string) {
  return prisma.appointment.findUnique({
    where: { id },
    include: { patient: true, doctor: true, visit: true },
  })
}

export async function getUpcomingAppointments() {
  return prisma.appointment.findMany({
    where: {
      status: "BOOKED",
      scheduledAt: { gte: new Date() },
    },
    include: { patient: true, doctor: true },
    orderBy: { scheduledAt: "asc" },
  })
}

export async function getCompletedAppointments() {
  return prisma.appointment.findMany({
    where: { status: "COMPLETED" },
    include: { patient: true, doctor: true, visit: true },
    orderBy: { scheduledAt: "desc" },
  })
}

export async function getAppointmentsByPatientId(patientId: string) {
  return prisma.appointment.findMany({
    where: { patientId },
    include: { doctor: true, visit: true },
    orderBy: { scheduledAt: "desc" },
  })
}

export async function getAppointmentsByDoctorId(doctorId: string) {
  return prisma.appointment.findMany({
    where: { doctorId },
    include: { patient: true, visit: true },
    orderBy: { scheduledAt: "desc" },
  })
}

export async function getDoctorAppointments(doctorId: string) {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  return prisma.appointment.findMany({
    where: {
      doctorId,
      status: { in: ["BOOKED", "RESCHEDULED"] },
      scheduledAt: { gte: startOfToday },
    },
    include: { patient: true },
    orderBy: { scheduledAt: "asc" },
  })
}

export async function markAppointmentCompleted(id: string) {
  return prisma.appointment.update({
    where: { id },
    data: { status: "COMPLETED" },
    include: { patient: true, doctor: true },
  })
}

export async function countAppointments() {
  return prisma.appointment.count()
}
