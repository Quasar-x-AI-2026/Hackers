import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user.model";

export async function GET() {
  await dbConnect();

  const doctors = await User.find({ role: "doctor" })
    .select("username email speciality experience fees");

  return NextResponse.json(doctors);
}
