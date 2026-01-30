import mongoose, { Schema, Document } from "mongoose";

export interface IMedicalRecord extends Document {
  patient: Schema.Types.ObjectId;
  prescriptions: Schema.Types.ObjectId[];
}

const medicalRecordSchema = new Schema<IMedicalRecord>({
  patient: {
    type: Schema.Types.ObjectId,
    ref: "User",
    unique: true,
  },
  prescriptions: [
    { type: Schema.Types.ObjectId, ref: "Prescription" },
  ],
});

export default mongoose.models.MedicalRecord ||
  mongoose.model<IMedicalRecord>("MedicalRecord", medicalRecordSchema);
