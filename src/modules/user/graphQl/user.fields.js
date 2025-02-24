import { GraphQLID, GraphQLNonNull } from "graphql";
import * as userType from "./user.types.js";
import * as userResolve from "./user.resolve.js";

export const userQuery={
    getUserById:{
        type:userType.getOneUserType,
        args:{
            userId:{type:GraphQLID}
        },
        resolve:userResolve.getOneUserById
    },
    getAllUsers:{
        type:userType.getAllUserType,
        resolve:userResolve.getAllUsers
    }
}