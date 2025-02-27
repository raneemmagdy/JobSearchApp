import { applicationModel, companyModel, jobModel } from "../../DB/models/index.js";
import * as module from "../../utils/index.js";
//********************************************************************addJob
export const addJob = async (req, res, next) => {
  const { companyId } = req.params;
  const { jobTitle, jobLocation, workingTime, seniorityLevel, jobDescription, technicalSkills, softSkills } = req.body;
  const company = await companyModel.findById(companyId);
  if (!company) {
    return next(new module.AppGeneralError("Company not found", 404));
  }
  if (company.deletedAt) {
    return next(new module.AppGeneralError("Company is already deleted", 400));
  }
  const userId = req.user._id.toString();
  if (company.createdBy.toString() !== userId && !company.HRs.includes(userId)) {
    return next(new module.AppGeneralError("Only the company owner or HRs can add jobs", 403));
  }
  const newJob = await jobModel.create({ jobTitle, jobLocation, workingTime, seniorityLevel, jobDescription, technicalSkills, softSkills, addedBy: userId, companyId });
  return res.status(201).json({
    message: "Job added successfully",
    job: newJob
  });

}

//********************************************************************updateJob
export const updateJob = async (req, res, next) => {
  const { jobId, companyId } = req.params;
  const { jobTitle, jobLocation, workingTime, seniorityLevel, jobDescription, technicalSkills, softSkills } = req.body;
  const job = await jobModel.findById(jobId);
  if (!job) {
    return next(new module.AppGeneralError("Job not found", 404));
  }
  if (job.closed) {
    return next(new module.AppGeneralError("Job already Closed", 400));
  }
  if (job.companyId.toString() !== companyId)
    return next(new module.AppGeneralError("Job does not belong to this company", 400));
  const company = await companyModel.findById(job.companyId);
  if (!company) {
    return next(new module.AppGeneralError("Company not found", 404));
  }
  if (company.deletedAt) {
    return next(new module.AppGeneralError("Company already Deleted", 400));
  }
  const isJobCreator = job.addedBy.toString() === req.user._id.toString();
  if (!isJobCreator) {
    return next(new module.AppGeneralError("Only the job creator can update this job", 403));
  }
  const updatedJob = await jobModel.findByIdAndUpdate(
    jobId,
    { jobTitle, jobLocation, workingTime, seniorityLevel, jobDescription, technicalSkills, softSkills, updatedBy: req.user._id },
    { new: true }
  )
  return res.status(200).json({
    message: "Job updated successfully",
    job: updatedJob
  })

}

//********************************************************************deleteJob
export const deleteJob = async (req, res, next) => {
  const { jobId, companyId } = req.params;
  const job = await jobModel.findById(jobId);
  if (!job) {
    return next(new module.AppGeneralError("Job not found", 404));
  }
  if (job.closed) {
    return next(new module.AppGeneralError("Job already Closed", 400));
  }

  if (job.companyId.toString() !== companyId)
    return next(new module.AppGeneralError("Job does not belong to this company", 400));
  const company = await companyModel.findById(job.companyId);
  if (!company) {
    return next(new module.AppGeneralError("Company not found", 404));
  }
  if (company.deletedAt) {
    return next(new module.AppGeneralError("Company already Deleted", 400));
  }
  const isHR = company.HRs.some(hrId => hrId.toString() === req.user._id.toString());
  if (!isHR) {
    return next(new module.AppGeneralError("Only HRs related to this company can delete this job", 403));
  }
  await jobModel.findByIdAndUpdate(jobId, { closed: true });
  return res.status(200).json({
    message: "Job deleted successfully (soft delete)",
  });
}


//********************************************************************getJobsOrSpecificJob
export const getJobsOrSpecificJob = async (req, res, next) => {
  const { companyId, jobId } = req.params;
  const { page = 1, limit = 2, name } = req.query;

  let filter = { closed: { $exists: false } };

  if (name) {
    const companies = await companyModel.find({
      companyName: { $regex: new RegExp(name, "i") },
      deletedAt: null
    });

    if (!companies.length) return next(new module.AppGeneralError("No companies found", 404));

    filter.companyId = { $in: companies.map(company => company._id) };
  }

  if (jobId) {
    const job = await jobModel.findById(jobId);
    if (!job) return next(new module.AppGeneralError("Job not found", 404));
    if (job.closed) return next(new module.AppGeneralError("Job already closed", 400));
    if (job.companyId.toString() !== companyId)
      return next(new module.AppGeneralError("Job does not belong to this company", 400));

    return res.status(200).json({ message: "Job retrieved successfully", job });
  }


  if (companyId) {
    const company = await companyModel.findById(companyId);
    if (!company) return next(new module.AppGeneralError("Company not found", { cause: 404 }));
    if (company.deletedAt) return next(new module.AppGeneralError("Company already deleted", { cause: 400 }));

    filter.companyId = companyId;
  }


  const paginatedResult = await module.pagination({
    page,
    limit,
    model: jobModel,
    filter,
    sort: "-createdAt"
  });

  return res.status(200).json({
    message: "Jobs retrieved successfully",
    ...paginatedResult
  });
}

//********************************************************************getFilteredJobs
export const getFilteredJobs = async (req, res, next) => {
  const { page = 1, limit = 2, workingTime, jobLocation, seniorityLevel, jobTitle, technicalSkills } = req.query;
  let filter = { closed: { $exists: false } };

  if (workingTime) filter.workingTime = workingTime;
  if (jobLocation) filter.jobLocation = jobLocation;
  if (seniorityLevel) filter.seniorityLevel = seniorityLevel;
  if (jobTitle) filter.jobTitle = { $regex: new RegExp(jobTitle, "i") };
  if (technicalSkills) {
    const skillsArray = technicalSkills.split(",");
    filter.technicalSkills = { $in: skillsArray.map(skill => new RegExp(`^${skill.trim()}$`, "i"))};
  }
  const paginatedResult = await module.pagination({
    page,
    limit,
    model: jobModel,
    filter,
    sort: "-createdAt"
  });

  return res.status(200).json({
    message: "Jobs retrieved successfully",
    ...paginatedResult
  })
};

//********************************************************************getJobApplications
export const getJobApplications = async (req, res, next) => {

  const { jobId, companyId } = req.params;
  const { page = 1, limit = 2 } = req.query;

  const job = await jobModel.findById(jobId);
  if (!job) return next(new module.AppGeneralError("Job not found", 404));
  if (job.closed) return next(new module.AppGeneralError("Job already Closed", 400));
  if (job.companyId.toString() !== companyId)
    return next(new module.AppGeneralError("Job does not belong to this company", 400));

  const company = await companyModel.findById(companyId);
  if (!company) return next(new module.AppGeneralError("Company not found", 404));
  if (company.deletedAt) return next(new module.AppGeneralError("Company already Deleted", 400));
  if (company.createdBy.toString() !== req.user._id.toString() && !company.HRs.includes(req.user._id)) {
    return next(new module.AppGeneralError("Only the company owner or HRs can view applications", 403));
  }


  const paginatedResult = await module.pagination({
    page,
    limit,
    model: applicationModel,
    filter: { jobId },
    sort: "-createdAt",
    populate: [{ path: "userId", select: "-_id" }],
  });

  return res.status(200).json({
    message: "Applications retrieved successfully",
    ...paginatedResult,
  });

};

//********************************************************************getAllJobWithAppForSpecificCompany
export const getAllJobWithAppForSpecificCompany = async (req, res, next) => {
  const { companyId } = req.params;
  const company = await companyModel.findById(companyId);

  if (!company) {
    return next(new module.AppGeneralError("Company not found", 404));
  }
  if (company.deletedAt) {
    return next(new module.AppGeneralError("Company already Deleted", 400));
  }

  const isAuthorized =
    company.createdBy.toString() === req.user._id.toString() || 
    company.HRs.some(hrId => hrId.toString() === req.user._id.toString());

  if (!isAuthorized) {
    return next(new module.AppGeneralError("Only the company owner or HRs can view job applications", 403));
  }

  const jobs = await jobModel.find({ companyId }).populate([
    { path: "applications", populate: { path: "userId" } }
  ]);

  return res.status(200).json({ message: "Jobs retrieved successfully", jobs });
};


