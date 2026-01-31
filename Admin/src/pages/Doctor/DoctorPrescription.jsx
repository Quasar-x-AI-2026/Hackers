import React, { useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { DoctorContext } from "../../context/DoctorContext";
import axios from "axios";
import { toast } from "react-toastify";

const DoctorPrescription = () => {
    const { appointmentId } = useParams();
    const { dtoken } = useContext(DoctorContext);

    const [healthIssue, setHealthIssue] = useState("");
    const [notes, setNotes] = useState("");
    const [followUpDate, setFollowUpDate] = useState("");

    const [medicines, setMedicines] = useState([
        {
            name: "",
            dosage: "",
            timing: [],
            duration: "",
            instructions: "",
        },
    ]);

    const handleMedicineChange = (index, field, value) => {
        const updated = [...medicines];
        updated[index][field] = value;
        setMedicines(updated);
    };

    const toggleTiming = (index, time) => {
        const updated = [...medicines];
        const timings = updated[index].timing;

        updated[index].timing = timings.includes(time)
            ? timings.filter((t) => t !== time)
            : [...timings, time];

        setMedicines(updated);
    };

    const addMedicine = () => {
        setMedicines([
            ...medicines,
            { name: "", dosage: "", timing: [], duration: "", instructions: "" },
        ]);
    };

    const submitPrescription = async () => {
        try {
            await axios.post(
                "http://localhost:4000/api/doctor/addPrescription",
                {
                    appointmentId,
                    healthIssue,
                    medicines,
                    notes,           // ✅ FIXED
                    followUpDate,
                },
                {
                    headers: {
                        authorization: `Bearer ${dtoken}`,

                    },
                }
            );

            toast.success("Prescription added successfully");
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to add prescription");
        }
    };



    return (
        <div className="p-6 w-full">
            <h2 className="text-xl font-semibold mb-4">Add Prescription</h2>

            <div className="bg-white p-5 rounded shadow space-y-4">

                <input
                    className="w-full border p-2 rounded"
                    placeholder="Health Issue"
                    value={healthIssue}
                    onChange={(e) => setHealthIssue(e.target.value)}
                />

                {medicines.map((med, index) => (
                    <div key={index} className="border p-4 rounded space-y-2">
                        <input
                            className="w-full border p-2 rounded"
                            placeholder="Medicine Name"
                            value={med.name}
                            onChange={(e) =>
                                handleMedicineChange(index, "name", e.target.value)
                            }
                        />

                        <input
                            className="w-full border p-2 rounded"
                            placeholder="Dosage (e.g. 1 tablet)"
                            value={med.dosage}
                            onChange={(e) =>
                                handleMedicineChange(index, "dosage", e.target.value)
                            }
                        />

                        <div className="flex gap-3">
                            {["Morning", "Afternoon", "Night"].map((time) => (
                                <label key={time} className="flex gap-1">
                                    <input
                                        type="checkbox"
                                        checked={med.timing.includes(time)}
                                        onChange={() => toggleTiming(index, time)}
                                    />
                                    {time}
                                </label>
                            ))}
                        </div>

                        <input
                            className="w-full border p-2 rounded"
                            placeholder="Duration (e.g. 5 days)"
                            value={med.duration}
                            onChange={(e) =>
                                handleMedicineChange(index, "duration", e.target.value)
                            }
                        />

                        <input
                            className="w-full border p-2 rounded"
                            placeholder="Instructions (optional)"
                            value={med.instructions}
                            onChange={(e) =>
                                handleMedicineChange(index, "instructions", e.target.value)
                            }
                        />
                    </div>
                ))}

                <button
                    onClick={addMedicine}
                    className="border px-3 py-1 rounded"
                >
                    + Add Medicine
                </button>

                <textarea
                    className="w-full border p-2 rounded"
                    placeholder="Doctor Notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />

                <input
                    type="date"
                    className="w-full border p-2 rounded"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                />

                <button
                    onClick={submitPrescription}
                    className="bg-primary text-white px-4 py-2 rounded"
                >
                    Submit Prescription
                </button>
            </div>
        </div>
    );
};

export default DoctorPrescription;
