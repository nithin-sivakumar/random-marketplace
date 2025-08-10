import { Router } from "express";
import userRouter from "./user.route.js";
import contentRouter from "./content.route.js";
import ApiResponse from "../utils/ApiResponse.js";

const indexRouter = Router();

indexRouter.use("/api/auth", userRouter);

indexRouter.use("/api/content", contentRouter);

indexRouter.route("/ping").get((req, res) => {
  return res
    .status(200)
    .send(new ApiResponse(200, null, "Server is up and running"));
});

export default indexRouter;
