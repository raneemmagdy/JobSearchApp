import { Router } from "express";
import validation from "../../middleware/validation.js";
import { idSchema } from "../user/user.validation.js";
import { asyncHandler } from "../../utils/index.js";
import { approveCompanyByAdmin, banOrUnbanCompany, banOrUnbanUser } from "./admin.service.js";
import authentication from "../../middleware/authentication.js";
import authorization, { roleOptions } from "../../middleware/authorization.js";
import { idCompanySchema } from "../company/company.validation.js";
const adminRouter = Router()
adminRouter.patch('/user/banOrUnban/:userId', validation(idSchema), authentication, authorization([roleOptions.Admin]), asyncHandler(banOrUnbanUser))
adminRouter.patch('/company/banOrUnban/:companyId', validation(idCompanySchema), authentication, authorization([roleOptions.Admin]), asyncHandler(banOrUnbanCompany))
adminRouter.patch('/company/approve/:companyId', validation(idCompanySchema), authentication, authorization([roleOptions.Admin]), asyncHandler(approveCompanyByAdmin))

export default adminRouter