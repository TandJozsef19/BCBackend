const Conference = require("../models/confModel");
const Apply = require("../models/applyModel");

exports.createConference = async (req, res) => {
  try {
    const {
      title,
      subTitle,
      registrationCost,
      price,
      hotelForConference,
      hotelRoomPrice,
      startDate,
      endDate,
      deadline,
      location,
      country,
      city,
      topic,
      subTopic,
      language,
      confDescription,
      menuOptions,
      facultativePrograms,
      highlightedTopics,
      targetAudience,
    } = req.body;

    console.log(req.files);
    console.log(req.body);

    const startDateParsed = new Date(startDate);
    const endDateParsed = new Date(endDate);
    const deadlineParsed = new Date(deadline);

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    if (isNaN(startDateParsed.getTime()) || isNaN(endDateParsed.getTime())) {
      return res.status(400).json({
        status: "fail",
        message: "Érvénytelen kezdő vagy befejező dátum.",
      });
    }

    if (isNaN(deadlineParsed.getTime())) {
      return res.status(400).json({
        status: "fail",
        message: "Érvénytelen határidő.",
      });
    }

    if (startDateParsed < currentDate) {
      return res.status(400).json({
        status: "fail",
        message: "A konferencia kezdő dátuma nem lehet a mai napnál korábbi.",
      });
    }

    if (deadlineParsed > startDateParsed) {
      return res.status(400).json({
        status: "fail",
        message: "A konferencia határideje nem lehet a kezdő dátum után.",
      });
    }

    if (!req.files || !req.files.presentationFile) {
      return res.status(400).json({
        status: "fail",
        message: "Prezentációs fájl feltöltése szükséges.",
      });
    }

    const presentationFile = req.files.presentationFile[0].path;
    let imageUrl = null;

    if (req.files.imageFile && req.files.imageFile.length > 0) {
      imageUrl = req.files.imageFile[0].path;
    }

    const parsedMenuOptions = JSON.parse(menuOptions);
    const parsedFacultativePrograms = JSON.parse(facultativePrograms);
    const parsedHighlightedTopics = JSON.parse(highlightedTopics);
    const parsedTargetAudiences = JSON.parse(targetAudience);

    const newConference = await Conference.create({
      title,
      subTitle,
      registrationCost,
      price,
      hotelForConference,
      hotelRoomPrice,
      startDate: startDateParsed,
      endDate: endDateParsed,
      deadline: deadlineParsed,
      location,
      country,
      city,
      topic,
      subTopic,
      language,
      confDescription,
      presentationFile,
      menuOptions: parsedMenuOptions,
      facultativePrograms: parsedFacultativePrograms,
      imageUrl,
      highlightedTopics: parsedHighlightedTopics,
      targetAudience: parsedTargetAudiences,
    });

    res.status(201).json({
      status: "success",
      data: {
        conference: newConference,
      },
    });
  } catch (error) {
    let errorMessage = "Ismeretlen hiba történt.";
    if (error.name === "ValidationError") {
      errorMessage = "Az adatok érvényesítése sikertelen.";
    } else if (error.code === 11000) {
      errorMessage = "Egyedi adatmegsértés történt (pl. már létező cím).";
    }
    res.status(400).json({
      status: "fail",
      message: errorMessage,
      errorDetail: error.message,
    });
  }
};

exports.getallConfFiltered = async (req, res) => {
  try {
    const {
      country,
      topic,
      subTopic,
      date,
      title,
      city,
      page = 1,
      limit = 6,
    } = req.query;
    let query = {};

    // Szűrési feltételek beállítása
    if (country) query.country = country;
    if (topic) query.topic = topic;
    if (subTopic) query.subTopic = subTopic;
    if (city) query.city = { $regex: city, $options: "i" };
    if (title) query.title = { $regex: title, $options: "i" };
    if (date) {
      const [year, month] = date.split("-");
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.startDate = { $gte: startDate, $lte: endDate };
    }

    // Az összes találat számának lekérdezése
    const totalItems = await Conference.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);
    const conferences = await Conference.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select(
        "title price startDate endDate deadline location country city language topic subTopic confDescription presentationFile imageUrl createdAt"
      );

    res.status(200).json({
      status: "success",
      totalItems,
      totalPages,
      currentPage: Number(page),
      conferences,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.getallConf = async (req, res) => {
  try {
    const conference = await Conference.find()
      .sort({ createdAt: -1 })
      .select(
        "title price startDate endDate deadline location country city topic subTopic language confDescription presentationFile createdAt"
      );

    res.status(200).json({
      status: "success",
      results: conference.length,
      data: {
        conference,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err,
    });
  }
};

exports.deleteConf = async (req, res) => {
  try {
    const conferenceId = req.params.conferenceId;

    const conference = await Conference.findByIdAndDelete(conferenceId);
    if (!conference) {
      return res.status(404).json({
        status: "fail",
        message: "Nem található konferencia az alábbi ID-vel",
      });
    }

    await Apply.deleteMany({ conference: conferenceId });

    res.status(200).json({
      status: "success",
      message:
        "Konferencia és a hozzá kapcsolódó jelentkezések sikeresen törölve.",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Valami váratlan hiba történt a konferencia törlése közben.",
    });
  }
};

exports.getConfDetails = async (req, res) => {
  try {
    const conference = await Conference.findById(req.params.conferenceId);
    if (!conference) {
      return res.status(404).json({
        status: "fail",
        message: "Nem található konferencia ezzel az ID-vel",
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        conference,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getConferenceDays = async (req, res) => {
  try {
    const { conferenceId } = req.params;
    const conference = await Conference.findById(conferenceId);

    if (!conference) {
      return res.status(404).json({
        status: "error",
        message: "Conference not found",
      });
    }

    let dates = [];
    let currentDate = new Date(conference.startDate);
    const endDate = new Date(conference.endDate);

    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.status(200).json({
      status: "success",
      conferenceDays: dates.map((date) => date.toISOString().split("T")[0]),
    });
  } catch (err) {
    console.error("Error fetching conference days", err);
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};
