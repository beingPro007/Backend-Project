import mongoose, {Schema} from "mongoose";

const subscribtionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId, // one who is subscribing
      ref: "User"
    },
    channel:{
        type: Schema.Types.ObjectId,
        ref: "User"
    }
  },
  { timestamps: true }
);

export const {Subscribtion} = new mongoose.model("Subscription", subscribtionSchema)