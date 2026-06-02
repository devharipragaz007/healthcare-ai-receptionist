import path from "path"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaClient } from "../app/generated/prisma/client"

function createClient() {
  const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db"
  const dbPath = path.resolve(process.cwd(), dbUrl.replace(/^file:/, ""))
  const adapter = new PrismaBetterSqlite3({ url: dbPath })
  return new PrismaClient({ adapter })
}

const prisma = createClient()

async function main() {
  // Doctors
  const [drKumar, drPatel, drLee] = await Promise.all([
    prisma.doctor.create({
      data: {
        firstName: "Anika",
        lastName: "Kumar",
        specialization: "Cardiology",
        email: "a.kumar@healthclinic.com",
      },
    }),
    prisma.doctor.create({
      data: {
        firstName: "Raj",
        lastName: "Patel",
        specialization: "General Medicine",
        email: "r.patel@healthclinic.com",
      },
    }),
    prisma.doctor.create({
      data: {
        firstName: "Soo-Jin",
        lastName: "Lee",
        specialization: "Dermatology",
        email: "s.lee@healthclinic.com",
      },
    }),
  ])

  // Patients
  const patients = await Promise.all([
    prisma.patient.create({
      data: {
        firstName: "James",
        lastName: "Harrington",
        email: "james.harrington@email.com",
        phone: "555-201-3847",
        dateOfBirth: new Date("1978-04-12"),
      },
    }),
    prisma.patient.create({
      data: {
        firstName: "Maria",
        lastName: "Santos",
        email: "maria.santos@email.com",
        phone: "555-374-9210",
        dateOfBirth: new Date("1985-09-23"),
      },
    }),
    prisma.patient.create({
      data: {
        firstName: "David",
        lastName: "Okonkwo",
        email: "david.okonkwo@email.com",
        phone: "555-482-6731",
        dateOfBirth: new Date("1962-01-07"),
      },
    }),
    prisma.patient.create({
      data: {
        firstName: "Sarah",
        lastName: "Mitchell",
        email: "sarah.mitchell@email.com",
        phone: "555-519-0284",
        dateOfBirth: new Date("1990-07-15"),
      },
    }),
    prisma.patient.create({
      data: {
        firstName: "Carlos",
        lastName: "Rivera",
        email: "carlos.rivera@email.com",
        phone: "555-638-4502",
        dateOfBirth: new Date("1955-11-30"),
      },
    }),
    prisma.patient.create({
      data: {
        firstName: "Emily",
        lastName: "Nguyen",
        email: "emily.nguyen@email.com",
        phone: "555-742-8163",
        dateOfBirth: new Date("1998-03-08"),
      },
    }),
    prisma.patient.create({
      data: {
        firstName: "Robert",
        lastName: "Kowalski",
        email: "robert.kowalski@email.com",
        phone: "555-856-3920",
        dateOfBirth: new Date("1970-06-22"),
      },
    }),
    prisma.patient.create({
      data: {
        firstName: "Priya",
        lastName: "Sharma",
        email: "priya.sharma@email.com",
        phone: "555-923-7415",
        dateOfBirth: new Date("1988-12-04"),
      },
    }),
    prisma.patient.create({
      data: {
        firstName: "Thomas",
        lastName: "Anderson",
        email: "thomas.anderson@email.com",
        phone: "555-047-5839",
        dateOfBirth: new Date("1943-08-18"),
      },
    }),
    prisma.patient.create({
      data: {
        firstName: "Fatima",
        lastName: "Al-Hassan",
        email: "fatima.alhassan@email.com",
        phone: "555-164-2076",
        dateOfBirth: new Date("2002-05-27"),
      },
    }),
  ])

  const [
    james,
    maria,
    david,
    sarah,
    carlos,
    emily,
    robert,
    priya,
    thomas,
    fatima,
  ] = patients

  // Appointments: 5 completed, 2 cancelled, 1 rescheduled, 7 upcoming (booked)
  const apptJamesCompleted = await prisma.appointment.create({
    data: {
      patientId: james.id,
      doctorId: drKumar.id,
      scheduledAt: new Date("2026-05-15T09:00:00Z"),
      status: "COMPLETED",
      reason: "Annual cardiac checkup and ECG review",
    },
  })

  const apptMariaCompleted = await prisma.appointment.create({
    data: {
      patientId: maria.id,
      doctorId: drPatel.id,
      scheduledAt: new Date("2026-05-20T10:30:00Z"),
      status: "COMPLETED",
      reason: "Persistent headache and fatigue evaluation",
    },
  })

  const apptDavidCompleted = await prisma.appointment.create({
    data: {
      patientId: david.id,
      doctorId: drKumar.id,
      scheduledAt: new Date("2026-05-22T14:00:00Z"),
      status: "COMPLETED",
      reason: "Follow-up after heart palpitation episode",
    },
  })

  const apptSarahCompleted = await prisma.appointment.create({
    data: {
      patientId: sarah.id,
      doctorId: drLee.id,
      scheduledAt: new Date("2026-05-25T11:00:00Z"),
      status: "COMPLETED",
      reason: "Skin rash assessment and allergy review",
    },
  })

  const apptCarlosCompleted = await prisma.appointment.create({
    data: {
      patientId: carlos.id,
      doctorId: drPatel.id,
      scheduledAt: new Date("2026-05-28T15:30:00Z"),
      status: "COMPLETED",
      reason: "Diabetes management and medication review",
    },
  })

  await prisma.appointment.create({
    data: {
      patientId: emily.id,
      doctorId: drLee.id,
      scheduledAt: new Date("2026-05-18T09:30:00Z"),
      status: "CANCELLED",
      reason: "Acne treatment consultation",
    },
  })

  await prisma.appointment.create({
    data: {
      patientId: robert.id,
      doctorId: drPatel.id,
      scheduledAt: new Date("2026-05-30T13:00:00Z"),
      status: "CANCELLED",
      reason: "General health screening",
    },
  })

  await prisma.appointment.create({
    data: {
      patientId: priya.id,
      doctorId: drKumar.id,
      scheduledAt: new Date("2026-06-10T10:00:00Z"),
      status: "RESCHEDULED",
      reason: "Chest tightness evaluation — rescheduled from May 31",
    },
  })

  // Upcoming / booked
  await prisma.appointment.create({
    data: {
      patientId: james.id,
      doctorId: drKumar.id,
      scheduledAt: new Date("2026-06-10T09:00:00Z"),
      status: "BOOKED",
      reason: "Quarterly blood pressure monitoring",
    },
  })

  await prisma.appointment.create({
    data: {
      patientId: emily.id,
      doctorId: drLee.id,
      scheduledAt: new Date("2026-06-12T14:00:00Z"),
      status: "BOOKED",
      reason: "Eczema treatment follow-up",
    },
  })

  await prisma.appointment.create({
    data: {
      patientId: thomas.id,
      doctorId: drPatel.id,
      scheduledAt: new Date("2026-06-13T11:00:00Z"),
      status: "BOOKED",
      reason: "Chronic back pain management discussion",
    },
  })

  await prisma.appointment.create({
    data: {
      patientId: fatima.id,
      doctorId: drLee.id,
      scheduledAt: new Date("2026-06-16T10:30:00Z"),
      status: "BOOKED",
      reason: "First dermatology consultation for hyperpigmentation",
    },
  })

  await prisma.appointment.create({
    data: {
      patientId: robert.id,
      doctorId: drPatel.id,
      scheduledAt: new Date("2026-06-18T09:00:00Z"),
      status: "BOOKED",
      reason: "Annual physical examination",
    },
  })

  await prisma.appointment.create({
    data: {
      patientId: priya.id,
      doctorId: drKumar.id,
      scheduledAt: new Date("2026-06-20T13:30:00Z"),
      status: "BOOKED",
      reason: "Cardiac stress test review",
    },
  })

  await prisma.appointment.create({
    data: {
      patientId: carlos.id,
      doctorId: drPatel.id,
      scheduledAt: new Date("2026-06-25T15:00:00Z"),
      status: "BOOKED",
      reason: "HbA1c results review and insulin adjustment",
    },
  })

  // Visits for the 5 completed appointments
  await prisma.visit.create({
    data: {
      patientId: james.id,
      appointmentId: apptJamesCompleted.id,
      notes:
        "Patient reports occasional shortness of breath during exercise over the past 2 weeks. No chest pain at rest. Blood pressure: 138/88 mmHg. Heart rate: 74 bpm, regular rhythm. ECG shows sinus rhythm with no ST changes. Cholesterol panel ordered.",
      summary:
        "62-year-old male presenting with exertional dyspnea. BP mildly elevated at 138/88. ECG normal. Cholesterol labs ordered. Advised on low-sodium diet and moderate aerobic activity. Follow-up in 3 weeks for lab review.",
    },
  })

  await prisma.visit.create({
    data: {
      patientId: maria.id,
      appointmentId: apptMariaCompleted.id,
      notes:
        "Patient presents with persistent headache for 3 days, predominantly frontal region. No fever, no nausea. Reports increased work stress. Blood pressure: 122/78 mmHg. Neurological exam normal. Eyes: PERRL. No focal deficits noted. Tension-type headache suspected.",
      summary:
        "40-year-old female with tension headaches likely stress-related. Normal neuro exam and vitals. Prescribed ibuprofen PRN, advised stress management techniques and adequate hydration. Return in 2 weeks if symptoms persist.",
    },
  })

  await prisma.visit.create({
    data: {
      patientId: david.id,
      appointmentId: apptDavidCompleted.id,
      notes:
        "Patient reports two episodes of heart palpitations in the past month, each lasting approximately 30 seconds. No syncope, no dizziness. Denies caffeine or stimulant use. Holter monitor applied for 48-hour recording. Heart rate: 68 bpm. Blood pressure: 126/82 mmHg.",
      summary:
        "63-year-old male with recurrent palpitations. Hemodynamically stable. 48-hour Holter initiated. Advised to avoid caffeine and log symptoms. Return appointment scheduled for Holter review in 5 days.",
    },
  })

  await prisma.visit.create({
    data: {
      patientId: sarah.id,
      appointmentId: apptSarahCompleted.id,
      notes:
        "Patient presents with pruritic erythematous rash on bilateral forearms and neck for 1 week. Denies new soaps or detergents. Recent history of eating shellfish. Rash: raised, urticarial wheals. No angioedema. No respiratory symptoms. Skin prick test ordered for shellfish allergy.",
      summary:
        "35-year-old female with likely allergic urticaria following shellfish ingestion. Prescribed cetirizine 10mg daily and hydrocortisone cream. Referred for formal allergy testing. Advised to avoid shellfish pending results. Epipen prescribed as precaution.",
    },
  })

  await prisma.visit.create({
    data: {
      patientId: carlos.id,
      appointmentId: apptCarlosCompleted.id,
      notes:
        "Type 2 diabetic patient, diagnosed 2019. Current medications: Metformin 1000mg BD. Fasting glucose today: 148 mg/dL. HbA1c result from last visit: 7.8%. Patient reports poor dietary compliance over the past month due to family events. Feet examination: no neuropathy, intact sensation, no ulcers. BP: 134/84 mmHg.",
      summary:
        "70-year-old male with suboptimally controlled T2DM. HbA1c 7.8%, target <7%. Added Glipizide 5mg daily. Reinforced dietary counseling. Referred to diabetes educator. Next HbA1c in 3 months.",
    },
  })

  const counts = await Promise.all([
    prisma.patient.count(),
    prisma.doctor.count(),
    prisma.appointment.count(),
    prisma.visit.count(),
  ])

  console.log(
    `Seed complete. patients=${counts[0]} doctors=${counts[1]} appointments=${counts[2]} visits=${counts[3]}`,
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
