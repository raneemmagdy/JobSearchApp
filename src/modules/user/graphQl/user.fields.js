import { GraphQLID, GraphQLString } from "graphql";
import * as userType from "./user.types.js";
import * as userResolve from "./user.resolve.js";

export const userQuery = {
    getUserById: {
        type: userType.getOneUserType,
        args: {
            userId: { type: GraphQLID },
            authorization:{ type: GraphQLString}
        },
        resolve: userResolve.getOneUserById
    },
    getAllUsers: {
        type: userType.getAllUserType,
        args: {
            authorization:{ type: GraphQLString}
        },
        resolve: userResolve.getAllUsers
    }
}