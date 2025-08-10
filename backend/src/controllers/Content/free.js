import { Content } from "../../models/content.model.js";
import ApiResponse from "../../utils/ApiResponse.js";

const getFreeContent = async (req, res) => {
  try {
    let { page, limit } = req.query;
    if (!page || !limit) {
      page = 1;
      limit = 5;
    }
    const freeContent = await Content.find({ isPremium: false })
      .skip((page - 1) * limit)
      .limit(limit);

    res
      .status(200)
      .send(
        new ApiResponse(200, freeContent, "Free contents fetched successfully.")
      );
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send(new ApiResponse(500, error, "Failed to get free content"));
  }
};

export default getFreeContent;
