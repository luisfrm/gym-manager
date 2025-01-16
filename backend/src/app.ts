import express from "express";
import cors from "cors";
import morgan from "morgan";
import { PORT } from "./config";
import authRouter from "./routes/auth.routes";
import { connectDB } from "./models/db";
import clientRouter from "./routes/client.routes";
import paymentRouter from "./routes/payment.routes";

const createApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));

  // Routes
  app.use("/v1/auth", authRouter);
  app.use("/v1/clients", clientRouter);
  app.use("/v1/payments", paymentRouter);
  app.get("/", (_, res) => {
    res.send("Hello World!");
  });

  connectDB()
    .then(message => {
      console.log(message);
    })
    .catch(error => {
      console.log("Error connecting to MongoDB: ", error);
    });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

export default createApp;
