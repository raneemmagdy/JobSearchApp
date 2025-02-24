import Joi from "joi";
import { generalRules } from "../../utils/index.js";
import { employeeRanges } from "../../DB/models/company.model.js";

export const addCompanySchema = Joi.object({
  companyName: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": "Company name is required.",
      "any.required": "Company name is required."
    }),

  description: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": "Description is required.",
      "any.required": "Description is required."
    }),

  industry: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": "Industry is required.",
      "any.required": "Industry is required."
    }),

  address: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": "Address is required.",
      "any.required": "Address is required."
    }),

  numberOfEmployees: Joi.string()
    .valid(...employeeRanges)
    .required()
    .messages({
        "any.only": `Number of employees must be one of the allowed ranges: ${employeeRanges.join(", ")}.`,
        "any.required": "Number of employees is required."
    }),

  companyEmail: generalRules.email.required().messages({
    "string.empty": "Company email is required.",
    "any.required": "Company email is required.",
    "string.email": "Please enter a valid email address."
  }),
  
  coverPic: Joi.object({
    public_id: Joi.string().required(),
    secure_url: Joi.string().uri().required(),}),
  logo: Joi.object({
    public_id: Joi.string().required(),
    secure_url: Joi.string().uri().required(),}),
  legalAttachment: Joi.object({
          public_id: Joi.string().required(),
          secure_url: Joi.string().uri().required(),})
 
})
export const updateCompanySchema = Joi.object({
    companyName: Joi.string().trim().messages({
      "string.empty": "Company name cannot be empty."
    }),
    description: Joi.string().trim().messages({
      "string.empty": "Description cannot be empty."
    }),
    industry: Joi.string().trim().messages({
      "string.empty": "Industry cannot be empty."
    }),
    address: Joi.string().trim().messages({
      "string.empty": "Address cannot be empty."
    }),
    numberOfEmployees: Joi.string()
      .valid(...employeeRanges)
      .messages({
        "any.only": `Number of employees must be one of the allowed ranges: ${employeeRanges.join(", ")}.`,
      }),
    companyEmail: Joi.string().email().trim().messages({
      "string.email": "Please enter a valid email address."
    }),
    coverPic: Joi.object({
      public_id: Joi.string().required(),
      secure_url: Joi.string().uri().required()
    }),
    logo: Joi.object({
      public_id: Joi.string().required(),
      secure_url: Joi.string().uri().required()
    }),
    companyId:generalRules.ObjectId.required()
});
export const idCompanySchema = Joi.object({
    companyId:generalRules.ObjectId.required()
});
export const addOrRemoveHRToCompanySchema = Joi.object({
    companyId:generalRules.ObjectId.required(),
    userId:generalRules.ObjectId.required(),
});
export const searchCompanyByNameSchema = Joi.object({
    name:Joi.string().required().messages({
      "any.required": "name is required."
   }),
    page:Joi.number()
});
export const uploadCompanyLogoSchema = Joi.object({
  companyId:generalRules.ObjectId.required(),
  logo: Joi.object({
    public_id: Joi.string().required(),
    secure_url: Joi.string().uri().required()
  }).messages({
    "any.required": "logo is required.",
    "string.empty": "logo cannot be empty."
  })
});
export const uploadCompanyCoverSchema = Joi.object({
  companyId:generalRules.ObjectId.required(),
  coverPic: Joi.object({
    public_id: Joi.string().required(),
    secure_url: Joi.string().uri().required()
  }).messages({
    "any.required": "coverPic is required.",
    "string.empty": "coverPic cannot be empty."
  })
});