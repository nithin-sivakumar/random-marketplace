import bcrypt from "bcryptjs";
import { User } from "../../models/user.model.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { Restriction } from "../../models/restriction.model.js";

const loginUser = async (req, res) => {
  try {
    const { email, pin } = req.body;

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res
        .status(404)
        .send(new ApiResponse(404, null, "Invalid credentials."));
    }

    const isRestricted = await Restriction.findOne({
      userId: existingUser._id,
    });

    if (isRestricted) {
      existingUser.attemptsRemaining = process.env.MAX_LOGIN_ATTEMPTS;
      await existingUser.save();

      return res
        .status(403)
        .send(
          new ApiResponse(
            403,
            null,
            "Your account has been temporarily locked because of too many attempts. Kindly try again in 5 minutes."
          )
        );
    }

    if (!(await bcrypt.compare(pin, existingUser.pin))) {
      if (existingUser.attemptsRemaining <= 1) {
        await Restriction.create({
          userId: existingUser._id,
        });
        existingUser.attemptsRemaining = process.env.MAX_LOGIN_ATTEMPTS;
        await existingUser.save();

        return res
          .status(403)
          .send(
            new ApiResponse(
              403,
              null,
              "Your account has been temporarily locked because of too many attempts. Kindly try again in 5 minutes."
            )
          );
      } else {
        existingUser.attemptsRemaining -= 1;
        await existingUser.save();

        return res
          .status(400)
          .send(
            new ApiResponse(
              400,
              null,
              "Invalid credentials. " +
                existingUser.attemptsRemaining +
                " attempts remaining"
            )
          );
      }
    }

    const at = existingUser.generateAccessToken();

    res.cookie("at", at);

    existingUser.attemptsRemaining = process.env.MAX_LOGIN_ATTEMPTS;
    await existingUser.save();

    res
      .status(200)
      .send(new ApiResponse(200, { token: at }, "Login successful."));
  } catch (error) {
    console.log(error);
    res.status(500).send(new ApiResponse(500, error, "Failed to log user in."));
  }
};

export default loginUser;
