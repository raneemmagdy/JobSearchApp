import { chatModel, companyModel } from "../../../DB/models/index.js";
import { authSocket } from "../../../middleware/authentication.js";
import { userSocketMap } from "../../socket.io.js";

export const sendMessage = async (socket) => {
  socket.on("sendMessage", async ({ receiverId, message }) => {
    try {
      const authData = await authSocket({ socket });
      if (authData.statusCode !== 200) {
        return socket.emit("authError", { message: "Authentication required" });
      }

      const senderId = authData.user._id.toString();

      let chat = await chatModel.findOne({
        $or: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      });

      if (!chat) {

        const company = await companyModel.findOne({
          $or: [{ createdBy: senderId }, { HRs: senderId }]
        });

        if (!company) {
          return socket.emit("error", { message: "Only HRs or company owners can start a conversation." });
        }

        chat = await chatModel.create({ senderId, receiverId, messages: [] });
      }


      chat.messages.push({ senderId, message });
      await chat.save();

      const receiverSocketId = userSocketMap.get(receiverId.toString());
      if (receiverSocketId) {
        socket.to(receiverSocketId).emit("receiveMessage", { senderId, message });
      }

      socket.emit("messageSent", { message, receiverId });
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });
};
