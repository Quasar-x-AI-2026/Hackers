import React from "react";
import { useCallback } from "react";
import { AdminContext } from "../../context/AdminContext";
import { useEffect } from "react";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";

const AllAppointment = () => {
  const { atoken, appointments, getAllAppointments, cancelAppointment } = useContext(AdminContext);
  const { calculateAge, currency } = useContext(AppContext);
  
  useEffect(() => {
    if (atoken) {
      getAllAppointments();
    }
  }, [atoken]);

  // Add debug logging
  useEffect(() => {
    if (appointments && appointments.length > 0) {
      console.log('Total appointments:', appointments.length);
      
      // Find problematic appointments
      appointments.forEach((item, index) => {
        if (!item.docData) {
          console.warn(`Appointment at index ${index} (ID: ${item._id}) has no docData`);
          console.log('Problematic appointment data:', item);
        }
      });
    }
  }, [appointments]);

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>
      <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll">
        <div className="hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] grid-flow-col py-3 px-6 border-b">
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {appointments.map((item, index) => {
          // Add null checks before rendering
          if (!item.docData) {
            console.log(`Rendering appointment ${index} without docData:`, item);
          }
          
          return (
            <div
              key={item._id || index}
              className="grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_1fr] items-center text-gray-500 py-3 px-5 border-b hover:bg-gray-50"
            >
              <p className="max-sm:hidden">{index + 1}</p>

              <div className="flex items-center gap-2">
                <img
                  className="w-8 rounded-full"
                  src={item.userData?.image || assets.default_user_image || '/default-user.png'}
                  alt=""
                  onError={(e) => {
                    e.target.src = assets.default_user_image || '/default-user.png';
                  }}
                />
                <p>{item.userData?.name || 'Unknown Patient'}</p>
              </div>

              <p className="max-sm:hidden">
                {item.userData?.dob ? calculateAge(item.userData.dob) : 'N/A'}
              </p>

              <p>
                {item.slotDate || 'N/A'}, {item.slotTime || 'N/A'}
              </p>

              <div className="flex items-center gap-2">
                <img
                  className="w-8 rounded-full bg-gray-200"
                  src={item.docData?.image || assets.default_doctor_image || '/default-doctor.png'}
                  alt=""
                  onError={(e) => {
                    e.target.src = assets.default_doctor_image || '/default-doctor.png';
                  }}
                />
                <p>{item.docData?.name || 'Unknown Doctor'}</p>
              </div>

              <p>
                {currency}
                {item.amount || '0'}
              </p>

              {item.cancelled ? (
                <p className="text-red-400 text-xs font-medium">Cancelled</p>
              ) : item.isCompleted ? (
                <p className="text-green-500 text-xs font-medium">Completed</p>
              ) : (
                <img
                  className="w-10 cursor-pointer"
                  onClick={() => cancelAppointment(item._id)}
                  src={assets.cancel_icon}
                  alt="cancel"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AllAppointment;