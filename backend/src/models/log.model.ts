import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["created", "updated", "deleted"],
    },
  },
  {
    timestamps: true,
  },
);

const Log = mongoose.model("Log", logSchema);

export default Log;
