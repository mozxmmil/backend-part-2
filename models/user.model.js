import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userschema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "password is required"],
        },
        name: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avtar: {
            type: String,
            required: true,
        },
        coverImage: {
            type: String,
        },
        watchHistory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
        },
        refreshToken: {
            type: String,
        },
    },
    {timestamps: true}
);

userschema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userschema.methods.ispasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userschema.methods.generateAuthToken = function () {
    return jwt.sign(
        {
            id: this._id,
            username: this.username,
            email: this.email,
            name: this.name,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
        }
    );
};

userschema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
        }
    );
};

const User = mongoose.model("User", userschema);

export default User;
