import { companyModel } from "../../DB/models/company.model.js";
import { userModel } from "../../DB/models/user.model.js";
import { roleOptions } from "../../middleware/authorization.js";
import { AppGeneralError } from "../../utils/index.js";
//***************************************************************************** banOrUnbanUser*/
export const banOrUnbanUser = async (req, res, next) => {
    const { userId } = req.params;

    const user = await userModel.findById(userId);
    if (!user) {
      return next(new AppGeneralError("User Not Found", { cause: 404 }));
    }
    if (user.deletedAt) {
       return next(new module.AppGeneralError("User Already Deleted", 400));
    }
    if (user.role === roleOptions.Admin) {
      return next(new AppGeneralError("Unauthorized: Admins cannot ban/unban other admins",403));
    }
    let updatedUser;
    let action;
    if (user.bannedAt) {
      updatedUser = await userModel.findByIdAndUpdate(
        userId,
        { $unset: { bannedAt: 1 } },
        { new: true }
      );
      action = "Unbanned";
    } else {
      updatedUser = await userModel.findByIdAndUpdate(
        userId,
        { $set: { bannedAt: Date.now() } },
        { new: true }
      );
      action = "Banned";
    }
  
    return res.status(200).json({
      message: `User has been ${action}`,
      user: updatedUser
    });
};
//***************************************************************************** banOrUnbanCompany*/
export const banOrUnbanCompany = async (req, res, next) => {
    const { companyId } = req.params;
    const company = await companyModel.findById(companyId);
    if (!company) {
      return next(new AppGeneralError("Company Not Found",404));
    }
    let updatedCompany;
    let action;
    if (company.bannedAt) {
      updatedCompany = await companyModel.findByIdAndUpdate(
        companyId,
        { $unset: { bannedAt: 1 } },
        { new: true }
      );
      action = "Unbanned";
    } else {
      updatedCompany = await companyModel.findByIdAndUpdate(
        companyId,
        { $set: { bannedAt: new Date() } },
        { new: true }
      );
      action = "Banned";
    }
  
    return res.status(200).json({
      message: `Company has been ${action}`,
      company: updatedCompany
    });
};
//***************************************************************************** approveCompanyByAdmin*/  
export const approveCompanyByAdmin = async (req, res, next) => {
    const { companyId } = req.params;
    const company = await companyModel.findById(companyId);
    if (!company) {
        return next(new AppGeneralError("Company Not Found",404));
    }
    if (company.deletedAt) {
            return next(new AppGeneralError("Company Already Deleted", 400));
    }
    if (company.approvedByAdmin) {
        return next(new AppGeneralError("Company is already approved",400));
    }
    const updatedCompany = await companyModel.findByIdAndUpdate(
      companyId,
      {approvedByAdmin: true } ,
      { new: true }
    );
    return res.status(200).json({
      message: "Company has been approved",
      company: updatedCompany
    });
};
  
