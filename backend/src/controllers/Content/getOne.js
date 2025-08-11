import { Content } from "../../models/content.model.js";
import ApiResponse from "../../utils/ApiResponse.js";

const getOnePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Content.findById(id);

    res
      .status(200)
      .send(new ApiResponse(200, post, "Article fetched successfully."));
  } catch (error) {
    console.error("[Content Creation Error]:", error);
    res
      .status(500)
      .send(new ApiResponse(500, error, "Failed to fetch post content"));
  }
};

export default getOnePost;
