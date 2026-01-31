import React, { useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { DoctorContext } from "../../context/DoctorContext";

const DoctorAppointmentDetails = () => {
  const { appointmentId } = useParams();
  const { getAppointmentById, singleAppointment } =
    useContext(DoctorContext);

  useEffect(() => {
    getAppointmentById(appointmentId);
  }, [appointmentId]);

  if (!singleAppointment) {
    return <p className="p-6">Loading...</p>;
  }

  const { userData } = singleAppointment;

  return (
    <div className="p-6 w-full">
      <h2 className="text-xl font-semibold mb-4">
        Appointment Details
      </h2>

      <div className="bg-white p-5 rounded shadow space-y-2">
        <p><b>Patient:</b> {userData.name}</p>
        <p><b>Email:</b> {userData.email}</p>
        <p><b>Gender:</b> {userData.gender}</p>
        <p><b>Age:</b> {userData.age}</p>
        <p><b>Date:</b> {singleAppointment.slotDate}</p>
        <p><b>Time:</b> {singleAppointment.slotTime}</p>
        <p><b>Fees:</b> ₹{singleAppointment.amount}</p>
        <p>
          <b>Status:</b>{" "}
          {singleAppointment.isCompleted
            ? "Completed"
            : singleAppointment.cancelled
            ? "Cancelled"
            : "Pending"}
        </p>
      </div>
    </div>
  );
};

export default DoctorAppointmentDetails;
