import addContent from "./Content/add.js";
import getFreeContent from "./Content/free.js";
import getPremiumContent from "./Content/premium.js";

const contentController = {
  free: getFreeContent,
  premium: getPremiumContent,
  add: addContent,
};

export default contentController;
