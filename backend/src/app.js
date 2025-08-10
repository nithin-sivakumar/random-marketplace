import express from "express";
import indexRouter from "./routes/index.route.js";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: ["https://random-marketplace.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/", indexRouter);

export default app;
