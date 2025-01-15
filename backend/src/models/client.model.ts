import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  cedula: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    default: "",
  },
  phone: {
    type: String,
    default: "",
  },
  address: {
    type: String,
    default: "",
  },
  expiredDate: {
    type: String,
  },
},
{
  timestamps: true,
});

export default mongoose.model("Client", clientSchema);