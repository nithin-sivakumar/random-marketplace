import ApiResponse from "../../utils/ApiResponse.js";

const getUserInfo = async (req, res) => {
  try {
    const { _id, name, email, isSubscribed } = req.user;

    const userDetails = {
      _id,
      name,
      email,
      isSubscribed,
    };

    res
      .status(200)
      .send(
        new ApiResponse(200, userDetails, "User details fetched successfully.")
      );
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send(new ApiResponse(500, error, "Failed to get user info"));
  }
};

export default getUserInfo;
