import { Content } from "../../models/content.model.js";
import ApiResponse from "../../utils/ApiResponse.js";

const getAllContent = async (req, res) => {
  try {
    let { page, limit, category, pricing, query } = req.query;
    if (!page || !limit) {
      page = 1;
      limit = 5;
    }
    let count = 0,
      content = [];

    if (category === "All") {
      if (pricing === "All") {
        count = await Content.countDocuments({
          title: { $regex: query, $options: "i" },
        });
        content = await Content.find({
          title: { $regex: query, $options: "i" },
        })
          .skip((page - 1) * limit)
          .limit(limit);
      } else {
        const isPremium = pricing === "Premium";
        count = await Content.countDocuments({
          isPremium,
          title: { $regex: query, $options: "i" },
        });
        content = await Content.find({
          isPremium,
          title: { $regex: query, $options: "i" },
        })
          .skip((page - 1) * limit)
          .limit(limit);
      }
    } else {
      if (pricing === "All") {
        count = await Content.countDocuments({
          category,
          title: { $regex: query, $options: "i" },
        });
        content = await Content.find({
          category,
          title: { $regex: query, $options: "i" },
        })
          .skip((page - 1) * limit)
          .limit(limit);
      } else {
        const isPremium = pricing === "Premium";
        count = await Content.countDocuments({
          isPremium,
          category,
          title: { $regex: query, $options: "i" },
        });
        content = await Content.find({
          isPremium,
          category,
          title: { $regex: query, $options: "i" },
        })
          .skip((page - 1) * limit)
          .limit(limit);
      }
    }

    res
      .status(200)
      .send(
        new ApiResponse(
          200,
          { data: content, total: count },
          "All contents fetched successfully."
        )
      );
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send(new ApiResponse(500, error, "Failed to get free content"));
  }
};

export default getAllContent;
