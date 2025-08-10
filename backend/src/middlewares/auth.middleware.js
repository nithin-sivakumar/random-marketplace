import jwt from "jsonwebtoken";
import ApiResponse from "../utils/ApiResponse.js";
import variables from "../global/variables.js";

const checkAuth = async (req, res, next) => {
  try {
    const bearerAuth = req.headers.authorization;

    if (!bearerAuth) {
      return res
        .status(400)
        .send(new ApiResponse(400, null, "Missing authorization header."));
    }

    const token = bearerAuth.split(" ")[1];

    const decoded = jwt.verify(token, variables.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .send(
        new ApiResponse(400, null, "Failed to decode API key: " + error.message)
      );
  }
};

export default checkAuth;
