import { Router } from "express";
import validation from "../../middleware/validation.js";
import { asyncHandler } from "../../utils/index.js";
import * as companyValidation from './company.validation.js'
import * as companyServices from './company.service.js'
import { multerCompany } from "../../middleware/multer.js";
import authentication from "../../middleware/authentication.js";
import jobRouter from "../job/job.controller.js";

const companyRouter = Router()
companyRouter.use('/:companyId?/jobs', jobRouter)

companyRouter.post(
  "/add",
  multerCompany.fields([
    { name: "coverPic", maxCount: 1 },
    { name: "logo", maxCount: 1 },
    { name: "legalAttachment", maxCount: 1 }
  ]),
  authentication,
  validation(companyValidation.addCompanySchema),
  asyncHandler(companyServices.addCompany)
)

companyRouter.put(
  "/update/:companyId",
  authentication,
  multerCompany.fields([
    { name: "coverPic", maxCount: 1 },
    { name: "logo", maxCount: 1 }
  ]),
  validation(companyValidation.updateCompanySchema),
  asyncHandler(companyServices.updateCompany)
);
companyRouter.delete(
  "/delete/:companyId",
  authentication,
  validation(companyValidation.idCompanySchema),
  asyncHandler(companyServices.softDeleteCompany)
);
companyRouter.get(
  "/:companyId",
  authentication,
  validation(companyValidation.idCompanySchema),
  asyncHandler(companyServices.getCompanyWithJobs)
);
companyRouter.get(
  "/",
  authentication,
  validation(companyValidation.searchCompanyByNameSchema),
  asyncHandler(companyServices.searchCompanyByName)
);

companyRouter.post(
  "/logo/:companyId",
  authentication,
  multerCompany.single('logo'),
  validation(companyValidation.uploadCompanyLogoSchema),
  asyncHandler(companyServices.uploadCompanyLogo)
);
companyRouter.post(
  "/cover/:companyId",
  authentication,
  multerCompany.single('coverPic'),
  validation(companyValidation.uploadCompanyCoverSchema),
  asyncHandler(companyServices.uploadCompanyCover)
);
companyRouter.delete(
  "/logo/:companyId",
  authentication,
  validation(companyValidation.idCompanySchema),
  asyncHandler(companyServices.deleteCompanyLogo)
);
companyRouter.delete(
  "/cover/:companyId",
  authentication,
  validation(companyValidation.idCompanySchema),
  asyncHandler(companyServices.deleteCompanyCover)
);

companyRouter.delete(
  "/cover/:companyId",
  authentication,
  validation(companyValidation.idCompanySchema),
  asyncHandler(companyServices.deleteCompanyCover)
);
companyRouter.post(
  "/:companyId/HR/:userId",
  authentication,
  validation(companyValidation.addOrRemoveHRToCompanySchema),
  asyncHandler(companyServices.addHRToCompany)
);
companyRouter.delete(
  "/:companyId/HR/:userId",
  authentication,
  validation(companyValidation.addOrRemoveHRToCompanySchema),
  asyncHandler(companyServices.removeHRFromCompany)
);
companyRouter.get(
  "/HR/:companyId",
  authentication,
  validation(companyValidation.idCompanySchema),
  asyncHandler(companyServices.getCompanyWithHRs)
);

export default companyRouter