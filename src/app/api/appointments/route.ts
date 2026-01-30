import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/dbConnect";
import Appointment from "@/models/appointment.model";


// book an appointment
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { doctorId, date, timeSlot } = await req.json();

    if (!doctorId || !date || !timeSlot) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const appointment = await Appointment.create({
      patient: session.user.id,
      doctor: doctorId,
      appointmentDate: new Date(date),
      slotTime: timeSlot,
      status: "scheduled",
    });

    // ❌ DO NOT CREATE PRESCRIPTION HERE

    return NextResponse.json(appointment, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


// list all the appointments
export async function GET() {
    const session = await auth();

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    let filter = {};

    if (session.user.role === "patient") {
        filter = { patient: session.user.id };
    }

    if (session.user.role === "doctor") {
        filter = { doctor: session.user.id };
    }

    const appointments = await Appointment.find(filter)
        .populate("patient", "username email")
        .populate("doctor", "username speciality");

    return NextResponse.json(appointments);
}
