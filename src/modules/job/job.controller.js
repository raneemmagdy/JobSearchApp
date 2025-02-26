import { Router } from "express";
import validation from "../../middleware/validation.js";
import { asyncHandler } from "../../utils/index.js";
import * as jobValidation from './job.validation.js'
import * as jobServices from './job.service.js'
import authentication from "../../middleware/authentication.js";

const jobRouter = Router({ mergeParams: true })
jobRouter.get('/allJobsForCompany',authentication, validation(jobValidation.getAllJobWithAppForSpecificCompanyValidation), asyncHandler(jobServices.getAllJobWithAppForSpecificCompany))
jobRouter.get('/filter',authentication ,validation(jobValidation.getFilteredJobsValidation), asyncHandler(jobServices.getFilteredJobs))
jobRouter.get('/:jobId/applications', validation(jobValidation.getJobApplicationsValidation), authentication, asyncHandler(jobServices.getJobApplications))
jobRouter.get('/:jobId?',authentication ,validation(jobValidation.getJobsOrSpecificJobValidation), asyncHandler(jobServices.getJobsOrSpecificJob))
jobRouter.post('/', authentication, validation(jobValidation.addJobValidationSchema), asyncHandler(jobServices.addJob))
jobRouter.put('/:jobId', authentication, validation(jobValidation.updateJobValidationSchema), asyncHandler(jobServices.updateJob))
jobRouter.delete('/:jobId', authentication, validation(jobValidation.deleteJobValidationSchema), asyncHandler(jobServices.deleteJob))

export default jobRouter