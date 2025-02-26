import { companyModel, employeeRanges, userModel } from "../../DB/models/index.js";
import { roleOptions } from "../../middleware/authorization.js";
import * as module from "../../utils/index.js";
//====================================================addCompany
export const addCompany = async (req, res, next) => {
    const { companyName, description, industry, address, numberOfEmployees, companyEmail } = req.body;
    const existingCompany = await companyModel.findOne({
        $or: [{ companyName }, { companyEmail }]
    })
    if (existingCompany) {
        return next(new module.AppGeneralError("Company name or email already exists", 400))
    }

    let logo = null
    let coverPic = null
    let legalAttachment = null
    if (req.files?.logo) logo = await module.cloudinary.uploader.upload(req.files.logo[0].path, { folder: "JobSearchApp/company/logos" });
    if (req.files?.coverPic) coverPic = await module.cloudinary.uploader.upload(req.files.coverPic[0].path, { folder: "JobSearchApp/company/covers" });
    if (req.files?.legalAttachment) legalAttachment = await module.cloudinary.uploader.upload(req.files.legalAttachment[0].path, { folder: "JobSearchApp/company/legal" });

    const newCompany = await companyModel.create({
        companyName, description, industry, address, numberOfEmployees,
        companyEmail, createdBy: req.user._id, logo, coverPic, legalAttachment
    })

    return res.status(201).json({ message: "Company created successfully", company: newCompany });
}


//====================================================updateCompany
export const updateCompany = async (req, res, next) => {
    const { companyId } = req.params;
    const { companyName, description, industry, address, numberOfEmployees, companyEmail } = req.body;

    const company = await companyModel.findById(companyId);
    if (!company) {
        return next(new module.AppGeneralError("Company not found", 404));
    }
    if (company.deletedAt) {
        return next(new module.AppGeneralError("Company Already Deleted", 400));
    }
    if (company.createdBy.toString() !== req.user._id.toString()) {
        return next(new module.AppGeneralError("Unauthorized to update this company", 403));
    }

    let coverPic = company.coverPic;
    let logo = company.logo;


    if (req.files?.coverPic) {
        if (company.coverPic?.public_id) {
            await module.cloudinary.uploader.destroy(company.coverPic.public_id);
        }
        coverPic = await module.cloudinary.uploader.upload(req.files.coverPic[0].path, { folder: "JobSearchApp/company/covers" });
    }

    if (req.files?.logo) {
        if (company.logo?.public_id) {
            await module.cloudinary.uploader.destroy(company.logo.public_id);
        }
        logo = await module.cloudinary.uploader.upload(req.files.logo[0].path, { folder: "JobSearchApp/company/logos" });
    }

    const updatedCompany = await companyModel.findByIdAndUpdate(
        companyId,
        { companyName, description, industry, address, numberOfEmployees, companyEmail, coverPic, logo },
        { new: true }
    );

    return res.status(200).json({ message: "Company updated successfully", company: updatedCompany });
};



//====================================================updateCompany
export const softDeleteCompany = async (req, res, next) => {
    const { companyId } = req.params;
    const company = await companyModel.findById(companyId);

    if (!company) {
        return next(new module.AppGeneralError("Company not found", 404));
    }
    if (company.deletedAt) {
        return next(new module.AppGeneralError("Company Already Deleted", 400));
    }
    if (company.createdBy.toString() !== req.user._id.toString() && req.user.role !== roleOptions.Admin) {
        return next(new module.AppGeneralError("Unauthorized to delete this company", 403));
    }

    const deletedCompany = await companyModel.findByIdAndUpdate(companyId, { deletedAt: Date.now() })
    return res.status(200).json({ message: "Company soft deleted successfully", company: deletedCompany });
};



//====================================================getCompanyWithJobs
export const getCompanyWithJobs = async (req, res, next) => {
    if (!req.user) {
        return next(new module.AppGeneralError("Authentication required", 401));
    }
    const { companyId } = req.params;

    const company = await companyModel.findOne({ _id: companyId, deletedAt: null })
        .populate({
            path: "jobs",
            match: { closed: null }
        });

    if (!company) {
        return next(new module.AppGeneralError("Company not found", 404));
    }
    return res.status(200).json({ message: "Company fetched successfully", company });
};



//====================================================searchCompanyByName
export const searchCompanyByName = async (req, res, next) => {
    const { name, page } = req.query;
    if (!req.user) {
        return next(new module.AppGeneralError("Authentication required", 401));
    }

    if (!name) {
        return next(new module.AppGeneralError("Company name is required", 400));
    }
    const filter = {
        companyName: { $regex: new RegExp(name, "i") },
        deletedAt: null,
    };

    const result = await module.pagination({ page, model: companyModel, filter });

    return res.status(200).json({ message: "Done", result });
};


//====================================================uploadCompanyLogo
export const uploadCompanyLogo = async (req, res, next) => {
    const { companyId } = req.params;
    const company = await companyModel.findById(companyId);
    if (!company) {
        return next(new module.AppGeneralError("Company not found", 404));
    }
    if (company.deletedAt) {
        return next(new module.AppGeneralError("Company Already Deleted", 400));
    }
    if (company.createdBy.toString() !== req.user._id.toString()) {
        return next(new module.AppGeneralError("Unauthorized to update this company", 403));
    }
    if (!req.file) {
        return next(new module.AppGeneralError("Please upload a logo", 400));
    }

    if (company.logo?.public_id) {
        await module.cloudinary.uploader.destroy(company.logo.public_id);
    }

    const { public_id, secure_url } = await module.cloudinary.uploader.upload(req.file.path, {
        folder: "JobSearchApp/company/logos",
    });

    company.logo = { public_id, secure_url };
    await company.save();

    return res.status(200).json({ message: "Logo uploaded successfully", logo: company.logo });
};


//====================================================uploadCompanyCover
export const uploadCompanyCover = async (req, res, next) => {
    const { companyId } = req.params;
    const company = await companyModel.findById(companyId);
    if (!company) {
        return next(new module.AppGeneralError("Company not found", 404));
    }
    if (company.deletedAt) {
        return next(new module.AppGeneralError("Company Already Deleted", 400));
    }
    if (company.createdBy.toString() !== req.user._id.toString()) {
        return next(new module.AppGeneralError("Unauthorized to update this company", 403));
    }
    if (!req.file) {
        return next(new module.AppGeneralError("Please upload a cover picture", 400));
    }
    if (company.coverPic?.public_id) {
        await module.cloudinary.uploader.destroy(company.coverPic.public_id);
    }

    const { public_id, secure_url } = await module.cloudinary.uploader.upload(req.file.path, {
        folder: "JobSearchApp/company/covers",
    });

    company.coverPic = { public_id, secure_url };
    await company.save();

    return res.status(200).json({ message: "Cover picture uploaded successfully", coverPic: company.coverPic });
};

//====================================================deleteCompanyLogo
export const deleteCompanyLogo = async (req, res, next) => {
    const { companyId } = req.params;
    const company = await companyModel.findById(companyId);
    if (!company) {
        return next(new module.AppGeneralError("Company not found", 404));
    }
    if (company.deletedAt) {
        return next(new module.AppGeneralError("Company Already Deleted", 400));
    }
    if (company.createdBy.toString() !== req.user._id.toString()) {
        return next(new module.AppGeneralError("Unauthorized to update this company", 403));
    }
    if (!company.logo?.public_id) {
        return next(new module.AppGeneralError("Company does not have a logo", 400));
    }
    await module.cloudinary.uploader.destroy(company.logo.public_id);
    company.logo = null;
    await company.save();
    return res.status(200).json({ message: "Logo deleted successfully" });
};

//====================================================deleteCompanyLogo
export const deleteCompanyCover = async (req, res, next) => {
    const { companyId } = req.params;
    const company = await companyModel.findById(companyId);

    if (!company) {
        return next(new module.AppGeneralError("Company not found", 404));
    }
    if (company.deletedAt) {
        return next(new module.AppGeneralError("Company Already Deleted", 400));
    }
    if (company.createdBy.toString() !== req.user._id.toString()) {
        return next(new module.AppGeneralError("Unauthorized to update this company", 403));
    }

    if (!company.coverPic?.public_id) {
        return next(new module.AppGeneralError("Company does not have a cover picture", 400));
    }

    await module.cloudinary.uploader.destroy(company.coverPic.public_id);
    company.coverPic = null;
    await company.save();
    return res.status(200).json({ message: "Cover picture deleted successfully" });
};


//====================================================addHRToCompany
export const addHRToCompany = async (req, res, next) => {
    const { companyId, userId } = req.params;

    const company = await companyModel.findById(companyId);
    if (!company) {
        return next(new module.AppGeneralError("Company not found", 404));
    }
    if (company.deletedAt) {
        return next(new module.AppGeneralError("Company already deleted", 400));
    }

    if (company.createdBy.toString() !== req.user._id.toString()) {
        return next(new module.AppGeneralError("Only the company owner can add HRs", 403));
    }
    const user = await userModel.findById(userId);
    if (!user) {
        return next(new module.AppGeneralError("User not found", 404));
    }
    if (user.deletedAt) {
        return next(new module.AppGeneralError("Account already deleted", 400));
    }
    if (company.HRs.includes(userId)) {
        return next(new module.AppGeneralError("User is already an HR in this company", 400));
    }
    const updatedCompany = await companyModel.findByIdAndUpdate(
        companyId,
        { $addToSet: { HRs: userId } },
        { new: true }
    );

    return res.status(200).json({
        message: "HR added successfully",
        company: updatedCompany
    });
};


//====================================================getCompanyWithHRs
export const getCompanyWithHRs = async (req, res, next) => {
    if (!req.user) {
        return next(new module.AppGeneralError("Authentication required", 401));
    }
    const { companyId } = req.params;
    const company = await companyModel.findById(companyId).populate({ path: "HRs" });

    if (!company) {
        return next(new module.AppGeneralError("Company not found", 404));
    }
    if (company.deletedAt) {
        return next(new module.AppGeneralError("Company already deleted", 400));
    }
    return res.status(200).json({
        message: "Company retrieved successfully",
        company
    });
}


//====================================================getCompanyWithHRs
export const removeHRFromCompany = async (req, res, next) => {
    const { companyId, userId } = req.params;

    const company = await companyModel.findById(companyId);
    if (!company) {
        return next(new module.AppGeneralError("Company not found", 404));
    }
    if (company.deletedAt) {
        return next(new module.AppGeneralError("Company already deleted", 400));
    }
    if (company.createdBy.toString() !== req.user._id.toString()) {
        return next(new module.AppGeneralError("Only the company owner can remove HRs", 403));
    }

    const user = await userModel.findById(userId);
    if (!user) {
        return next(new module.AppGeneralError("User not found", 404));
    }
    if (user.deletedAt) {
        return next(new module.AppGeneralError("Account already deleted", 400));
    }

    if (!company.HRs.includes(userId)) {
        return next(new module.AppGeneralError("User is not an HR in this company", 400));
    }

    const updatedCompany = await companyModel.findByIdAndUpdate(
        companyId,
        { $pull: { HRs: userId } },
        { new: true }
    );

    return res.status(200).json({
        message: "HR removed successfully",
        company: updatedCompany
    });
};
