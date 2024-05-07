const express = require("express");
const articleController = require("../controllers/articleController");
const upload = require("../middleware/multerConfig");
const router = express.Router();

router.post(
  "/",
  upload.fields([{ name: "imageFile", maxCount: 1 }]),
  articleController.createArticle
);
router.get("/getallarticle", articleController.getallArticle);
router.get("/getallarticlefiltered", articleController.getallArticleFiltered);
router.get("/randomarticle", articleController.getRandomArticle);
router.delete("/deleteArticle/:articleId", articleController.deleteArticle);
router.get("/:articleId", articleController.getArticleDetails);

module.exports = router;
