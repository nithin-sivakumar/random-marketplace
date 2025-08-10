import { Content } from "../../models/content.model.js";
import ApiResponse from "../../utils/ApiResponse.js";

const getPremiumContent = async (req, res) => {
  try {
    const premiumContent = await Content.find({ isPremium: true });

    res
      .status(200)
      .send(
        new ApiResponse(
          200,
          premiumContent,
          "Premium contents fetched successfully."
        )
      );
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send(new ApiResponse(500, error, "Failed to get premium content"));
  }
};

export default getPremiumContent;
