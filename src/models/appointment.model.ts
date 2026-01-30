import mongoose, { Schema, Document } from "mongoose";

export interface IAppointment extends Document {
  patient: Schema.Types.ObjectId;
  doctor: Schema.Types.ObjectId;
  appointmentDate: Date;
  slotTime: string;
  status: "scheduled" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid";
}

const appointmentSchema = new Schema<IAppointment>(
  {
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

    appointmentDate: {
      type: Date,
      required: true,
    },

    slotTime: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
  },
  { timestamps: true }
);

appointmentSchema.index(
  { doctor: 1, appointmentDate: 1, slotTime: 1 },
  { unique: true }
);

export default mongoose.models.Appointment ||
  mongoose.model<IAppointment>("Appointment", appointmentSchema);

