import { Content } from "../../models/content.model.js";
import ApiResponse from "../../utils/ApiResponse.js";

const getPremiumContent = async (req, res) => {
  try {
    let { page, limit, category } = req.query;
    if (!page || !limit) {
      page = 1;
      limit = 5;
    }

    let count = 0,
      premiumContent = [];

    if (category === "All") {
      count = await Content.countDocuments({ isPremium: true });
      premiumContent = await Content.find({ isPremium: true })
        .skip((page - 1) * limit)
        .limit(limit);
    } else {
      count = await Content.countDocuments({ isPremium: true, category });
      premiumContent = await Content.find({ isPremium: true, category })
        .skip((page - 1) * limit)
        .limit(limit);
    }

    res
      .status(200)
      .send(
        new ApiResponse(
          200,
          { data: premiumContent, total: count },
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
