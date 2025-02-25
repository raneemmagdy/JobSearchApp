import { userModel } from "../DB/models/index.js";
import { AppGeneralError, asyncHandler, VerifyToken } from "../utils/index.js";
export const tokenTypes = {
    access: 'access',
    refresh: 'refresh'
}
export const decodedToken = async ({ authorization, tokenType, next }) => {

    if (!authorization) {
        return next(new AppGeneralError('Token Not Found', 404))
    }
    const [prefix, token] = authorization.split(' ')

    if (!prefix) {
        return next(new AppGeneralError('Token prefix not found', 404));
    }
    if (!token) {
        return next(new AppGeneralError('Token not found', 404));
    }
    let JWT_SECRET = undefined
    if (prefix == process.env.PREFIX_FOR_USER) {
        JWT_SECRET = tokenType === tokenTypes.access ? process.env.ACCESS_JWT_SECRET_USER : process.env.REFRESH_JWT_SECRET_USER
    } else if (prefix == process.env.PREFIX_FOR_ADMIN) {
        JWT_SECRET = tokenType === tokenTypes.access ? process.env.ACCESS_JWT_SECRET_ADMIN : process.env.REFRESH_JWT_SECRET_ADMIN
    } else {
        return next(new AppGeneralError('Invalid token prefix. Unauthorized access.', 400))
    }

    const payload = await VerifyToken({ token, JWT_SECRET })
    if (!payload?.email || !payload?.id) {
        return next(new AppGeneralError('Invalid token payload', 400))
    }
    const user = await userModel.findById({ _id: payload.id })
    if (!user) {
        return next(new AppGeneralError('User Not Found', 404))
    }
    if (user?.deletedAt) {
        return next(new AppGeneralError('User Is Deleted(Soft Delete)', 400));
    }
    if (parseInt(user?.changeCredentialTime?.getTime() / 1000) > payload.iat) {
        return next(new AppGeneralError('Token has expired. Please log in again.', 400));
    }
    return user

}

const authentication = asyncHandler(
    async (req, res, next) => {
        const { authorization } = req.headers
        const user = await decodedToken({ authorization, tokenType: tokenTypes.access, next })
        req.user = user
        next()
    }
)
export const authSocket = async ({ socket, tokenType = tokenTypes.access }) => {

    const { authorization } = socket.handshake.auth
    if (!authorization) {
        return { message: 'Token Not Found', statusCode: 404 }
    }
    const [prefix, token] = authorization.split(' ')

    if (!prefix) {
        return { message: 'Token prefix not found', statusCode: 404 };
    }
    if (!token) {
        return { message: 'Token not found', statusCode: 404 };
    }
    let JWT_SECRET = undefined
    if (prefix == process.env.PREFIX_FOR_USER) {
        JWT_SECRET = tokenType === tokenTypes.access ? process.env.ACCESS_JWT_SECRET_USER : process.env.REFRESH_JWT_SECRET_USER
    } else if (prefix == process.env.PREFIX_FOR_ADMIN) {
        JWT_SECRET = tokenType === tokenTypes.access ? process.env.ACCESS_JWT_SECRET_ADMIN : process.env.REFRESH_JWT_SECRET_ADMIN
    } else {
        return { message: 'Invalid token prefix. Unauthorized access.', statusCode: 400 }
    }

    try {
        const payload = await VerifyToken({ token, JWT_SECRET });
        if (!payload?.email || !payload?.id) {
            return { message: 'Invalid token payload', statusCode: 400 };
        }

        const user = await userModel.findById({ _id: payload.id });
        if (!user) {
            return { message: 'User Not Found', statusCode: 404 };
        }
        if (user?.deletedAt) {
            return { message: 'User Is Deleted (Soft Delete)', statusCode: 400 };
        }
        if (parseInt(user?.changeCredentialTime?.getTime() / 1000) > payload.iat) {
            return { message: 'Token has expired. Please log in again.', statusCode: 400 };
        }

        return { user, statusCode: 200 };
    } catch (error) {
        return { message: 'Invalid token', statusCode: 401 };
    }
}
export default authentication