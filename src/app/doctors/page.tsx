"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Container from "@/components/container";

interface Doctor {
  _id: string;
  username: string;
  speciality: string;
  experience: number;
  fees: number;
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/doctors")
      .then(res => res.json())
      .then(data => {
        setDoctors(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Loading doctors...</p>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 mt-25">
      <Container>
        <h1 className="text-3xl font-bold mb-6">Available Doctors</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {doctors.map(doc => (
          <div
            key={doc._id}
            className="border rounded-xl p-4 shadow-sm bg-white dark:bg-neutral-800"
          >
            <h2 className="text-lg font-semibold">{doc.username}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {doc.speciality}
            </p>

            <div className="text-sm mt-2">
              <p>Experience: {doc.experience} yrs</p>
              <p>Fees: ₹{doc.fees}</p>
            </div>

            <Link
              href={`/doctors/${doc._id}`}
              className="inline-block mt-4 w-full text-center bg-blue-500 text-white py-2 rounded-lg text-sm hover:bg-blue-600 transition"
            >
              Book Appointment
            </Link>
          </div>
        ))}
      </div>
      </Container>
    </div>
  );
}
