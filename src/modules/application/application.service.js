import { jobModel, companyModel, applicationModel, userModel } from "../../DB/models/index.js";
import { AppGeneralError, cloudinary, emailEvent } from "../../utils/index.js";
import { io, userSocketMap } from "../socket.io.js";
import ExcelJS from "exceljs";
import streamifier from "streamifier";


/************************************************************************ applyToJob*/
export const applyToJob = async (req, res, next) => {
    const { jobId } = req.params;
    const userId = req.user._id;

    if (!req.file) {
        return next(new AppGeneralError("CV is required", 400));
    }

    const uploadedCV = await cloudinary.uploader.upload(req.file.path, {
        folder: "/JobSearchApp/Applications/CVs",
    });

    if (!uploadedCV) {
        return next(new AppGeneralError("Failed to upload CV", 500));
    }

    const job = await jobModel.findById(jobId);
    if (!job) return next(new AppGeneralError("Job not found", 404));
    if (job.closed) return next(new AppGeneralError("Job is closed", 400));

    const company = await companyModel.findById(job.companyId);
    if (!company) return next(new AppGeneralError("Company not found", 404));
    if (company.deletedAt) return next(new AppGeneralError("Company has been deleted", 400));

    const existingApplication = await applicationModel.findOne({ jobId, userId });
    if (existingApplication) {
        return next(new AppGeneralError("You have already applied for this job", 400));
    }

    const newApplication = await applicationModel.create({
        userId,
        jobId,
        userCV: {
            public_id: uploadedCV.public_id,
            secure_url: uploadedCV.secure_url,
        },
    });

   
    const hrId = job.addedBy.toString();
    const hrSocketId = userSocketMap.get(hrId);
    console.log(userSocketMap);
    console.log(hrId);

    
    if (hrSocketId) {
        io.to(hrSocketId).emit("newApplication", {
            message: "A new application has been submitted",
            jobId,
            userId,
            applicationId: newApplication._id,
        });
    }

    return res.status(201).json({
        message: "Application submitted successfully",
        application: newApplication,
    });
};

/************************************************************************ processApplication*/
export const processApplication = async (req, res, next) => {
    const { applicationId } = req.params;
    const { status } = req.body;
    const hrId = req.user._id;

    const application = await applicationModel.findById(applicationId);
    if (!application) return next(new AppGeneralError("Application not found", 404));

    const job = await jobModel.findById(application.jobId);
    if (!job) return next(new AppGeneralError("Job not found", 404));
    if (job.closed) {
          return next(new module.AppGeneralError("Job already Closed", 400));
    }
    if (job.addedBy.toString() !== hrId.toString()) {
        return next(new AppGeneralError("Unauthorized: You can only process applications for your own jobs", 403));
    }
    const applicant = await userModel.findById(application.userId);
    if (!applicant) return next(new AppGeneralError("Applicant not found", 404));
    if (applicant.deletedAt) return next(new AppGeneralError("User Already Deleted ", 404));


    application.status = status;
    await application.save();

    emailEvent.emit("sendEmailApplicationStatus", {
        applicantName: applicant.firstName,
        email: applicant.email,
        jobTitle: job.jobTitle,
        status,
    });

    return res.status(200).json({
        message: `Application ${status} successfully`,
        application,
    });
};


//********************************************************************* generateCompanyApplicationsReport*/
export const generateCompanyApplicationsReport = async (req, res, next) => {

        const { companyId, date } = req.params;
        const hrId = req.user._id;

        const company = await companyModel.findById(companyId);
        if (!company) return next(new AppGeneralError("Company not found", 404));

        const isOwner = company.createdBy.toString() === hrId.toString();
        const isHR = company.HRs.some(hr => hr.toString() === hrId.toString());
        if (!isOwner && !isHR) {
            return next(new AppGeneralError("Unauthorized: Only company owner or HRs can access this report", 403));
        }

    
        const targetDate = new Date(date);
        if (isNaN(targetDate.getTime())) {
            return next(new AppGeneralError("Invalid date format. Use YYYY-MM-DD", 400));
        }
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

     
        const companyJobs = await jobModel.find({ companyId }).select("_id jobTitle");
        const jobIds = companyJobs.map(job => job._id);
        if (jobIds.length === 0) return next(new AppGeneralError("No jobs found for this company", 404));

        const applications = await applicationModel.find({
            jobId: { $in: jobIds },
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        }).populate("userId", "firstName lastName email")
          .populate("jobId", "jobTitle");

        if (applications.length === 0) {
            return next(new AppGeneralError("No applications found for this date", 404));
        }

       
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Applications");

        worksheet.columns = [
            { header: "#", key: "index", width: 5 },
            { header: "Applicant Name", key: "name", width: 20 },
            { header: "Email", key: "email", width: 25 },
            { header: "Job Title", key: "jobTitle", width: 20 },
            { header: "Status", key: "status", width: 15 },
            { header: "Applied On", key: "appliedOn", width: 15 },
        ];

        applications.forEach((app, index) => {
            worksheet.addRow({
                index: index + 1,
                name: `${app.userId.firstName} ${app.userId.lastName}`,
                email: app.userId.email,
                jobTitle: app.jobId.jobTitle,
                status: app.status,
                appliedOn: app.createdAt.toISOString().split("T")[0],
            });
        });

        
        const buffer = await workbook.xlsx.writeBuffer();

      
        const uploadPromise = new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: "raw", 
                    folder: "/JobSearchApp/Applications/reports",
                    public_id: `Applications_Report_${companyId}_${date}`,
                    format: "xlsx" 
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result.secure_url);
                    }
                }
            );

            streamifier.createReadStream(buffer).pipe(uploadStream);
        });

        const reportUrl = await uploadPromise;

        return res.status(200).json({
            message: "Excel sheet created and uploaded successfully",
            reportUrl
        });

};
