import asynHandler from "../utils/asyncHandler.js";
import user from "../models/user.model.js";
import {ApiError} from "../utils/apierrorsHandle.js";
import {ApiResponce} from "../utils/apiResponce.js";
import {v2 as cloudinary} from "cloudinary";
import fs from "fs";
import jwt from "jsonwebtoken";

///yaha pe ham log ak method bna rhe hai jisse assani hoe..!!!!
const GenrateAccesTOkenandRefreshToken = async (userid) => {
    let User = await user.findById(userid);
    const accesToken = await User.generateAuthToken();
    const refreshToken = await User.generateRefreshToken();
    User.refreshToken = refreshToken;
    await User.save({
        validateBeforeSave: false,
    });

    return {accesToken, refreshToken};
    /// yaha pe ham usermodel se accestoken aur refresh token gerrate kr rhe hai !!
    /// uske liye ak method bana rhe hai...
};
const registerUser = asynHandler(async (req, res) => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_CLOUD_KEY,
        api_secret: process.env.CLOUDINARY_CLOUD_SECRET,
    });

    const {username, email, password, name} = req.body;

    if (
        [username, email, password, name].some((filed) => filed?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }
    const finduser = await user.findOne({
        //$or ka use multiple condition in query ke liye use kiya jaa rha hai...
        $or: [{username}, {email}],
    });
    if (finduser) throw new ApiError(400, "User already exists");

    let localavtar = req.files?.avtar[0].path;
    let localcoverImage = req.files?.coverImage[0].path;
    // let localcoverImage
    // let localcoverImage;
    // if (
    //     req.files &&
    //     Array.isArray(req.files.coverImage) &&
    //     req.files.coverImage.length > 0
    // ) {
    //     localcoverImage = req.files.coverImage[0].path;
    // }

    if (!localavtar) {
        throw new ApiError(401, "avtar required");
    }

    const avtar = await cloudinary.uploader.upload(localavtar, {
        resource_type: "image",
    });

    if (!avtar) {
        throw new ApiError(400, "avtar not uploaded nhi hua");
    }

    fs.unlinkSync(localavtar);
    if (!avtar) {
        fs.unlinkSync(localavtar);
    }

    // Optionally rethrow the error or handle it further
    // throw new ApiError(500, "Unexpected error during avatar upload");

    //upload the file on cloudinary

    const coverImage = await cloudinary.uploader.upload(localcoverImage, {
        resource_type: "image",
    });
    fs.unlinkSync(localcoverImage);
    if (!coverImage) {
        fs.unlinkSync(localcoverImage);
    }

    if (!avtar) throw new ApiError(400, "avtar not uploaded nhi hua");
    if (!coverImage) throw new ApiError(400, "coverImage not uploaded nhi hua");

    const usermodel = await user.create({
        username,
        email,
        password,
        name,
        avtar: avtar.url,
        coverImage: coverImage?.url || "",
    });

    if (!usermodel) {
        throw new ApiError(500, "something went wrong while creating user");
    }
    const createduser = await user
        .findById(usermodel._id)
        .select("-password -refreshToken");

    //select ka use kisi ko password ko refreshToken ko nhi hai...
    if (!createduser) {
        throw new ApiError(
            500,
            "something went wrong while password not delete"
        );
    }

    return res
        .status(201)
        .json(new ApiResponce(200, createduser, "User created successfully"));
});

const Loginuser = asynHandler(async (req, res) => {
    const {username, email, password} = req.body;

    if (!username && !email) {
        throw new ApiError(400, "username or email is required");
    }
    const finduser = await user.findOne({
        $or: [{username}, {email}],
    });
    if (!finduser) throw new ApiError(400, "User not found");

    ///user aur email to mil gya hai per password bhi check krna hai!!

    const ispasswordVaild = await finduser.ispasswordCorrect(password);
    if (!ispasswordVaild) throw new ApiError(401, "password is not correct");

    ///yaha pe ham log accestoken and refresh token le rhe hai...
    const {accesToken, refreshToken} = await GenrateAccesTOkenandRefreshToken(
        finduser._id
    );

    ///yaha pe ham ak aur baar database query maar rhe hai
    ///kew ki line num: 115 me finduser mila hai usme refres token empty hai kew ki
    ///line 126 me hamne refrsh token ke method ko call kiya hai

    ///is liye hame fir se database query marna pdega !!!

    const loginuser = await user
        .findById(finduser._id)
        .select("-password -refreshToken");

    ///ab hame cookie bhejna hai
    ////uske liye hame phle ak object banan pdega /// basicaly iska kaam bas itna hota hai
    //! ki frontend se koi bhi cookie read kr skta hai but right nhi kr skta

    const options = {
        httpOnly: true,
        secure: true,
    };
    ///yaha pe ham cookie bhejenge ...
    return res
        .status(200)
        .cookie("accesToken", accesToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponce(
                2001,
                {
                    user: loginuser,
                    accesToken,
                    refreshToken,
                },
                "login sussefully "
            )
        );
});

const Logoutuser = asynHandler(async (req, res) => {
    user.findByIdAndUpdate(
        req.User._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };
    res.status(200)
        .clearCookie("accesToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponce(200, {}, "user is logout"));
});

const refreshAccessToken = asynHandler(async (req, res) => {
    const temptoken = req.cookies.refreshToken || req.body.refreshToken;
    if (!temptoken) throw new ApiError(400, "refresh cookie not found");
    const decodedToken = jwt.verify(
        temptoken,
        process.env.REFRESH_TOKEN_SECRET
    );
    if (!decodedToken) throw new ApiError(401, "invalid decoded token");
    const User = await user.findById(decodedToken?._id);
    if (!User) throw new ApiError(400, "user token not found");
    if (temptoken !== User?.refreshToken)
        throw new ApiError(400, "Refresh token used");
    const {accesToken, refreshToken} = await GenrateAccesTOkenandRefreshToken(
        User._id
    );
    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accesToken", accesToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponce(
                200,
                {accesToken, refreshToken},
                "refresh sussesfull"
            )
        );
});

const changeCurrentPassowrd = asynHandler(async (req, res) => {
    const {oldpassword, newpassowrd} = req.body;
    const user = await user.findById(req.User._id);
    const iscorrectpassword = await user.ispasswordCorrect(oldpassword);
    if (!iscorrectpassword) throw new ApiError(400, "old password is wrong");

    user.password = newpassowrd;
    await user.save({validateBeforeSave: false});
    return res
        .status(200)
        .json(new ApiResponce(200, {}, "password change sussesfully"));
});

const getCurrentUser = asynHandler(async (req, res) => {
    res.status(200).json(
        new ApiResponce(200, req.User, "current user fatch sussesfull")
    );
});
const updateAccountdetails = asynHandler(async (req, res) => {
    const {name, email} = req.body;
    if (!(name || email)) throw new ApiError(400, "all field are required");

    const user = await user
        .findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    name: name,
                    email,
                },
            },
            {
                new: true,
            }
        )
        .select("-password ");

    return res
        .status(200)
        .json(new ApiResponce(200, user, "update account successfully"));
});

const updateUserAvatar = asynHandler(async (req, res) => {
    const avtarlocal = req.file?.path;
    if (!avtarlocal) throw new ApiError(400, "avatar loval not found");
    const avtar = await cloudinary.uploader.upload(avtarlocal, {
        resource_type: "image",
    });

    if (!avtar.url) throw new ApiError(400, "avtar url not found");

    const user = await user
        .findByIdAndUpdate(
            req.user._id,
            {
                $set: {avtar: avtar.url},
            },
            {
                new: true,
            }
        )
        .select("-password");

    return res
        .status(200)
        .json(new ApiResponce(200,user, "avtar update sussessufll"));
});

const updateUserCoverImage = asynHandler(async (req, res) => {
    const covetimagelocal = req.file?.path;
    if (!covetimagelocal) throw new ApiError(400, "cover loval not found");
    const coverimage = await cloudinary.uploader.upload(covetimagelocal, {
        resource_type: "image",
    });

    if (!coverimage.url) throw new ApiError(400, "coverimage url not found");

    const user = await user
        .findByIdAndUpdate(
            req.user._id,
            {
                $set: {coverImage: coverimage.url},
            },
            {
                new: true,
            }
        )
        .select("-password");

    return res
        .status(200)
        .json(new ApiResponce(200,user, "cover imgage update sussessufll"));
});

export {
    registerUser,
    Loginuser,
    Logoutuser,
    refreshAccessToken,
    changeCurrentPassowrd,
    getCurrentUser,
    updateAccountdetails,
    updateUserAvatar,
    updateUserCoverImage,
};
