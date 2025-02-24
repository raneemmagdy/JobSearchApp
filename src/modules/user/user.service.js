import { providerOptions, userModel } from "../../DB/models/index.js";
import { decodedToken, tokenTypes } from "../../middleware/authentication.js";
import { roleOptions } from "../../middleware/authorization.js";
import * as module from "../../utils/index.js";
import {OAuth2Client} from 'google-auth-library'


//------------------------------------------------signUp
export const signUp=async(req,res,next)=>{
   const {firstName,lastName,email,password,gender,mobileNumber,DOB,provider,role}=req.body
   if(await userModel.findOne({email})){
      return next(new module.AppGeneralError('Email Already Exist',409))
   }
   const users = await userModel.find();
   const isPhoneExist = users.some(user => user.mobileNumber === mobileNumber);
   if (isPhoneExist) {
       return next(new module.AppGeneralError("Phone Already Exist", 409));
   }
   let pathsForCoverImage={}
   let pathForProfileImage={}
   if(req?.files){
    if (req?.files?.coverPic) {
      const { public_id, secure_url } = await module.cloudinary.uploader.upload(req.files.coverPic[0].path, {
        folder: 'JobSearchApp/users',
      });
       pathsForCoverImage = { public_id, secure_url };
     }
  
    if (req?.files?.profilePic) {
          const { public_id, secure_url } = await module.cloudinary.uploader.upload(req.files.profilePic[0].path, {
           folder: 'JobSearchApp/users',
          });
           pathForProfileImage = { public_id, secure_url };
     }
   }
 

 
   const user= await userModel.create({firstName,lastName,email,password,gender,role,mobileNumber,DOB,provider,profilePic:pathForProfileImage,coverPic:pathsForCoverImage})
   module.emailEvent.emit('sendEmailConfirm',{firstName,email})
   
   return res.status(201).json({message:"User Created Successfully",user})
   
}


//------------------------------------------------confirmEmail
export const confirmEmail = async (req, res, next) => {
  const { email, otp } = req.body;
  const user = await userModel.findOne({ email });

  if (!user) {
    return next(new module.AppGeneralError("Email does not exist.", 404));
  }
  if (user.deletedAt) {
    return next(new module.AppGeneralError("User Already Deleted", 400));
  }

  if (user.isConfirmed) {
    return next(new module.AppGeneralError("Email is already confirmed.", 400));
  }

  const isBanned = await module.checkIfBanned(user);
  if (isBanned) {
    return next(new module.AppGeneralError("You are temporarily banned for 5 minutes. Please try again later.", 403));
  }

  if (!user.OTP || user.OTP.length === 0) {
    return next(new module.AppGeneralError("No OTP found. Please request a new one.", 400));
  }

  const latestOtp = user.OTP[user.OTP.length - 1];

  if (module.checkOtpExpiration(user)) {
    module.emailEvent.emit("sendEmailConfirm", { firstName: user.firstName, email });
    return next(new module.AppGeneralError("OTP expired. A new OTP has been sent via email.", 400));
  }
  if (latestOtp.type !== "confirmEmail") {
    return next(new module.AppGeneralError("Invalid OTP type.", 400));
  }

  const isOtpValid = await module.Compare({ key: otp, encryptedKey: latestOtp.code });

  if (!isOtpValid) {
    const attemptsExceeded = await module.handleFailedAttempt(user);
    if (attemptsExceeded.isBanned) {
      return next(new module.AppGeneralError("Too many failed attempts. You are temporarily banned for 5 minutes.", 403));
    }
    return next(new module.AppGeneralError(`Invalid OTP. You have ${attemptsExceeded.remainingAttempts} attempts remaining.`, 400));
  }

  await userModel.updateOne(
    { _id: user._id },
    {
      isConfirmed: true,
      $unset: { OTP: 1, failedAttempts: 1, bannedAt: 1, banExpiry: 1 },
    }
  );

  return res.status(200).json({ message: "Email confirmed successfully." });
};





const client = new OAuth2Client(process.env.CLIENT_ID);
async function verify(idToken) {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.CLIENT_ID,  
    })
const payload=ticket.getPayload()
return payload
}
//------------------------------------------------signUpWithGmail
export const signUpWithGmail=async(req,res,next)=>{

  const {idToken}=req.body
 const userData=await verify(idToken)
 const {email_verified,given_name,family_name,email,picture}=userData
 if(!email_verified){
    return next(new module.AppGeneralError('Email is invalid',400))
 }
 let user= await userModel.findOne({email})
 if(user){
  return next(new module.AppGeneralError('Email Already Exist',400))
 }
 user= await userModel.create({email,firstName:given_name,lastName:family_name,isConfirmed:true,provider:providerOptions.google,profilePic: { secure_url: picture }})

 const accessToken= await module.GenerateToken({payload:{email,id:user._id},JWT_SECRET:user.role==roleOptions.User?process.env.ACCESS_JWT_SECRET_USER:process.env.ACCESS_JWT_SECRET_ADMIN,option:{ expiresIn: '1h' }})
 const refreshToken= await module.GenerateToken({payload:{email,id:user._id},JWT_SECRET:user.role==roleOptions.User?process.env.REFRESH_JWT_SECRET_USER:process.env.REFRESH_JWT_SECRET_ADMIN,option:{ expiresIn: '7d' }})

 return res.status(201).json({message:'Done',Tokens:{accessToken,refreshToken}})
}


//------------------------------------------------signInWithGmail
export const signInWithGmail=async(req,res,next)=>{

    const {idToken}=req.body
    

 const userData=await verify(idToken)
 const {email_verified,email}=userData
 if(!email_verified){
    return next(new module.AppGeneralError('Email is invalid',400))
 }
 let user= await userModel.findOne({email})
 if(!user){
  return next(new module.AppGeneralError('Account not Found',404))
 }
 if (user.deletedAt) {
  return next(new module.module.AppGeneralError("User Already Deleted", 400));
}
 if(user.provider!=providerOptions.google){
    return next(new module.AppGeneralError('invalid provider,please Log In With in System',400))
 }
 const accessToken= await module.GenerateToken({payload:{email,id:user._id},JWT_SECRET:user.role==roleOptions.User?process.env.ACCESS_JWT_SECRET_USER:process.env.ACCESS_JWT_SECRET_ADMIN,option:{ expiresIn: '1h' }})
 const refreshToken= await module.GenerateToken({payload:{email,id:user._id},JWT_SECRET:user.role==roleOptions.User?process.env.REFRESH_JWT_SECRET_USER:process.env.REFRESH_JWT_SECRET_ADMIN,option:{ expiresIn: '7d' }})

 return res.status(201).json({message:'Done',Tokens:{accessToken,refreshToken}})
}


//------------------------------------------------signIn
export const signIn=async(req,res,next)=>{
   const { email,password} = req.body;
   const user =await userModel.findOne({ email });

   if (!user) {
       return next(new module.AppGeneralError('Invalid Email or Password',400));
   }
   if (user.deletedAt) {
    return next(new module.AppGeneralError("User Already Deleted", 400));
   }
   if (user.provider!=providerOptions.system) {
      return next(new module.AppGeneralError('please log in with google', 400));
   }
   if (!user.isConfirmed) {
      return next(new module.AppGeneralError('Email not Confirmed yet', 400));
   }
   if(!await module.Compare({key:password,encryptedKey:user.password})){
      return next(new module.AppGeneralError('invalid Email Or Password',400))
   }
    const accessToken= await module.GenerateToken({payload:{email,id:user._id},JWT_SECRET:user.role==roleOptions.User?process.env.ACCESS_JWT_SECRET_USER:process.env.ACCESS_JWT_SECRET_ADMIN,option:{ expiresIn: '1h' }})
    const refreshToken= await module.GenerateToken({payload:{email,id:user._id},JWT_SECRET:user.role==roleOptions.User?process.env.REFRESH_JWT_SECRET_USER:process.env.REFRESH_JWT_SECRET_ADMIN,option:{ expiresIn: '7d' }})
   
   return res.status(200).json({message:"User loged In Successfully",user, tokens:{accessToken,refreshToken}})
}


//------------------------------------------------refreshToken
export const refreshTokenCheck=async(req,res,next)=>{
   const {authorization}=req.body
   const user= await decodedToken({authorization,tokenType:tokenTypes.refresh,next})
   if (user.changeCredentialTime) {
      const tokenIssuedAt = payload.iat ; 
      const changeCredentialTime = parseInt(user.changeCredentialTime.getTime()/1000);
      if (tokenIssuedAt <=changeCredentialTime) {
          return next(new module.AppGeneralError('Password was updated after this token was issued. Please log in again.',403));
      }
   }
   const accessToken= await module.GenerateToken({payload:{email:user.email,id:user._id},JWT_SECRET:user.role==roleOptions.User?process.env.ACCESS_JWT_SECRET_USER:process.env.ACCESS_JWT_SECRET_ADMIN,option:{ expiresIn: '1h' }})

   return res.status(200).json({message:"Done",user, token:{accessToken}})
}


//------------------------------------------------forgetPassword
export const forgetPassword=async(req,res,next)=>{
   const {email}=req.body
   const user =await userModel.findOne({email})
   if(!user){
      return next(new module.AppGeneralError('invalid Email',400))
   }
   if(user.deletedAt){
      return next(new module.AppGeneralError('Account has been deleted', 400));
   }
   module.emailEvent.emit('sendEmailForgetPassword',{firstName:user.firstName,email})
   return res.status(200).json({message:"OTP send Successfully"})
}


//------------------------------------------------resetPassword
export const resetPassword = async (req, res, next) => {
  const { email, otp, newPassword } = req.body;
  const user = await userModel.findOne({ email });

  if (!user) {
    return next(new module.AppGeneralError("Invalid Email",400));
  }

  if (user.deletedAt) {
    return next(new module.AppGeneralError("Account has been deleted",400));
  }

  const hashPassword = await module.Hash({
    key: newPassword,
    SALT_ROUND: process.env.SALT_ROUND,
  });

  const isBanned = await module.checkIfBanned(user);
  if (isBanned) {
    return next(
      new module.AppGeneralError(
        "You are temporarily banned for 5 minutes. Please try again later.",
        403
      )
    );
  }

  if (!user.OTP || user.OTP.length === 0) {
    return next(new module.AppGeneralError("No OTP found. Please request a new one.", 400));
  }

  const latestOtp = user.OTP[user.OTP.length - 1];

  if (new Date(latestOtp.expiresIn) < new Date()) {
    module.emailEvent.emit("sendEmailForgetPassword", { firstName: user.firstName, email });
    return next(new module.AppGeneralError("OTP expired. A new OTP has been sent via email.", 400));
  }

  
  if (!latestOtp || latestOtp.type !== "forgetPassword") {
    return next(new module.AppGeneralError("Invalid OTP type.", 400));
  }

  const isOtpValid = await module.Compare({ key: otp, encryptedKey: latestOtp.code });

  if (!isOtpValid) {
    const attemptsExceeded = await module.handleFailedAttempt(user);
    if (attemptsExceeded.isBanned) {
      return next(
        new module.AppGeneralError(
          "Too many failed attempts. You are temporarily banned for 5 minutes.",
          403
        )
      );
    }
    return next(
      new module.AppGeneralError(
        `Invalid OTP. You have ${attemptsExceeded.remainingAttempts} attempts remaining.`,
        400
      )
    );
  }

  await userModel.updateOne(
    { _id: user._id },
    {
      $set: {
        changeCredentialTime: Date.now(),
        password: hashPassword,
      },
      $unset: { OTP: 1, failedAttempts: 1, bannedAt: 1, banExpiry: 1 },
    }
  );

  return res.status(200).json({ message: "Password reset successfully" });
};


//------------------------------------------------updateProfile
export const updateProfile=async(req,res,next)=>{
   const { gender, firstName, lastName,DOB,mobileNumber } = req.body;
   const userId = req.user._id;
   const user = await userModel.findById(userId);
   if (!user) {
     return next(new module.AppGeneralError('User Not Found',404));
   }
   if (user.deletedAt) {
     return next(new module.AppGeneralError('Account has been deleted',400));
   }
   const users = await userModel.find();
   const isPhoneExist = users.some(user => user.mobileNumber === mobileNumber);
   if (isPhoneExist) {
       return next(new module.AppGeneralError("Phone Already Exist", 409));
   }
   const encryptedPhone=await module.Encrypt({key:mobileNumber,SECRET_KEY:process.env.SECRET_KEY_PHONE})
   const updatedUser = await userModel.findByIdAndUpdate(
     userId,
     {
      gender, firstName, lastName,DOB,mobileNumber:encryptedPhone
     },
     { new: true }
   );

   return res.status(200).json({ message: 'Profile Updated Successfully', user: updatedUser });
}


//------------------------------------------------getProfileData
export const getProfileData=async(req,res,next)=>{
  const user = await userModel.findOne({ _id: req.user.id }).select("-password");
  if (!user) {
    return next(new module.AppGeneralError("User not found", 404));
  }
  if (user.deletedAt) {
    return next(new module.AppGeneralError('Account has been deleted', 400));
  }
   return res.status(200).json({ message: "Success", user });

}


//------------------------------------------------getUserProfileById
export const getUserProfileById = async (req, res, next) => {
  const { userId } = req.params;

  const user = await userModel.findOne({ _id: userId }).select("-_id");

  if (!user) {
      return next(new module.AppGeneralError("User not found", 404));
  }
  if (user.deletedAt) {
    return next(new module.AppGeneralError('Account has been deleted', 400));
  }
  return res.status(200).json({
      message: "Success",
      user: {
        userName: user.firstName + ' ' + user.lastName,
        mobileNumber:user.mobileNumber,
        profilePic: user.profilePic,
        coverPic: user.coverPic,
      },
  });
}


//------------------------------------------------updatePassword
export const updatePassword=async(req,res,next)=>{
  const {oldPassword,newPassword}=req.body
  const user =await userModel.findById({_id:req.user._id})
  if(!user){
     return next(new module.AppGeneralError('User Not Found',404))
  }
  if(user.deletedAt){
     return next(new  module.AppGeneralError('Account has been deleted', 400));
  }
  
  if(! await module.Compare({key:oldPassword,encryptedKey:user.password})){
     return next(new  module.AppGeneralError('Invalid Old Password', 400));
       
  }

  const hashPassword= await module.Hash({key:newPassword,SALT_ROUND:process.env.SALT_ROUND})
  const updatedUser = await userModel.findByIdAndUpdate(
     user._id,
     {
      password:hashPassword,
      changeCredentialTime:Date.now()
     },
     { new: true }
   );

  return res.status(200).json({message:"Password Updated successfully",user:updatedUser})
}


//------------------------------------------------uploadProfilePic
export const uploadProfilePic = async (req, res, next) => {
    const userId = req.user._id;

    if (!req.file) {
      return next(new module.AppGeneralError("No file uploaded", 400));
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return next(new module.AppGeneralError("User not found", 404));
    }
    if(user.deletedAt){
      return next(new  module.AppGeneralError('Account has been deleted', 400));
    }
    if (user.profilePic?.public_id) {
      await module.cloudinary.uploader.destroy(user.profilePic.public_id);
    }

    const { public_id, secure_url } = await module.cloudinary.uploader.upload(req.file.path, {
      folder: "JobSearchApp/users",
    });

    await userModel.updateOne(
      { _id: userId },
      { profilePic: { public_id, secure_url } }
    );

    return res.status(200).json({
      message: "Profile picture updated successfully",
      profilePic: secure_url
    });

}



//------------------------------------------------uploadCoverPic
export const uploadCoverPic = async (req, res, next) => {
    const userId = req.user._id;
    if (!req.file) {
      return next(new module.AppGeneralError("No file uploaded", 400));
    }
    const user = await userModel.findById(userId);
    if (!user) {
      return next(new module.AppGeneralError("User not found", 404));
    }
    if(user.deletedAt){
      return next(new  module.AppGeneralError('Account has been deleted', 400));
    }
    if (user.coverPic?.public_id) {
      await module.cloudinary.uploader.destroy(user.coverPic.public_id);
    }
    const { public_id, secure_url } = await module.cloudinary.uploader.upload(req.file.path, {
      folder: "JobSearchApp/users",
    });
    await userModel.updateOne(
      { _id: userId },
      { coverPic: { public_id, secure_url } }
    );

    return res.status(200).json({
      message: "Cover picture updated successfully",
      coverPic: secure_url
    });

}



//------------------------------------------------deleteProfilePic
export const deleteProfilePic = async (req, res, next) => {
  const userId = req.user._id;
  const user = await userModel.findById(userId);
  if (!user) {
    return next(new module.AppGeneralError("User not found", 404));
  }
  if(user.deletedAt){
    return next(new  module.AppGeneralError('Account has been deleted', 400));
  }
  if (!user.profilePic?.public_id) {
    return next(new module.AppGeneralError("No profile picture to delete", 400));
  }

  await module.cloudinary.uploader.destroy(user.profilePic.public_id);

  await userModel.updateOne({ _id: userId }, { $unset: { profilePic: 1 } });

  return res.status(200).json({
    message: "Profile picture deleted successfully",
  });
};




//------------------------------------------------deleteCoverPic
export const deleteCoverPic = async (req, res, next) => {
  const userId = req.user._id;
  const user = await userModel.findById(userId);
  if (!user) {
    return next(new module.AppGeneralError("User not found", 404));
  }
  if(user.deletedAt){
    return next(new  module.AppGeneralError('Account has been deleted', 400));
  }
  if (!user.coverPic?.public_id) {
    return next(new module.AppGeneralError("No profile picture to delete", 400));
  }

  await module.cloudinary.uploader.destroy(user.coverPic.public_id);

  await userModel.updateOne({ _id: userId }, { $unset: { coverPic: 1 } });

  return res.status(200).json({
    message: "Cover picture deleted successfully",
  });
};




//------------------------------------------------softDeleteAccount
export const softDeleteAccount = async (req, res, next) => {
  const userId = req.user._id; 

  const user = await userModel.findById(userId);
  if (!user) {
      return next(new module.AppGeneralError("User not found", 404));
  }
  if (user.deletedAt) {
      return next(new module.AppGeneralError("Account is already deleted", 400));
  }

  await userModel.updateOne(
      { _id: userId },
      { deletedAt: new Date() }
  );

  return res.status(200).json({ message: "Account deleted successfully (Soft Delete)" });
};
