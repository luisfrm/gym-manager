import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
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
      unique: true,
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
      default: "",
    },
    // Campos para reconocimiento facial
    faceEncoding: {
      type: [Number], // Array de números para almacenar la codificación facial
      default: null,
    },
    faceImagePath: {
      type: String, // Ruta de la imagen de referencia
      default: "",
    },
    hasFaceRegistered: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Client", clientSchema);
