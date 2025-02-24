import { AppGeneralError, asyncHandler } from "../utils/index.js"

export const roleOptions={
    User:'User',
    Admin:'Admin'
}

const authorization=(accessRoles=[])=>{
    return asyncHandler(
         async(req,res,next)=>{
            if(!accessRoles.includes(req.user.role)){
                return next(new AppGeneralError('Access denied: You do not have the required permissions.',403))
            }
            next()
         }
       )
    }
export default authorization
