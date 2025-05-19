import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Client",
    },
    clientCedula: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
    },
    date: {
      type: String,
      required: [true, "Payment date is required"],
    },
    service: {
      type: String,
      required: [true, "Payment service is required"],
    },
    description: {
      type: String,
      default: "",
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
    },
    paymentReference: {
      type: String,
      default: "",
    },
    paymentStatus: {
      type: String,
      default: "pending",
      enum: ["pending", "paid", "failed"],
    },
    currency: {
      type: String,
      enum: ["USD", "VES"],
      required: [true, "Currency is required"],
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Payment", paymentSchema);
