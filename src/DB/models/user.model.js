import mongoose from "mongoose";
import { roleOptions } from "../../middleware/authorization.js";
import { Decrypt, Encrypt, Hash } from "../../utils/index.js";
import { applicationModel, chatModel, companyModel, jobModel } from "./index.js";

export const genderOptions = {
    Male: 'Male',
    Female: 'Female'
}

export const providerOptions = {
    system: 'system',
    google: 'google'
}
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'firstName is required.']
    },
    lastName: {
        type: String,
        required: [true, 'lastName is required.']
    },
    email: {
        type: String,
        lowercase: true,
        required: [true, 'Email is required.'],
        match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please provide a valid email address.'],
        unique: [true, 'Email already Exist']

    },
    password: {
        type: String,
        minLength: [8, 'Password must be at least 8 characters long.'],
        required: function () {
            return this.provider == providerOptions.system ? true : false
        }

    },
    provider: {
        type: String,
        enum: Object.values(providerOptions),
        default: providerOptions.system
    },
    gender: {
        type: String,
        enum: Object.values(genderOptions),
        default: genderOptions.Male
    },
    DOB: {
        type: Date,
        required: function () {
            return this.provider == providerOptions.system ? true : false
        },
        validate: {
            validator: function (value) {
                const today = new Date();
                const minDate = new Date();
                minDate.setFullYear(today.getFullYear() - 18);

                return value <= minDate;
            },
            message: "User must be at least 18 years old.",
        },
    },

    mobileNumber: {
        type: String,
        unique: [true, 'mobileNumber already Exist'],
        required: function () {
            return this.provider == providerOptions.system ? true : false
        }

    },
    role: {
        type: String,
        enum: Object.values(roleOptions),
        default: roleOptions.User,

    },
    isConfirmed: {
        type: Boolean
    },
    deletedAt: Date,
    bannedAt: Date,
    banExpiry: Date,
    failedAttempts: Number,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changeCredentialTime: Date,
    profilePic: {
        public_id: String,
        secure_url: String
    },
    coverPic: {
        public_id: String,
        secure_url: String
    },
    OTP: [
        {
            code: { type: String, required: true },
            type: {
                type: String,
                enum: ["confirmEmail", "forgetPassword"],
                required: true,
            },
            expiresIn: { type: Date, required: true },
        },
    ]

}, {
    timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true },
    virtuals: {
        username: {
            get() { return `${this.firstName}` + ' ' + `${this.lastName}` },
            set(value) {
                const [firstName, lastName] = value.split(' ')
                this.set({ firstName, lastName })
            }
        }
    }
})

userSchema.pre("findOneAndUpdate", async function (next) {
    const update = this.getUpdate();
    
    if (update.deletedAt) {
        const userId = this.getQuery()._id; 
   
        await applicationModel.updateMany({ userId }, { $set: { deletedAt: new Date() } });

        await chatModel.updateMany({ 
            $or: [{ senderId: userId }, { receiverId: userId }]
        }, { $set: { deletedAt: new Date() } });

        await jobModel.updateMany({ addedBy: userId }, { closed: true });

        await companyModel.updateMany({ createdBy: userId }, { $set: { deletedAt: new Date() } });

    }
    
    next();
});



userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await Hash({ key: this.password, SALT_ROUND: process.env.SALT_ROUND })
    }
    if (this.isModified("mobileNumber")) {
        this.mobileNumber = await Encrypt({ key: this.mobileNumber, SECRET_KEY: process.env.SECRET_KEY_PHONE })
    }
    next();
});

userSchema.post("findOne", async function (doc, next) {
    if (doc && doc.mobileNumber) {
        doc.mobileNumber = await Decrypt({ key: doc.mobileNumber, SECRET_KEY: process.env.SECRET_KEY_PHONE });
    }
    next()
});
userSchema.post("find", async function (docs, next) {

    for (const doc of docs) {
        if (doc.mobileNumber) {
            doc.mobileNumber = await Decrypt({
                key: doc.mobileNumber,
                SECRET_KEY: process.env.SECRET_KEY_PHONE,
            });
        }
    }
    next()

});



export const userModel = mongoose.models.User || mongoose.model('User', userSchema)
