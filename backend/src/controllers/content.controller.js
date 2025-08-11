import addContent from "./Content/add.js";
import getFreeContent from "./Content/free.js";
import getAllContent from "./Content/getAll.js";
import getOnePost from "./Content/getOne.js";
import getPremiumContent from "./Content/premium.js";

const contentController = {
  free: getFreeContent,
  premium: getPremiumContent,
  add: addContent,
  getAll: getAllContent,
  getOne: getOnePost,
};

export default contentController;
