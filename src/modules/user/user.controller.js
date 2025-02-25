import { Router } from "express";
import validation from "../../middleware/validation.js";
import { asyncHandler } from "../../utils/index.js";
import * as userValidation from './user.validation.js'
import * as userServices from './user.service.js'
import { formatOptions, multerHost } from "../../middleware/multer.js";
import authentication from "../../middleware/authentication.js";


const userRouter = Router()
userRouter.post('/signup', multerHost(formatOptions.image).fields([{ name: "profilePic", maxCount: 1 }, { name: "coverPic", maxCount: 1 }]), validation(userValidation.signUpSchema), asyncHandler(userServices.signUp))
userRouter.patch('/confirmEmail', validation(userValidation.confirmSchema), asyncHandler(userServices.confirmEmail))
userRouter.post('/signInWithGmail', validation(userValidation.signInOrSignUpWithGmailSchema), asyncHandler(userServices.signInWithGmail))
userRouter.post('/signUpWithGmail', validation(userValidation.signInOrSignUpWithGmailSchema), asyncHandler(userServices.signUpWithGmail))
userRouter.post('/signin', validation(userValidation.signInSchema), asyncHandler(userServices.signIn))
userRouter.get('/refreshToken', validation(userValidation.refreshTokenSchema), asyncHandler(userServices.refreshTokenCheck))
userRouter.patch('/forgetPassword', validation(userValidation.emailSchema), asyncHandler(userServices.forgetPassword))
userRouter.patch('/resetPassword', validation(userValidation.resetPasswordSchema), asyncHandler(userServices.resetPassword))
userRouter.patch('/updateProfile', validation(userValidation.updateProfileSchema), authentication, asyncHandler(userServices.updateProfile))
userRouter.get('/getProfile', authentication, asyncHandler(userServices.getProfileData))
userRouter.get('/:userId', validation(userValidation.idSchema), asyncHandler(userServices.getUserProfileById))
userRouter.patch('/updatePassword', validation(userValidation.updatePasswordSchema), authentication, asyncHandler(userServices.updatePassword))
userRouter.post('/uploadProfilePic', multerHost(formatOptions.image).single('profilePic'), validation(userValidation.uploadProfilePicSchema), authentication, asyncHandler(userServices.uploadProfilePic))
userRouter.post('/uploadCoverPic', multerHost(formatOptions.image).single('coverPic'), validation(userValidation.uploadCoverPicSchema), authentication, asyncHandler(userServices.uploadCoverPic))
userRouter.delete('/deleteProfilePic', authentication, asyncHandler(userServices.deleteProfilePic))
userRouter.delete('/deleteCoverPic', authentication, asyncHandler(userServices.deleteCoverPic))
userRouter.delete('/softDelete', authentication, asyncHandler(userServices.softDeleteAccount))






export default userRouter