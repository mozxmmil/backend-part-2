import mongoose from "mongoose";
 const subscriptionschema = new mongoose.Schema({
     subscriber: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
     },
     channel: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
     },
 });

export const  subscriber = mongoose.model("Subscriber",subscriptionschema);
