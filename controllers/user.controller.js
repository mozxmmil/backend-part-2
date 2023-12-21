import asynHandler from "../utils/asyncHandler.js";
import user from "../models/user.model.js";
import { ApiError } from "../utils/apierrorsHandle.js";
// import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponce } from "../utils/apiResponce.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
const GenrateAccesTOkenandRefreshToken = async (userid) => {
  const User = await user.findById(userid)
  const accestoken =  Userser.generateAuthToken()
  const refreshtoken =  User.generateRefreshToken()
  User.refreshtoken = refreshtoken
  await User.save({
    
  })
  /// yaha pe ham usermodel se accestoken aur refresh token gerrate kr rhe hai !!
  /// uske liye ak method bana rhe hai...
};
const registerUser = asynHandler(async (req, res) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_KEY,
    api_secret: process.env.CLOUDINARY_CLOUD_SECRET,
  });

  const { username, email, password, name } = req.body;

  if ([username, email, password, name].some((filed) => filed?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  const finduser = await user.findOne({
    //$or ka use multiple condition in query ke liye use kiya jaa rha hai...
    $or: [{ username }, { email }],
  });
  if (finduser) throw new ApiError(400, "User already exists");

  let localavtar = req.files?.avtar[0]?.path;
  console.log(localavtar);
  // let localcoverImage
  let localcoverImage;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    localcoverImage = req.files.coverImage[0].path;
  }

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
    throw new ApiError(500, "something went wrong while password not delete");
  }

  return res
    .status(201)
    .json(new ApiResponce(200, createduser, "User created successfully"));
});

const Loginuser = asynHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email) {
    throw new ApiError(400, "username or email is required");
  }
  const finduser = await user.findOne({
    $or: [{ username }, { email }],
  });

  if (!finduser) throw new ApiError(400, "User not found");

  ///user aur email to mil gya hai per password bhi check krna hai!!
  const ispasswordVaild = await finduser.ispasswordCorrect(password);
  if (!ispasswordVaild) throw new ApiError(401, "password is not correct");
});

export { registerUser, Loginuser };
