import mongoose from "mongoose";
export const jobLocationOptions = {onsite:"onsite", remotely:"remotely", hybrid:"hybrid"};
export const workingTimeOptions = {'part-time':"part-time",'full-time': "full-time"};
export const seniorityLevels = {
  Fresh:"Fresh",
  Junior: "Junior",
  'Mid-Level':"Mid-Level",
  Senior:"Senior",
  'Team-Lead':"Team-Lead",
  CTO:"CTO"
};

const jobSchema = new mongoose.Schema(
  {
    jobTitle: {
      type: String,
      required: [true, "Job title is required."],
      trim: true
    },
    jobLocation: {
      type: String,
      enum: Object.values(jobLocationOptions),
      required: [true, "Job location is required."]
    },
    workingTime: {
      type: String,
      enum: Object.values(workingTimeOptions),
      required: [true, "Working time is required."]
    },
    seniorityLevel: {
      type: String,
      enum: Object.values(seniorityLevels),
      required: [true, "Seniority level is required."]
    },
    jobDescription: {
      type: String,
      required: [true, "Job description is required."],
      trim: true
    },
    technicalSkills: {
      type: [String],
      required: [true, "Technical skills are required."]
    },
    softSkills: {
      type: [String],
      required: [true, "Soft skills are required."]
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    closed: Boolean,
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true
    }
  },
  { timestamps: true ,toJSON:{virtuals:true},toObject:{virtuals:true}}
);
jobSchema.virtual('applications',{
  ref:'Application',
  localField:'_id',
  foreignField:'jobId'
})
export const jobModel = mongoose.models.Job || mongoose.model("Job", jobSchema);
