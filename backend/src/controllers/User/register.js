import { User } from "../../models/user.model.js";
import ApiResponse from "../../utils/ApiResponse.js";
import bcrypt from "bcryptjs";

const registerUser = async (req, res) => {
  try {
    const { name, email, pin } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(409)
        .send(
          new ApiResponse(
            409,
            null,
            "User with the provided details already exists. Kindly create an account with a different email or login to your existing account."
          )
        );
    }

    const hashed = await bcrypt.hash(pin, 10);

    await User.create({
      name,
      email,
      pin: hashed,
    });

    res
      .status(201)
      .send(new ApiResponse(201, null, "Account created successfully."));
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send(new ApiResponse(500, error, "Failed to create account."));
  }
};

export default registerUser;
