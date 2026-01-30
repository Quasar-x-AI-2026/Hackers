import { auth } from "@/auth";
import dbConnect from "@/lib/dbConnect";
import Appointment from "@/models/appointment.model";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth
        ();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const appointment = await Appointment.findById(params.id)
        .populate("patient", "username email")
        .populate("doctor", "username speciality");

    if (!appointment) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Access control
    if (
        session.user.role === "patient" &&
        appointment.patient._id.toString() !== session.user.id
    ) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (
        session.user.role === "doctor" &&
        appointment.doctor._id.toString() !== session.user.id
    ) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(appointment);
}

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();

    if (!session || !["doctor", "admin"].includes(session.user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { status } = await req.json();

    const allowed = ["confirmed", "completed", "cancelled"];
    if (!allowed.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const appointment = await Appointment.findById(params.id);
    if (!appointment) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Doctor can update only own appointments
    if (
        session.user.role === "doctor" &&
        appointment.doctor.toString() !== session.user.id
    ) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    appointment.status = status;
    await appointment.save();

    return NextResponse.json(appointment);
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const appointment = await Appointment.findById(params.id);
    if (!appointment) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Patient restriction
    if (
        session.user.role === "patient" &&
        appointment.patient.toString() !== session.user.id
    ) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    appointment.status = "cancelled";
    await appointment.save();

    return NextResponse.json({ message: "Appointment cancelled" });
}
