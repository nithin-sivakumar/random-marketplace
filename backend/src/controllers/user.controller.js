import getUserInfo from "./User/info.js";
import loginUser from "./User/login.js";
import registerUser from "./User/register.js";

const userController = {
  register: registerUser,
  login: loginUser,
  info: getUserInfo,
};

export default userController;
