import { companyModel } from "../../../DB/models/company.model.js";
import { graphQlAuth } from "../../../middleware/authentication.js";
import { roleOptions } from "../../../middleware/authorization.js";
import { validationGraphQl } from "../../../middleware/validation.js";
import { AppGeneralError } from "../../../utils/index.js";
import * as companyValidation from "../company.validation.js";

export const getOneCompanyById = async (parent, args) => {
  const { companyId, authorization } = args;

  await validationGraphQl({ schema: companyValidation.idCompanySchema, data: { companyId } });

  const admin = await graphQlAuth({ authorization, accessRoles: roleOptions.Admin });

  if (!admin) {
    throw new AppGeneralError("Admin Not Found", 404);
  }

  if (admin.deletedAt) {
    throw new AppGeneralError("Admin already deleted", 400);
  }

  const company = await companyModel.findById(companyId);

  if (!company) {
    throw new AppGeneralError("Company Not Found", 404);
  }
  if (company.deletedAt) {
    throw new AppGeneralError("Company already deleted", 400);
  }

  return company;
};

export const getAllCompanies = async (parent, args) => {
  const { authorization } = args;

  const admin = await graphQlAuth({ authorization, accessRoles: roleOptions.Admin });

  if (!admin) {
    throw new AppGeneralError("Admin Not Found", 404);
  }

  if (admin.deletedAt) {
    throw new AppGeneralError("Admin already deleted", 400);
  }

  const companies = await companyModel.find({ deletedAt:  null });
  return companies;
};