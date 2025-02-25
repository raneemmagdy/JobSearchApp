import { AppGeneralError, asyncHandler } from "../utils/index.js";

const validation = (schema) => {
    return asyncHandler(
        async (req, res, next) => {
            const inputData = { ...req.body, ...req.params, ...req.query };
            const { error } = schema.validate(inputData, { abortEarly: false });
            if (error) {
                return next(new AppGeneralError(error.details, 422));
            }
            next();
        }
    );
};

export const validationGraphQl = async ({ schema, data }) => {
    const { error } = schema.validate(data, { abortEarly: false });
    if (error) {
        throw new AppGeneralError(error.message, 400);
    }
};
export default validation