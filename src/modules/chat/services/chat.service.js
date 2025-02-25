import { chatModel, userModel } from "../../../DB/models/index.js";
import { AppGeneralError } from "../../../utils/index.js";

export const getChat = async (req, res, next) => {
    const { userId } = req.params
    const user = await userModel.findById(userId)
    if (!user) {
        return next(new AppGeneralError("User Not Found", 400));
    }
    if (user.deletedAt) {
        return next(new AppGeneralError("Account has been deleted ", 400));
    }
    const chat = await chatModel.findOne({
        $or: [
            { senderId: req.user._id, receiverId: userId },
            { receiverId: req.user._id, senderId: userId }
        ]
    }).populate('senderId receiverId messages.senderId')
    return res.status(200).json({ message: "done", chat })
}