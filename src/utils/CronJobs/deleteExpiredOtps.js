import cron from "node-cron";
import { userModel } from "../../DB/models/index.js";


const deleteExpiredOtps = () => {
    cron.schedule("0 */6 * * *", async () => { 
      try {
        const now = new Date();

        const usersWithExpiredOtps = await userModel.find({
          "OTP.expiresIn": { $lt: now }
        });
     
  
        const result = await userModel.updateMany(
          { "OTP.expiresIn": { $lt: now } },
          { $pull: { OTP: { expiresIn: { $lt: now } } } }
        );
  
        console.log(`Expired OTPs cleanup completed. Modified Count: ${result.modifiedCount}`);
      } catch (error) {
        console.error("Error in CRON Job (Delete Expired OTPs):", error);
      }
    });
  
    console.log("OTP Expiry CRON Job is running...");
};
  

export default deleteExpiredOtps;
