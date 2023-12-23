import {ApiError} from "../utils/apierrorsHandle.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import user from "../models/user.model.js";
export const vetifyjwt = asyncHandler(async (req, res, next) => {
    const token =
        req.cookies || req.headers.authorization?.replace("Bearer ", "");
     console.log(typeof token);
    if (!token) throw new ApiError(401, "Unauthorized request");

    const decodedToken = jwt.verify(token, "mo123zamil");
    
    if (!decodedToken) {
        throw new ApiError(401, "Decoded token not found");
    }

    const User = await user
        .findOne(decodedToken?._id)
        .select("-password -refreshToken");

    if (!User) {
        throw new ApiError(401, "Invalid access token: User not found");
    }

    req.User = User;
    next();
});
