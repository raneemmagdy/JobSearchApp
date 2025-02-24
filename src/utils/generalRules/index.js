import { Types } from "mongoose"
import Joi from "joi"
const customId=(value,helper)=>{
    const data =Types.ObjectId.isValid(value)
    return data?data:helper.message('Invalid ID !')
}
export const generalRules={
    ObjectId:Joi.custom(customId),
    email: Joi.string().email().regex(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).messages({
        'string.email': 'Invalid email format.',
        'string.pattern.base': 'Email does not match the required format.',
        'any.required': 'Email is required.'
    }),
    password: Joi.string()
         .pattern(new RegExp(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/))
         .messages({
            'string.pattern.base': 'Password must be at least 8 characters, Password must contain at least one letter, one number, and one special character.',
            'any.required': 'Password is required.'
    })
}