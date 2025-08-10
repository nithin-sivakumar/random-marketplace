import { Router } from "express";
import userRouter from "./user.route.js";
import contentRouter from "./content.route.js";

const indexRouter = Router();

indexRouter.use("/api/auth", userRouter);

indexRouter.use("/api/content", contentRouter);

export default indexRouter;
