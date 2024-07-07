import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import router from "./router/router";
import cron from "node-cron";
import checkAndUpdateVideoTitle from "./controllers/updateTitle";
const app = express();

dotenv.config({ path: path.resolve(__dirname, "../config/.env.development") });

app.use(
  cors({
    origin: "http:localhost:1000",
    optionsSuccessStatus: 200,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", router);

const port: string | number = process.env.PORT || 2000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);

  // Schedule the task to run every hour (adjust as needed)
  // cron.schedule("*/30 * * * *", async () => {
  cron.schedule("*/1 * * * *", async () => {
    console.log("Running cron job to check video views and update title...");
    await checkAndUpdateVideoTitle();
  });
});
