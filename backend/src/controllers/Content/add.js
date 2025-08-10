import { Content } from "../../models/content.model.js";
import ApiResponse from "../../utils/ApiResponse.js";

const addContent = async (req, res) => {
  try {
    const { title, content, category, isPremium } = req.body;

    console.log("[Incoming Body]:", req.body);

    if (typeof isPremium === "string") {
      isPremium = isPremium.toLowerCase() === "true";
    }

    if (
      typeof title !== "string" ||
      title.trim() === "" ||
      typeof content !== "string" ||
      content.trim() === "" ||
      typeof category !== "string" ||
      category.trim() === "" ||
      typeof isPremium !== "boolean"
    ) {
      return res
        .status(400)
        .send(
          new ApiResponse(400, null, "Missing or invalid required fields.")
        );
    }

    const createdPost = await Content.create({
      title,
      content,
      category,
      isPremium,
    });

    res
      .status(200)
      .send(new ApiResponse(201, createdPost, "Content posted successfully."));
  } catch (error) {
    console.error("[Content Creation Error]:", error);
    res.status(500).send(new ApiResponse(500, error, "Failed to post content"));
  }
};

export default addContent;
