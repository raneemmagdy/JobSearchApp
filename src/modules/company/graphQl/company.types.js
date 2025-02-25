import { GraphQLBoolean, GraphQLEnumType, GraphQLID, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";
const mediaObj = new GraphQLObjectType({
    name: "companyMedia",
    fields: {
        secure_url: { type: GraphQLString },
        public_id: { type: GraphQLString },
    }
})

export const getOneCompanyType = new GraphQLObjectType({
    name: "getOneCompanyType",
    fields: {
        _id: { type: GraphQLID },
        companyName: { type: GraphQLString },
        description: { type: GraphQLString },
        industry: { type: GraphQLString },
        address: { type: GraphQLString },
        numberOfEmployees: {
            type: new GraphQLEnumType({
                name: "EmployeeRange",
                values: {
                    RANGE_1_10: { value: "1-10" },
                    RANGE_11_50: { value: "11-50" },
                    RANGE_51_200: { value: "51-200" },
                    RANGE_201_500: { value: "201-500" },
                    RANGE_501_1000: { value: "501-1000" },
                    RANGE_1001_5000: { value: "1001-5000" },
                    RANGE_5001_10000: { value: "5001-10000" },
                    RANGE_10000_PLUS: { value: "10000+" }
                }
            })
        },
        companyEmail: { type: GraphQLString },
        createdBy: { type: GraphQLID },
        logo: { type: mediaObj },
        coverPic: { type: mediaObj },
        legalAttachment: { type: mediaObj },
        approvedByAdmin: { type: GraphQLBoolean },
        bannedAt: { type: GraphQLString },
        deletedAt: { type: GraphQLString },
        HRs: { type: new GraphQLList(GraphQLID) }
    }
});

export const getAllCompaniesType = new GraphQLList(getOneCompanyType)