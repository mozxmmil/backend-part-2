import mongoose from "mongoose";


const connectdb = async () => {
  try {
    const mozammil = await mongoose.connect(process.env.MONGODB_URI);
    console.log(` data base connected ${mozammil.connection.host}`);
  } catch (error) {
    console.log("err", error);
  }
};
export default connectdb;
