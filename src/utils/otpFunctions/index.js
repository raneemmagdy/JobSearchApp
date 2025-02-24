import { userModel } from "../../DB/models/index.js";

export const checkIfBanned = async (user) => {
    const currentTime = Date.now();
    if (user.bannedAt && currentTime >= user.banExpiry) {
        await userModel.updateOne(
            { _id: user._id },
            { $unset: { bannedAt: 1, banExpiry: 1, failedAttempts: 1 } }
        );
        return false;
    }
    return user.bannedAt && currentTime < user.banExpiry;
};

export const checkOtpExpiration = (user) => {
    if (!user.OTP || user.OTP.length === 0) return true;
    const latestOtp = user.OTP[user.OTP.length - 1];
    const currentTime = Date.now();
    const otpTime = new Date(latestOtp.expiresIn).getTime();
    console.log("currentTime :" ,currentTime);
    console.log("otpTime :" ,otpTime);
    console.log("latestOtp :" ,latestOtp);
    return currentTime > otpTime;
};

export const handleFailedAttempt = async (user) => {
    const MAX_ATTEMPTS = 5;
    const BAN_DURATION = 5 * 60 * 1000; 

    const failedAttempts = (user.failedAttempts || 0) + 1;
    const remainingAttempts = MAX_ATTEMPTS - failedAttempts;

    if (failedAttempts >= MAX_ATTEMPTS) {
        await userModel.updateOne(
            { _id: user._id },
            { 
                bannedAt: new Date(), 
                banExpiry: new Date(Date.now() + BAN_DURATION), 
                failedAttempts: 0 
            }
        );
        return { isBanned: true, message: "Too many failed attempts. You are temporarily banned for 5 minutes." };
    }

    await userModel.updateOne(
        { _id: user._id },
        { failedAttempts }
    );
    return {
        isBanned: false,
        remainingAttempts,
        message: `Invalid OTP. You have ${remainingAttempts} attempts remaining.`,
    };
};
