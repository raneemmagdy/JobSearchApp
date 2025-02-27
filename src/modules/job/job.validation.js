import Joi from "joi";
import { jobLocationOptions, seniorityLevels, workingTimeOptions } from "../../DB/models/JobOpportunity.model.js";
import { generalRules } from "../../utils/index.js";
export const addJobValidationSchema = Joi.object({
        jobTitle: Joi.string().trim().required().messages({
                "string.base": "Job title must be a string.",
                "string.empty": "Job title is required.",
                "any.required": "Job title is required."
        }),
        jobLocation: Joi.string()
                .valid(...Object.values(jobLocationOptions)).required().messages({
                        "any.only": "Job location must be one of: " + Object.values(jobLocationOptions).join(", "),
                        "any.required": "Job location is required."
                }),
        workingTime: Joi.string().valid(...Object.values(workingTimeOptions)).required().messages({
                "any.only": "Working time must be one of: " + Object.values(workingTimeOptions).join(", "),
                "any.required": "Working time is required."
        }),
        seniorityLevel: Joi.string().valid(...Object.values(seniorityLevels)).required().messages({
                "any.only": "Seniority level must be one of: " + Object.values(seniorityLevels).join(", "),
                "any.required": "Seniority level is required."
        }),
        jobDescription: Joi.string().trim().required().messages({
                "string.base": "Job description must be a string.",
                "string.empty": "Job description is required.",
                "any.required": "Job description is required."
        }),
        technicalSkills: Joi.array().items(Joi.string().trim()).min(1).required().messages({
                "array.base": "Technical skills must be an array.",
                "array.min": "At least one technical skill is required.",
                "any.required": "Technical skills are required."
        }),
        softSkills: Joi.array().items(Joi.string().trim()).min(1).required().messages({
                "array.base": "Soft skills must be an array.",
                "array.min": "At least one soft skill is required.",
                "any.required": "Soft skills are required."
        }),
        companyId: generalRules.ObjectId.required()
})
export const updateJobValidationSchema = Joi.object({
        jobTitle: Joi.string().trim().messages({
                "string.base": "Job title must be a string."
        }),
        jobLocation: Joi.string()
                .valid(...Object.values(jobLocationOptions)).messages({
                        "any.only": "Job location must be one of: " + Object.values(jobLocationOptions).join(", "),

                }),
        workingTime: Joi.string().valid(...Object.values(workingTimeOptions)).messages({
                "any.only": "Working time must be one of: " + Object.values(workingTimeOptions).join(", "),

        }),
        seniorityLevel: Joi.string().valid(...Object.values(seniorityLevels)).messages({
                "any.only": "Seniority level must be one of: " + Object.values(seniorityLevels).join(", "),

        }),
        jobDescription: Joi.string().trim().messages({
                "string.base": "Job description must be a string.",
                "string.empty": "Job description is required.",

        }),
        technicalSkills: Joi.array().items(Joi.string().trim()).min(1).messages({
                "array.base": "Technical skills must be an array.",
                "array.min": "At least one technical skill is required.",

        }),
        softSkills: Joi.array().items(Joi.string().trim()).min(1).messages({
                "array.base": "Soft skills must be an array.",
                "array.min": "At least one soft skill is required.",
        }),
        jobId: generalRules.ObjectId.required(),
        companyId: generalRules.ObjectId.required(),
})
export const deleteJobValidationSchema = Joi.object({
        jobId: generalRules.ObjectId.required(),
        companyId: generalRules.ObjectId.required()
})
export const getJobsOrSpecificJobValidation = Joi.object({
        companyId: generalRules.ObjectId,
        jobId: generalRules.ObjectId,
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).default(2),
        name: Joi.string().trim()
});
export const getFilteredJobsValidation = Joi.object({
        companyId: generalRules.ObjectId,
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).default(2),
        jobLocation: Joi.string()
                .valid(...Object.values(jobLocationOptions)).messages({
                        "any.only": "Job location must be one of: " + Object.values(jobLocationOptions).join(", "),

                }),
        workingTime: Joi.string().valid(...Object.values(workingTimeOptions)).messages({
                "any.only": "Working time must be one of: " + Object.values(workingTimeOptions).join(", "),

        }),
        seniorityLevel: Joi.string().valid(...Object.values(seniorityLevels)).messages({
                "any.only": "Seniority level must be one of: " + Object.values(seniorityLevels).join(", "),

        }),
        jobTitle: Joi.string().trim().messages({
                "string.base": "Job title must be a string."
        }),
        technicalSkills: Joi.string()
});
export const getJobApplicationsValidation = Joi.object({
        companyId: generalRules.ObjectId.required(),
        jobId: generalRules.ObjectId.required(),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).default(2),

});
export const getAllJobWithAppForSpecificCompanyValidation = Joi.object({
        companyId: generalRules.ObjectId.required()

});