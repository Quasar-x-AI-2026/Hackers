"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Container from "@/components/container";

interface Doctor {
  _id: string;
  username: string;
  speciality: string;
  experience: number;
  fees: number;
}

export default function DoctorBookingPage() {
  const { id } = useParams();
  const router = useRouter();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/doctors`)
      .then(res => res.json())
      .then(data => {
        const found = data.find((d: Doctor) => d._id === id);
        setDoctor(found);
      });
  }, [id]);

  const bookAppointment = async () => {
    setLoading(true);

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorId: id,
        date,
        timeSlot,
      }),
    });

    setLoading(false);

    if (res.ok) {
      alert("Appointment booked successfully");
      router.push("/appointments");
    } else {
      const err = await res.json();
      alert(err.error || "Failed to book");
    }
  };

  if (!doctor) return <p className="text-center mt-10">Loading doctor...</p>;

  return (
    <div className="max-w-md mx-auto mt-25 p-6 bg-white dark:bg-neutral-800 rounded-xl shadow">
      <Container>
        <h1 className="text-2xl font-bold mb-2">{doctor.username}</h1>
      <p className="text-gray-600 dark:text-gray-400">{doctor.speciality}</p>

      <div className="text-sm mt-3">
        <p>Experience: {doctor.experience} years</p>
        <p>Fees: ₹{doctor.fees}</p>
      </div>

      <div className="mt-6 space-y-3">
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full border px-3 py-2 rounded-lg"
        />

        <select
          value={timeSlot}
          onChange={e => setTimeSlot(e.target.value)}
          className="w-full border px-3 py-2 rounded-lg"
        >
          <option value="">Select Time Slot</option>
          <option value="09:00-10:00">09:00 - 10:00</option>
          <option value="10:00-11:00">10:00 - 11:00</option>
          <option value="11:00-12:00">11:00 - 12:00</option>
        </select>

        <button
          onClick={bookAppointment}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
          {loading ? "Booking..." : "Confirm Appointment"}
        </button>
      </div>
      </Container>
    </div>
  );
}
