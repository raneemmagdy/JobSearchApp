import Joi from "joi";
import { generalRules } from "../../utils/index.js";
import { genderOptions, providerOptions} from "../../DB/models/index.js";
import { roleOptions } from "../../middleware/authorization.js";

export const signInOrSignUpWithGmailSchema=Joi.object({
    idToken:Joi.string().messages({'any.required': 'idToken is required.'}).required()
})
export const signUpSchema=Joi.object({
    firstName: Joi.string().messages({'any.required': 'firstName is required.'}).required(),
    lastName: Joi.string().messages({'any.required': 'lastName is required.'}).required(),
    email: generalRules.email.required(),
    password: generalRules.password.required(),
    cPassword: generalRules.password.valid(Joi.ref('password')).messages({
        'any.only': 'Confirm password must match the password.',
        'any.required': 'Confirm password is required.'
    }).required(),
    mobileNumber: Joi.string().regex(/^01[0125][0-9]{8}$/).messages({
        'string.pattern.base': 'Phone number must be an Egyptian number and start with 010, 011, 012, or 015 followed by 8 digits.',
        'any.required': 'Phone number is required.'
    }).required(),
    DOB: Joi.date().less(new Date(new Date().setFullYear(new Date().getFullYear() - 18))).required()
    .messages({
        "date.base": "Invalid date format.",
        "date.less": "User must be at least 18 years old."
    }),
    gender: Joi.string().valid(genderOptions.Female,genderOptions.Male).default(genderOptions.Male).messages({
        'any.only': 'Gender must be either Male or Female.',
        'any.required': 'Gender is required.'
    }),
    role: Joi.string().valid(roleOptions.User,roleOptions.Admin).default(roleOptions.User).messages({
        'any.only': 'Role must be either User or Admin.',
    }),
    provider: Joi.string().valid(providerOptions.system,providerOptions.google).default(providerOptions.system).messages({
        'any.only': 'Provider must be system or google.'
    }),
    profilePic: Joi.object({
        public_id: Joi.string().required(),
        secure_url: Joi.string().uri().required(),}),
    coverPic: Joi.object({
        public_id: Joi.string().required(),
        secure_url: Joi.string().uri().required(),}),
  
    
})
export const confirmSchema=Joi.object({
    email: generalRules.email.required(),
    otp: Joi.string().length(4).required().messages({
        'any.required': 'otp is required.',
        'string.length': 'OTP must be exactly 4 characters long.'
    })
    
})
export const signInSchema = Joi.object({
    email:  generalRules.email.required(),
    password:generalRules.password.required()
})
export const refreshTokenSchema=Joi.object({ 
    authorization:Joi.string().messages({'any.required': 'authorization is required.'}).required()
})
export const resetPasswordSchema=Joi.object({ 
    email: generalRules.email.required(),
    otp: Joi.string().length(4).required().messages({
        'any.required': 'otp is required.',
        'string.length': 'OTP must be exactly 4 characters long.'
    }),
    newPassword: generalRules.password.required(),
    cNewPassword: generalRules.password.valid(Joi.ref('newPassword')).messages({
        'any.only': 'Confirm password must match the password.',
        'any.required': 'Confirm password is required.'
    }).required(),
})
export const emailSchema=Joi.object({ 
    email:  generalRules.email.required()
})
export const updateProfileSchema=Joi.object({
    firstName: Joi.string().messages({'any.required': 'firstName is required.'}),
    lastName: Joi.string().messages({'any.required': 'lastName is required.'}),
    mobileNumber: Joi.string().regex(/^01[0125][0-9]{8}$/).messages({
        'string.pattern.base': 'Phone number must be an Egyptian number and start with 010, 011, 012, or 015 followed by 8 digits.',
        'any.required': 'Phone number is required.'
    }),
    DOB: Joi.date().less(new Date(new Date().setFullYear(new Date().getFullYear() - 18)))
    .messages({
        "date.base": "Invalid date format.",
        "date.less": "User must be at least 18 years old."
    }),
    gender: Joi.string().valid(genderOptions.Female,genderOptions.Male).default(genderOptions.Male).messages({
        'any.only': 'Gender must be either Male or Female.',
        'any.required': 'Gender is required.'
    }),
    
})
export const idSchema=Joi.object({ 
    userId:generalRules.ObjectId.required().messages({
        'any.required': 'userId is required.'
    })
})
export const updatePasswordSchema=Joi.object({ 
    oldPassword:generalRules.password.required(),
    newPassword: generalRules.password.required(),
    cNewPassword: generalRules.password.valid(Joi.ref('newPassword')).messages({
        'any.only': 'Confirm password must match the password.',
        'any.required': 'Confirm password is required.'
    }).required(),
})
export const uploadProfilePicSchema=Joi.object({ 
    profilePic: Joi.object({
        public_id: Joi.string().required(),
        secure_url: Joi.string().uri().required(),})
})
export const uploadCoverPicSchema=Joi.object({ 
    coverPic: Joi.object({
        public_id: Joi.string().required(),
        secure_url: Joi.string().uri().required(),})
})


