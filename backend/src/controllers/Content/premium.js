import { Content } from "../../models/content.model.js";
import ApiResponse from "../../utils/ApiResponse.js";

const getPremiumContent = async (req, res) => {
  try {
    let { page, limit } = req.query;
    if (!page || !limit) {
      page = 1;
      limit = 5;
    }
    const premiumContent = await Content.find({ isPremium: true })
      .skip((page - 1) * limit)
      .limit(limit);

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
