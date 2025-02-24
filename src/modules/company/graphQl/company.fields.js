import { GraphQLID, GraphQLNonNull } from "graphql";
import * as companyType from "./company.types.js";
import * as companyResolve from "./company.resolve.js";

export const companyQuery={
    getCompanyById:{
        type:companyType.getOneCompanyType,
        args:{
            companyId:{type:GraphQLID}
        },
        resolve:companyResolve.getOneCompanyById
    },
    getAllCompanies:{
        type:companyType.getAllCompaniesType,
        resolve:companyResolve.getAllCompanies
    }
}