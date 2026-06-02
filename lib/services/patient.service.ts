import {
  getAllPatients,
  getPatientById,
  getPatientByEmail as repoGetPatientByEmail,
} from "@/lib/repositories/patient.repository"

export async function listPatients() {
  return getAllPatients()
}

export async function findPatient(id: string) {
  return getPatientById(id)
}

export async function findPatientByEmail(email: string) {
  return repoGetPatientByEmail(email)
}

export async function getPatientByEmail(email: string) {
  return repoGetPatientByEmail(email)
}
