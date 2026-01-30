import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Prescription from "@/models/prescriptions.model";
import Appointment from "@/models/appointment.model";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();

  if (!session || session.user.role !== "doctor") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  const { appointmentId, medicines, notes } = await req.json();

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
  }

  const prescription = await Prescription.create({
    appointment: appointment._id,
    patient: appointment.patient,
    doctor: appointment.doctor,
    medicines,
    notes,
  });

  // Mark appointment completed
  appointment.status = "completed";
  await appointment.save();

  return NextResponse.json(prescription, { status: 201 });
}
