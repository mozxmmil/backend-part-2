import mongoose from "mongoose";
const userschema = new mongoose.Schema({
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
    required: [ture,"password is required"],
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
    type:mongoose.Schema.Types.ObjectId,
    ref:"Video",
  },
  refreshToken:{
    type:String,
  }
},{timestamps:true});;

const user = mongoose.model("User",userschema);