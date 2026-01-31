import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dosage: {
      type: String, // e.g. "500mg", "1 tablet"
      required: true,
    },
    timing: {
      type: [String], // ["Morning", "Afternoon", "Night"]
      required: true,
    },
    duration: {
      type: String, // e.g. "5 days", "2 weeks"
      required: true,
    },
    instructions: {
      type: String, // e.g. "After food"
    },
  },
  { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
  {
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

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },

    healthIssue: {
      type: String,
      required: true,
      trim: true,
    },

    medicines: {
      type: [medicineSchema],
      required: true,
    },

    notes: {
      type: String, // Doctor notes / advice
    },

    followUpDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },

    prescribedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Prescription = mongoose.model("Prescription", prescriptionSchema);

export default Prescription;
