import { userModel } from "../../../DB/models/index.js"
import { graphQlAuth } from "../../../middleware/authentication.js";
import { roleOptions } from "../../../middleware/authorization.js";
import { validationGraphQl } from "../../../middleware/validation.js";
import { AppGeneralError } from "../../../utils/index.js";
import * as userValidation from "../user.validation.js";

export const getOneUserById = async (parent, args) => {
  const { userId, authorization } = args;

  await validationGraphQl({ schema: userValidation.idSchema, data: { userId } });

  const admin = await graphQlAuth({ authorization, accessRoles: roleOptions.Admin });

  if (!admin) {
    throw new AppGeneralError("Admin Not Found", 404);
  }

  if (admin.deletedAt) {
    throw new AppGeneralError("Admin already deleted", 400);
  }

  const user = await userModel.findById(userId);

  if (!user) {
    throw new AppGeneralError("User Not Found", 404);
  }
  if (user.deletedAt) {
    throw new AppGeneralError("User already deleted", 400);
  }

  return user;
};

export const getAllUsers = async (parent, args) => {
  const { authorization } = args;

  const admin = await graphQlAuth({ authorization, accessRoles: roleOptions.Admin });

  if (!admin) {
    throw new AppGeneralError("Admin Not Found", 404);
  }

  if (admin.deletedAt) {
    throw new AppGeneralError("Admin already deleted", 400);
  }

  const users = await userModel.find({ deletedAt:  null });
  return users;
};