
import mongoose, { Schema } from "mongoose";

export interface IPrescription extends Document {
  appointment: Schema.Types.ObjectId;
  medicines: {
    name: string;
    dosage: string;
    duration: string;
  }[];
  notes?: string;
}


const prescriptionSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    medicines: [
      {
        name: String,
        dosage: String,
        duration: String,
      },
    ],

    notes: String,
  },
  { timestamps: true }
);

export default mongoose.models.Prescription ||
  mongoose.model("Prescription", prescriptionSchema);