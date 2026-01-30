import mongoose, { Schema, Document } from "mongoose";

export interface IPrescription extends Document {
  appointment: Schema.Types.ObjectId;
  patient: Schema.Types.ObjectId;
  doctor: Schema.Types.ObjectId;
  medicines: {
    name: string;
    dosage: string;
    duration: string;
  }[];
  notes: string;
}

const prescriptionSchema = new Schema<IPrescription>(
  {
    appointment: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
      unique: true, // one prescription per appointment
    },

    patient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
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
  mongoose.model<IPrescription>("Prescription", prescriptionSchema);
