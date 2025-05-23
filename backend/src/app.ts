import express from "express";
import cors from "cors";
import morgan from "morgan";
// import { PORT } from "./config";
import authRouter from "./routes/auth.routes";
import { connectDB } from "./models/db";
import clientRouter from "./routes/client.routes";
import paymentRouter from "./routes/payment.routes";
import logRouter from "./routes/log.routes";
import statisticsRouter from "./routes/statistics.routes";
import createInitialAdmin from "./utils/createInitialAdmin";

const PORT = process.env.PORT || 3000;

const createApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));

  // Health check endpoint
  app.get("/api/health", (_, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Ping endpoint
  app.get("/v1/ping", (_, res) => {
    res.status(200).json({ status: "ok" });
  });

  // Routes
  app.use("/v1/auth", authRouter);
  app.use("/v1/clients", clientRouter);
  app.use("/v1/payments", paymentRouter);
  app.use("/v1/logs", logRouter);
  app.use("/v1/statistics", statisticsRouter);
  app.get("/", (_, res) => {
    res.send("Hello World!");
  });

  connectDB()
    .then(message => {
      console.log(message);
      createInitialAdmin();
    })
    .catch(error => {
      console.log("Error connecting to MongoDB: ", error);
    });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

export default createApp;
