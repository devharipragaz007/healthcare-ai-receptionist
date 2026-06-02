import {
  getAllDoctors,
  getDoctorById,
  getDoctorsBySpecialization,
} from "@/lib/repositories/doctor.repository"

export async function listDoctors() {
  return getAllDoctors()
}

export async function findDoctor(id: string) {
  return getDoctorById(id)
}

export async function listDoctorsBySpecialization(specialization: string) {
  return getDoctorsBySpecialization(specialization)
}

export async function getDoctorByName(name: string) {
  const all = await getAllDoctors()
  const search = name.toLowerCase()
  const match = all.find(
    (d) =>
      d.lastName.toLowerCase().includes(search) ||
      d.firstName.toLowerCase().includes(search) ||
      `${d.firstName} ${d.lastName}`.toLowerCase().includes(search),
  )
  return { match: match ?? null, all }
}
