import dotenv from "dotenv";
import connectdb from "./db/index.js";
import app from "./app.js";
dotenv.config({
  path: "./.env",
});

connectdb()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`app is listing on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(`data base connection error ${err}`);
  });
  













































































































































/*import mongoose from "mongoose";
import app from "express"
( async()=>{
    try {
        await mongoose.connect(`${process.env.mongoose}/"mozammil"`)
        app.on("error",(error)=>{
            console.log("ERR:",error)
            throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log(`app is listing on port ${process.env.PORT}`);
        })
    } catch (error) {
        console.error("error",error)
    }
})()*/
