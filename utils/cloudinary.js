import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
cloudinary.config({
  cloud_name: process.envCLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET,
});

const uploadcloudinary = async (localfile) => {
    try {
        if(!localfile) return null;
        const responce = await cloudinary.uploader.upload(localfile,{
            resource_type:"auto",
        })
        console.log("file uploaded sussessfully:"+responce.url);
        return responce;

    } catch (error) {
        fs.unlinkSync(localfile);
        return null;
    }
}

export { uploadcloudinary };