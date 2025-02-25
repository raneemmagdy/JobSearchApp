import { userModel } from "../../../DB/models/index.js"
import { validationGraphQl } from "../../../middleware/validation.js";
import { AppGeneralError } from "../../../utils/index.js";
import * as userValidation from "../user.validation.js";

export const getOneUserById = async (parent, args) => {
  const { userId } = args
  await validationGraphQl({ schema: userValidation.idSchema, data: args });
  const user = await userModel.findById(userId)
  if (!user) {
    throw new AppGeneralError('User Not Found', 404);
  }
  return user
}
export const getAllUsers = async () => {
  const users = await userModel.find()
  return users
}