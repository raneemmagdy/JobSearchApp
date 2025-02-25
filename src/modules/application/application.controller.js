import { Router } from "express";
import validation from "../../middleware/validation.js";
import { asyncHandler } from "../../utils/index.js";
import * as applicationValidation from './application.validation.js'
import * as applicationServices from './application.service.js'
import authentication from "../../middleware/authentication.js";
import authorization, { roleOptions } from "../../middleware/authorization.js";
import { formatOptions, multerHost } from "../../middleware/multer.js";
const applicationRouter = Router()
applicationRouter.post('/:jobId', multerHost(formatOptions.pdf).single('userCV'),
    authentication,
    authorization(roleOptions.User),
    validation(applicationValidation.addApplicationValidation),
    asyncHandler(applicationServices.applyToJob))

applicationRouter.patch(
    "/:applicationId",
    authentication,
    validation(applicationValidation.processApplicationValidation),
    asyncHandler(applicationServices.processApplication)
);
applicationRouter.get(
    "/:companyId/:date",
    authentication,
    validation(applicationValidation.generateCompanyApplicationsReportValidation),
    asyncHandler(applicationServices.generateCompanyApplicationsReport)
);

export default applicationRouter