import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const MyAppointments = () => {
  const { backendUrl, token, userData } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);

  const getUserAppointments = async () => {
    try {
      console.log("Fetching appointments from:", `${backendUrl}/api/user/appointments`);
      
      const { data } = await axios.get(`${backendUrl}/api/user/appointments`, {
        headers: { token },
      });

      console.log("Appointments response:", data);
      
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/cancel-appointment`,
        { appointmentId },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        setAppointments((prev) =>
          prev.map((appt) =>
            appt._id === appointmentId ? { ...appt, cancelled: true } : appt
          )
        );
      } else {
        toast.error(data.message || "Unable to cancel appointment");
      }
    } catch (error) {
      console.error("Cancel request error:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

 const handlePayment = async (appointmentId) => {
  try {
    console.log("Starting payment for appointment:", appointmentId);
    console.log("Calling endpoint:", `${backendUrl}/api/user/payment-razorpay`);
    
    const { data } = await axios.post(
      `${backendUrl}/api/user/payment-razorpay`,
      { appointmentId },
      { headers: { token } }
    );
    
    console.log("Payment response:", data);
    
    if (data.success && data.order) {
      console.log("Order received:", data.order);
      
       
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Medical Appointment",
        description: "Appointment Payment",
        order_id: data.order.id,
        receipt: data.order.receipt,
        handler: async (response) => {
          console.log("  Razorpay success response:", response);
          try {
            const verifyResponse = await axios.post(
              `${backendUrl}/api/user/verifyRazorpay`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              },
              { headers: { token } }
            );
            
            console.log("Verify response:", verifyResponse.data);
            
            if (verifyResponse.data.success) {
              toast.success("Payment successful!");
              getUserAppointments(); // Refresh the list
            } else {
              toast.error("Payment verification failed");
            }
          } catch (error) {
            console.error("Verify error:", error);
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: userData?.name || "Customer",
          email: userData?.email || "customer@example.com",
          contact: userData?.phone || "9999999999"
        },
        theme: {
          color: "#3399cc"
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal closed');
            toast.info("Payment cancelled by user");
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      
      // ADD THIS - Handle payment failure
      razorpay.on('payment.failed', function (response) {
        console.error('  Payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description || 'Unknown error'}`);
      });
      
      razorpay.open();
    } else {
      toast.error(data.message || "Failed to create payment");
    }
  } catch (error) {
    console.error("Payment error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    toast.error(error.response?.data?.message || "Payment failed");
  }
};

 
  useEffect(() => {
    if (token && userData) {
      getUserAppointments();
    }
  }, [token, userData]);

  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">
        My appointments
      </p>
      <div>
        {appointments.map((item, index) => (
          <div
            className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
            key={index}
          >
            <div>
              <img
                className="w-32 bg-indigo-50"
                src={item.docData.image}
                alt=""
              />
            </div>
            <div className="flex-1 text-sm text-zinc-600">
              <p className="text-neutral-800 font-semibold">
                {item.docData.name}
              </p>
              <p>{item.docData.speciality}</p>
              <p className="text-zinc-700 font-medium mt-1">Address:</p>
              <p className="text-xs">{item.docData.address.line1}</p>
              <p className="text-xs">{item.docData.address.line2}</p>
              <p className="text-xs mt-1">
                <span className="text-sm text-neutral-700 font-medium">
                  Date & Time:
                </span>
                {item.slotDate} | {item.slotTime}
              </p>
            </div>

            <div className="flex flex-col gap-2 justify-end">
              {/* Paid button */}
              {!item.cancelled && item.payment && !item.isCompleted && (
                <button className="sm:min-w-48 py-2 border rounded-2xl text-stone-500 bg-indigo-50">
                  Paid
                </button>
              )}

              {/* Pay Online button */}
              {!item.cancelled && !item.payment && !item.isCompleted && (
                <button
                  onClick={() => handlePayment(item._id)}
                  className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border hover:bg-[#5f6FFF] hover:text-white transition-all duration-300 cursor-pointer"
                >
                  Pay Online
                </button>
              )}

              {/* Cancel Appointment button */}
              {!item.cancelled && !item.isCompleted && (
                <button
                  onClick={() => cancelAppointment(item._id)}
                  className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border hover:bg-red-600 hover:text-white transition-all duration-300 cursor-pointer"
                >
                  Cancel Appointment
                </button>
              )}

              {/* Appointment Cancelled */}
              {item.cancelled && (
                <button className="sm:min-w-48 py-2 border border-red-500 rounded text-red-500">
                  Appointment Cancelled
                </button>
              )}

              {/* Completed */}
              {item.isCompleted && (
                <button className="sm:min-w-48 py-2 border border-green-500 rounded text-green-500">
                  Completed
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAppointments;