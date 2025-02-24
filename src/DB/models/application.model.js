import mongoose from "mongoose";

export const applicationStatusOptions = {
  pending:"pending",
  accepted:"accepted",
  viewed:"viewed",
  'in-consideration':"in consideration",
  rejected:"rejected"
};

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    userCV: {
      public_id: { type: String, required: true },
      secure_url: { type: String, required: true },
    },
    status: {
      type: String,
      enum: Object.values(applicationStatusOptions),
      default: "pending"
    }
  },
  { timestamps: true }
);

export const applicationModel =
  mongoose.models.Application || mongoose.model("Application", applicationSchema);
