import { GraphQLID,  GraphQLString } from "graphql";
import * as companyType from "./company.types.js";
import * as companyResolve from "./company.resolve.js";

export const companyQuery = {
    getCompanyById: {
        type: companyType.getOneCompanyType,
        args: {
            companyId: { type: GraphQLID },
            authorization:{ type: GraphQLString}
        },
        resolve: companyResolve.getOneCompanyById
    },
    getAllCompanies: {
        type: companyType.getAllCompaniesType,
        args: {
            authorization:{ type: GraphQLString}
        },
        resolve: companyResolve.getAllCompanies
    }
}