import ApiResponse from "../utils/ApiResponse.js";

const checkSubscription = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user.isSubscribed) {
      return res
        .status(400)
        .send(
          new ApiResponse(
            400,
            null,
            "This content is for premium users only. Upgrade now to access exclusive content."
          )
        );
    }

    next();
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .send(
        new ApiResponse(
          400,
          null,
          "Failed to check subscription: " + error.message
        )
      );
  }
};

export default checkSubscription;
