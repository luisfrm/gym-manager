import mongoose from "mongoose";
import { MONGODB_URI } from "../config";

export const connectDB = async () => {
  return new Promise((resolve, reject) => {
    mongoose
      .connect(MONGODB_URI)
      .then(() => {
        resolve("Connected to MongoDB");
      })
      .catch(error => {
        reject(error.message);
      });
  });
};
