import { Router } from "express";
import userController from "../controllers/user.controller.js";
import checkAuth from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(userController.register);

userRouter.route("/login").post(userController.login);

userRouter.route("/me").get(checkAuth, userController.info);

export default userRouter;
