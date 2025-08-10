import { Router } from "express";
import checkAuth from "../middlewares/auth.middleware.js";
import checkSubscription from "../middlewares/subscription.middleware.js";
import contentController from "../controllers/content.controller.js";

const contentRouter = Router();

contentRouter.route("/free").get(contentController.free);

contentRouter.route("/premium").get(contentController.premium);

contentRouter.route("/add").post(contentController.add);

export default contentRouter;
