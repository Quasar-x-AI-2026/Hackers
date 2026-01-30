"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type Role = "admin" | "doctor" | "patient";

interface IPayload {
  username: string;
  email: string;
  password: string;
  phone?: string;
  role: Role;
  speciality?: string;
  experience?: number;
  fees?: number;
}

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<Role>("patient"); // default patient for self-register

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-neutral-900">
        <p className="text-gray-700 dark:text-gray-300 animate-pulse text-md">Loading...</p>
      </div>
    );
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload: IPayload = {
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      phone: formData.get("phone") as string,
      role,
    };

    // Only admins can set doctor/admin-specific fields
    if (session?.user.role === "admin" && role === "doctor") {
      payload.speciality = formData.get("speciality") as string;
      payload.experience = Number(formData.get("experience"));
      payload.fees = Number(formData.get("fees"));
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (res.ok) {
      alert("Registration successful!");
      router.push(session?.user.role === "admin" ? "/admin/dashboard" : "/login");
    } else {
      const data = await res.json();
      alert(data.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-900 px-4">
      <form
        onSubmit={handleRegister}
        className="bg-white dark:bg-neutral-800 shadow-xl rounded-2xl p-6 space-y-4 w-full max-w-sm border border-gray-200 dark:border-neutral-700"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-2">
          Create Account
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-4">
          Fill the details to register
        </p>

        <div className="space-y-2">
          <input
            name="username"
            placeholder="Username"
            required
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-400 focus:outline-none transition"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-400 focus:outline-none transition"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-400 focus:outline-none transition"
          />
          <input
            name="phone"
            placeholder="Phone"
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-400 focus:outline-none transition"
          />

          {/* Role selection only for admins */}
          {session?.user.role === "admin" && (
            <select
              value={role}
              onChange={e => setRole(e.target.value as Role)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-400 focus:outline-none transition"
            >
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
            </select>
          )}

          {/* Doctor-specific fields only if admin registers a doctor */}
          {session?.user.role === "admin" && role === "doctor" && (
            <div className="space-y-2">
              <input
                name="speciality"
                placeholder="Speciality"
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-400 focus:outline-none transition"
              />
              <input
                name="experience"
                type="number"
                placeholder="Experience (years)"
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-400 focus:outline-none transition"
              />
              <input
                name="fees"
                type="number"
                placeholder="Consultation Fees"
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-gray-100 focus:ring-1 focus:ring-blue-400 focus:outline-none transition"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded-lg text-sm font-medium shadow hover:bg-blue-600 transition"
        >
          {loading ? "Creating..." : "Register"}
        </button>

        <p className="text-center text-gray-500 dark:text-gray-400 text-xs">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 dark:text-blue-400 hover:underline">
            Sign In
          </a>
        </p>
      </form>
    </div>
  );
}
