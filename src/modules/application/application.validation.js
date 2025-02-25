import Joi from "joi";
import { generalRules } from "../../utils/index.js";
import { applicationStatusOptions } from "../../DB/models/application.model.js";
export const addApplicationValidation = Joi.object({
    jobId: generalRules.ObjectId.required(),
    userCV: Joi.object({
        public_id: Joi.string().required(),
        secure_url: Joi.string().uri().required(),
    }),
});
export const processApplicationValidation = Joi.object({
    applicationId: generalRules.ObjectId.required().messages({
        "any.required": "Application ID is required.",
        "string.empty": "Application ID cannot be empty.",
        "string.pattern.base": "Invalid Application ID format."
    }),
    status: Joi.string().valid(applicationStatusOptions.accepted, applicationStatusOptions.rejected).required().messages({
        "any.required": "Application status is required.",
        "string.empty": "Application status cannot be empty.",
        "any.only": 'Status must be either accepted or rejected.'
    })
});

export const generateCompanyApplicationsReportValidation = Joi.object({
    companyId: generalRules.ObjectId.required(),
    date: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .required()
        .messages({
            "string.pattern.base": "Date format must be YYYY-MM-DD",
            "any.required": "Date is required",
        }),
});