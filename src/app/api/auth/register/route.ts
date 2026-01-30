import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user.model";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const { username, email, password, phone, role, speciality, experience, fees } = body;

    if (!username || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUserData: any = {
      username,
      email,
      password: hashedPassword,
      phone,
      role,
    };

    if (role === "doctor") {
      newUserData.speciality = speciality;
      newUserData.experience = experience;
      newUserData.fees = fees;
    }

    const newUser = await User.create(newUserData);

    return NextResponse.json({
      message: "User registered successfully",
      user: { id: newUser._id, username: newUser.username, email: newUser.email, role: newUser.role },
    }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
