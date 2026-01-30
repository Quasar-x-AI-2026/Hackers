import mongoose, { Schema, Document } from "mongoose";

export interface IDoctor extends Document {
  user: Schema.Types.ObjectId;
  speciality: string;
  experience: number;
  fees: number;
  available: boolean;
}

const doctorSchema = new Schema<IDoctor>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    speciality: String,
    experience: Number,
    fees: Number,
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Doctor ||
  mongoose.model<IDoctor>("Doctor", doctorSchema);
