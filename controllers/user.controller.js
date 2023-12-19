import asynHandler from "../utils/asyncHandler.js";
import user from "../models/user.model.js";
import { ApiError } from "../utils/apierrorsHandle.js";
import { uploadcloudinary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/apiResponce.js";

const registerUser = asynHandler(async (req, res) => {
  const { username, email, password, name } = req.body;
  console.log("email", email);

  if ([username, email, password, name].some((filed) => filed?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  const finduser = await user.findOne({
    //$or ka use multiple condition in query ke liye use kiya jaa rha hai...
    $or: [{ username }, { email }],
  });
  if (finduser) throw new ApiError(400, "User already exists");

  const localavtar = req.files?.avtar[0].path;
  const localcoverImage = req.files?.coverImage[0].path;

  if (!localavtar) {
    throw new ApiError(400, "avtar required");
  }

  const avtar = await uploadcloudinary(localavtar);
  const converimage = await uploadcloudinary(localcoverImage);

  if (!avtar) throw new ApiError(400, "avtar not uploaded");

  const usermodel = await user.create({
    username,
    email,
    password,
    name,
    avtar: avtar.url,
    coverImage: converimage?.url || "",
  });
  const createduser = await user
    .findById(usermodel._id)
    .select("-password -refreshToken");
    //select ka use kisi ko password ko refreshToken ko nhi hai...
  if (!createduser)
    throw new ApiError(500, "something went wrong while password not delete");

  return res.this
    .state(201)
    .json(new ApiResponce(200, createduser, "user register sussesfully"));
});
export default registerUser;
