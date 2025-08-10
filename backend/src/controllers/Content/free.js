import { Content } from "../../models/content.model.js";
import ApiResponse from "../../utils/ApiResponse.js";

const getFreeContent = async (req, res) => {
  try {
    let { page, limit, category } = req.query;
    if (!page || !limit) {
      page = 1;
      limit = 5;
    }
    let count = 0,
      freeContent = [];

    if (category === "All") {
      count = await Content.countDocuments({ isPremium: false });
      freeContent = await Content.find({ isPremium: false })
        .skip((page - 1) * limit)
        .limit(limit);
    } else {
      count = await Content.countDocuments({ isPremium: false, category });
      freeContent = await Content.find({ isPremium: false, category })
        .skip((page - 1) * limit)
        .limit(limit);
    }

    res
      .status(200)
      .send(
        new ApiResponse(
          200,
          { data: freeContent, total: count },
          "Free contents fetched successfully."
        )
      );
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send(new ApiResponse(500, error, "Failed to get free content"));
  }
};

export default getFreeContent;
