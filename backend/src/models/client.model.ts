import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
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
    default: ""
  },
},
{
  timestamps: true,
});

export default mongoose.model("Client", clientSchema);