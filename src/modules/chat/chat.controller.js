import { Router } from "express";
import authentication from "../../middleware/authentication.js";
import { getChat } from "./services/chat.service.js";
import { asyncHandler } from "../../utils/index.js";
import { idSchema } from "../user/user.validation.js";
import validation from "../../middleware/validation.js";


const chatRouter = Router()
chatRouter.get('/:userId', authentication, validation(idSchema), asyncHandler(getChat))


export default chatRouter