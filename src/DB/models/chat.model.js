import mongoose from "mongoose";
import { companyModel } from "./company.model.js";
const chatSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: async function (value) {
          return await companyModel.exists({ 
            $or: [{ createdBy: value }, { HRs: value }] 
          });
        },
        message: "Sender must be an HR or Company Owner."
      }
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    messages: [{
        message:{type:String,required:true},
        senderId:{
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User'
        }
     }]
  },
  { timestamps: true }
);

export const chatModel =mongoose.models.Chat || mongoose.model("Chat", chatSchema);
