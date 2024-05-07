const Article = require("../models/articleModel");
const path = require("path");

exports.createArticle = async (req, res) => {
  try {
    const { title, topic, content, subTopic } = req.body;

    let imageUrl = null;
    if (req.files.imageFile && req.files.imageFile.length > 0) {
      imageUrl = req.files.imageFile[0].path;
    }

    const newArticle = await Article.create({
      title,
      topic,
      subTopic,
      content,
      imageUrl,
    });

    res.status(201).json({
      status: "success",
      data: {
        article: newArticle,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getallArticle = async (req, res) => {
  try {
    const articles = await Article.find()
      .sort({ createdAt: -1 })
      .select("title topic subTopic imageUrl content createdAt");

    res.status(200).json({
      status: "success",
      results: articles.length,
      data: {
        articles,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err,
    });
  }
};

exports.getallArticleFiltered = async (req, res) => {
  try {
    const {
      searchTerm,
      topic,
      subTopic,
      sortOption = "newest",
      page = 1,
      limit = 6,
    } = req.query;
    let query = {};

    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: "i" } },
        { content: { $regex: searchTerm, $options: "i" } },
      ];
    }

    if (topic) {
      query.topic = topic;
    }
    if (subTopic) {
      query.subTopic = subTopic;
    }

    // Rendezési feltételek
    let sortOptions = {};
    switch (sortOption) {
      case "newest":
        sortOptions.createdAt = -1;
        break;
      case "oldest":
        sortOptions.createdAt = 1;
        break;
      case "abc":
        sortOptions.title = 1;
        break;
      default:
        sortOptions.createdAt = -1;
    }

    // Az összes találat számának lekérdezése
    const totalItems = await Article.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);
    const articles = await Article.find(query)
      .collation({ locale: "en", strength: 2 })
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select("title topic subTopic content createdAt imageUrl");

    res.status(200).json({
      status: "success",
      totalItems,
      totalPages,
      currentPage: Number(page),
      articles,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.articleId);
    if (!article) {
      return res.status(404).json({
        status: "fail",
        message: "Nem talalhato hir az alabbi ID-vel",
      });
    }
    res.status(200).json({
      status: "success",
      message: "Hir sikeresen torolve.",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Valami varatlan hiba tortent a hir torlese kozben.",
    });
  }
};

exports.getArticleDetails = async (req, res) => {
  try {
    const article = await Article.findById(req.params.articleId);
    if (!article) {
      return res.status(404).json({
        status: "fail",
        message: "Nem található hír ezzel az ID-vel",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        article,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getRandomArticle = async (req, res) => {
  try {
    const randomArticle = await Article.aggregate([{ $sample: { size: 5 } }]);

    res.status(200).json({
      status: "success",
      data: {
        randArticle: randomArticle,
      },
    });
  } catch (error) {
    console.error("Error fetching random article:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
