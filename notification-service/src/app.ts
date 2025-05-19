// import express from "express";
// import cors from "cors";
// import morgan from "morgan";
import cron from "node-cron";

// const PORT = 3002;

// const createApp = () => {
//   const app = express();
//   app.use(cors());
//   app.use(express.json());
//   app.use(morgan("dev"));

//   app.get("/", (_, res) => {
//     res.send("Notification Service is working!");
//   });

//   app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
//   });
// };

const createApp = () => {
  cron.schedule("*/2 * * * * *", ()=>{
    console.log("My first cron job")
  })
};

export default createApp;
