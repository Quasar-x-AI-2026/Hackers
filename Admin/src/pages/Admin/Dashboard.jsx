import React from "react";
import { useContext } from "react";
import { AdminContext } from "../../context/AdminContext";
import { useEffect } from "react";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";

const Dashboard = () => {
  const { atoken, getDashData, cancelAppointment, dashData, doctors } =
    useContext(AdminContext);
  const { currency } = useContext(AppContext);
  
  useEffect(() => {
    if (atoken) {
      getDashData();
    }
  }, [atoken]);

  // Function to get doctor data safely
  const getDoctorData = (appointment) => {
    // If appointment has docData, use it
    if (appointment.docData) {
      return appointment.docData;
    }
    
    // Try to find doctor by doctorId
    const doctorId = appointment.doctorId || appointment.doctor;
    if (doctorId && doctors) {
      const foundDoctor = doctors.find(d => d._id === doctorId || d.id === doctorId);
      if (foundDoctor) {
        return foundDoctor;
      }
    }
    
    // Return default doctor data
    return {
      name: 'Unknown Doctor',
      image: assets.default_doctor_image || '/default-doctor.png',
      _id: 'unknown'
    };
  };

  // Check if dashData exists and has latestAppointments
  if (!dashData || !dashData.latestAppointments) {
    return (
      <div className="m-5">
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="m-5">
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all ">
          <img className="w-14" src={assets.doctor_icon} alt="" />
          <div>
            <p className="text-xl font-serif text-gray-600">
              {dashData.doctors || 0}
            </p>
            <p className="text-gray-400">Doctors</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all ">
          <img className="w-14" src={assets.appointments_icon} alt="" />
          <div>
            <p className="text-xl font-serif text-gray-600">
              {dashData.appointments || 0}
            </p>
            <p className="text-gray-400">Appointments</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all ">
          <img className="w-14" src={assets.patients_icon} alt="" />
          <div>
            <p className="text-xl font-serif text-gray-600">
              {dashData.patients || 0}
            </p>
            <p className="text-gray-400">Patient</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white">
        <div className="flex items-center gap-2.5 px-4 py-4 mt-10 rounded-t border">
          <img src={assets.list_icon} alt="" />
          <p className="font-semibold">Latest Bookings</p>
        </div>
        
        <div className="pt-4 border border-t-0 ">
          {dashData.latestAppointments.map((item, index) => {
            // Get doctor data safely
            const doctorData = getDoctorData(item);
            
            return (
              <div
                className="flex items-center px-6 py-3 gap-3 hover:bg-gray-100"
                key={item._id || index}
              >
                <img
                  className="rounded-full w-10"
                  src={doctorData.image}
                  alt=""
                  onError={(e) => {
                    e.target.src = assets.default_doctor_image || '/default-doctor.png';
                  }}
                />
                <div className="flex-1 text-sm">
                  <p className="text-gray-800 font-medium">
                    {doctorData.name}
                  </p>
                  <p className="text-gray-600">{item.slotDate || 'No date'}</p>
                  {item.slotTime && (
                    <p className="text-gray-500 text-xs">{item.slotTime}</p>
                  )}
                  {item.amount && (
                    <p className="text-gray-700 text-xs">
                      {currency}{item.amount}
                    </p>
                  )}
                </div>

                {item.cancelled ? (
                  <p className="text-red-400 text-xs font-medium">Cancelled</p>
                ) : item.isCompleted ? (
                  <p className="text-green-500 text-xs font-medium">
                    Completed
                  </p>
                ) : (
                  <img
                    className="w-10 cursor-pointer"
                    onClick={() => item._id && cancelAppointment(item._id)}
                    src={assets.cancel_icon}
                    alt="cancel"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;