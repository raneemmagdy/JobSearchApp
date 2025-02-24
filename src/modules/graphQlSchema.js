import {GraphQLObjectType, GraphQLSchema } from "graphql";
import { userQuery } from "./user/graphQl/user.fields.js";
import { companyQuery } from "./company/graphQl/company.fields.js";



export const schema=new GraphQLSchema({
    query:new GraphQLObjectType({
        name:'Query',
        fields:{
            ...userQuery,
            ...companyQuery
        }
    })
})