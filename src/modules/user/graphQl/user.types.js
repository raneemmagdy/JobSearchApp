import {  GraphQLBoolean, GraphQLEnumType, GraphQLID, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";
const mediaObj= new GraphQLObjectType({
    name: "userMedia",
    fields: {
      secure_url: { type: GraphQLString },
      public_id: { type: GraphQLString },
    }
})
const otp=new GraphQLList(new GraphQLObjectType({
    name:'otp',
    fields:{
        code:{type:GraphQLString},
        expiresIn:{type:GraphQLString}
    }
}))

export const getOneUserType = new GraphQLObjectType({
    name: "getOneUserType",
    fields:{
        _id: { type: GraphQLID },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        mobileNumber: { type: GraphQLString }, 
        gender: {
            type: new GraphQLEnumType({
                name: "gender",
                values: {
                    Male: {type:GraphQLString},
                    Female: {type:GraphQLString}
                }
            })
        },
        DOB: { type: GraphQLString },
        role: {
            type: new GraphQLEnumType({
                name: "role",
                values: {
                    User: {type:GraphQLString},
                    Admin: {type:GraphQLString}
                }
        })
        },
        provider: {
            type: new GraphQLEnumType({
                name: "provider",
                values: {
                    system: {type:GraphQLString},
                    google: {type:GraphQLString}
                }
        })
        },
        isConfirmed: { type: GraphQLBoolean },
        profilePic: { type: mediaObj }, 
        coverPic: { type: mediaObj }, 
        OTP:{type:otp}
       
}})


export const getAllUserType=new GraphQLList(getOneUserType)