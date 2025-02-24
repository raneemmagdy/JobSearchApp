import mongoose from "mongoose";

export const employeeRanges = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1001-5000",
  "5001-10000",
  "10000+"
];

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      unique: true,
      required: [true, "Company name is required."],
      trim: true
    },
    description: {
      type: String,
      required: [true, "Description is required."],
      trim: true
    },
    industry: {
      type: String,
      required: [true, "Industry is required."],
      trim: true
    },
    address: {
      type: String,
      required: [true, "Address is required."],
      trim: true
    },
    numberOfEmployees: {
      type: String,
      enum: employeeRanges,
      required: [true, "Number of employees is required."]
    },
    companyEmail: {
      type: String,
      unique: true,
      required: [true, "Company email is required."],
      lowercase: true,
      match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please provide a valid email address."]
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    logo: {
      public_id: String,
      secure_url: String
    },
    coverPic: {
      public_id: String,
      secure_url: String
    },
    HRs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    bannedAt: Date,
    deletedAt: Date,
    legalAttachment: {
      public_id: String,
      secure_url: String
    },
    approvedByAdmin: Boolean
  },
  { timestamps: true ,toJSON:{virtuals:true},toObject:{virtuals:true}}
);
companySchema.virtual('jobs',{
  ref:'Job',
  localField:'_id',
  foreignField:"companyId",

})
export const companyModel = mongoose.models.Company || mongoose.model("Company", companySchema);
