import { companyModel } from "../../../DB/models/company.model.js";
import { validationGraphQl } from "../../../middleware/validation.js";
import { AppGeneralError } from "../../../utils/index.js";
import * as companyValidation from "../company.validation.js";

export const getOneCompanyById=async(parent,args)=>{
    const {companyId}=args
    await validationGraphQl({ schema:companyValidation.idCompanySchema , data: args});
    const company =await companyModel.findById(companyId)
    if(!company){
      throw new AppGeneralError('company Not Found',404);
    }
    return company
}
export const getAllCompanies=async()=>{
    const companies =await companyModel.find()
    return companies
 }