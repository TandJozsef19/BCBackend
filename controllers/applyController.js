const Apply = require("../models/applyModel");
const Conference = require("../models/confModel");
const upload = require("../middleware/multerConfig");
const fs = require("fs");
const emailService = require("../emailService");

exports.applyForConference = async (req, res) => {
  const handleFileUpload = () => {
    return new Promise((resolve, reject) => {
      upload.fields([
        { name: "presentationFile", maxCount: 1 },
        { name: "profileImage", maxCount: 1 },
      ])(req, res, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(req.files);
        }
      });
    });
  };

  try {
    const filesUploadResult = await handleFileUpload().catch((err) => {
      res.status(500).json({
        status: "error",
        message: err.message,
      });
      return null;
    });

    if (filesUploadResult === null) return;

    // JSON stringek parse-olása
    const selectedFacultativePrograms = req.body.selectedFacultativePrograms
      ? JSON.parse(req.body.selectedFacultativePrograms)
      : [];

    const requiredFields = ["userId", "conferenceId", "name", "email", "role"];

    const {
      userId,
      conferenceId,
      name,
      email,
      additionalRequests,
      role,
      selectedDays,
      selectedHotelRoomDays,
      presentationTime,
      phoneNumber,
      country,
      city,
      streetAddress,
      workplace,
      workplacePosition,
      speakerSubject,
      specialTechNeeds,
      glutenSensitive,
      flourSensitive,
      mobilityIssues,
      additionalNotes,
      totalCost,
    } = req.body;

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          status: "fail",
          message: `Hiányzó adat: ${field}`,
        });
      }
    }
    const existingApplication = await Apply.findOne({
      user: userId,
      conference: conferenceId,
    });

    // Konferencia adatainak lekérése
    const conference = await Conference.findById(conferenceId);
    if (!conference) {
      return res.status(404).json({
        status: "fail",
        message: "A konferencia nem található.",
      });
    }

    // Menü választások kezelése
    let menuSelections = [];
    if (req.body.menuSelections) {
      try {
        menuSelections = Object.keys(req.body.menuSelections).map((key) => {
          const { date, selection } = req.body.menuSelections[key];
          return { date, selection };
        });
      } catch (parseError) {
        return res.status(400).json({
          status: "fail",
          message: "Hibás menü választások formátuma.",
        });
      }
    }

    if (existingApplication) {
      if (req.file) {
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.error("Fájltörlési hiba:", unlinkErr);
        });
      }

      return res.status(400).json({
        status: "fail",
        message: "Már jelentkeztél erre a konferenciára.",
      });
    }

    const approvalStatus = role === "speaker" ? "pending" : "approved";

    const applyData = {
      user: userId,
      conference: conferenceId,
      name,
      email,
      selectedFacultativePrograms,
      additionalRequests,
      role,
      presentationFile: filesUploadResult.presentationFile
        ? filesUploadResult.presentationFile[0].path
        : null,
      profileImage: filesUploadResult.profileImage
        ? filesUploadResult.profileImage[0].path
        : null,
      presentationTime,
      approvalStatus,
      menuSelections,
      selectedDays,
      selectedHotelRoomDays,
      phoneNumber,
      country,
      city,
      streetAddress,
      workplace,
      workplacePosition,
      speakerSubject,
      specialTechNeeds,
      glutenSensitive,
      flourSensitive,
      mobilityIssues,
      additionalNotes,
      totalCost,
    };

    const apply = new Apply(applyData);
    await apply.save();

    await emailService.sendApplicationConfirmation(email, {
      name: name,
      conferenceTitle: conference.title,
      conferenceSubTitle: conference.alTitle,
      location: conference.location,
      conferenceStartDate: conference.startDate,
      conferenceEndDate: conference.endDate,
      conferenceCountry: conference.country,
      conferenceCity: conference.city,
      conferenceLanguage: conference.language,
      role: role,
      presentationTime: role === "speaker" ? presentationTime : undefined,
      approvalStatus: approvalStatus,
      menuSelections: menuSelections,
      selectedDays: selectedDays ? selectedDays : undefined,
      selectedHotelRoomDays: conference.hotelForConference
        ? selectedHotelRoomDays
        : undefined,
      facultativePrograms: selectedFacultativePrograms,
      phoneNumber: phoneNumber,
      applicantCountry: country,
      applicantCity: city,
      streetAddress: streetAddress,
      workplace: workplace,
      workplacePosition: workplacePosition,
      speakerSubject: role === "speaker" ? speakerSubject : undefined,
      specialTechNeeds: role === "speaker" ? specialTechNeeds : undefined,
      glutenSensitive: glutenSensitive,
      flourSensitive: flourSensitive,
      mobilityIssues: mobilityIssues,
      additionalNotes,
      totalCost: totalCost,
    });

    res.status(201).json({
      status: "success",
      data: {
        apply,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getApplicationsByConference = async (req, res) => {
  try {
    const conferenceId = req.params.conferenceId;
    const applications = await Apply.find({
      conference: conferenceId,
      approvalStatus: "approved",
    }).populate("user", "name email");

    res.status(200).json({
      status: "success",
      data: {
        applications,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getTotalApplicationsCount = async (req, res) => {
  try {
    const applicationsCount = await Apply.countDocuments({
      approvalStatus: "approved",
    });
    res.status(200).json({
      status: "success",
      data: {
        applicationsCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.approveApplication = async (req, res) => {
  const { applicationId } = req.params;
  const { decision } = req.body;

  try {
    const application = await Apply.findById(applicationId).populate(
      "conference",
      "title startDate"
    );

    if (!application) {
      return res.status(404).json({
        status: "fail",
        message: "A jelentkezés nem található.",
      });
    }

    if (decision === "rejected") {
      await emailService.sendRejectionEmail(application.email, {
        name: application.name,
        conferenceName: application.conference.title,
      });
      await Apply.findByIdAndDelete(applicationId);

      return res.status(200).json({
        status: "success",
        message: "A jelentkezés elutasítva és törölve.",
      });
    } else if (decision === "approved") {
      application.approvalStatus = decision;
      // Elfogadás e-mail küldése
      await application.save();
      await emailService.sendApprovalEmail(application.email, {
        name: application.name,
        conferenceName: application.conference.title,
      });

      return res.status(200).json({
        status: "success",
        data: {
          application,
        },
      });
    } else {
      return res.status(400).json({
        status: "fail",
        message: "Érvénytelen döntés.",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getSpeakerApplications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    let query;

    const totalItems = await Apply.countDocuments({
      role: "speaker",
      approvalStatus: "pending",
    });
    const totalPages = Math.ceil(totalItems / limit);
    const speakerApplications = await Apply.find({
      role: "speaker",
      approvalStatus: "pending",
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("user", "name email")
      .populate("conference", "title");

    res.status(200).json({
      status: "success",
      totalItems,
      totalPages,
      currentPage: Number(page),
      speakerApplications,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getSpeakerApplicationsByConference = async (req, res) => {
  try {
    const { conferenceId } = req.params;
    const speakerApplications = await Apply.find({
      conference: conferenceId,
      role: "speaker",
      approvalStatus: "approved",
    })
      .populate("user", "name email")
      .populate("conference", "title");

    res.status(200).json({
      status: "success",
      data: {
        applications: speakerApplications,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getUserApplications = async (req, res) => {
  const userId = req.user.id;
  try {
    if (!req.user || !req.user.id) {
      return res.status(400).json({
        status: "error",
        message: "Hiányzó felhasználói azonosító",
      });
    }

    const userApplications = await Apply.find({ user: userId })
      .populate(
        "conference",
        "title alTitle startDate endDate location country city createdAt"
      )
      .select(
        "name email phoneNumber country city streetAddress workplace workplacePosition role presentationFile speakerSubject profileImage specialTechNeeds selectedDays selectedHotelRoomDays selectedFacultativePrograms createdAt presentationTime approvalStatus menuSelections glutenSensitive flourSensitive mobilityIssues additionalNotes totalCost"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      data: {
        applications: userApplications.map((application) => {
          return {
            ...application.toObject(),
            presentationFileUrl: application.presentationFile
              ? `http://localhost:3000/${application.presentationFile}`
              : null,
            profileImageUrl: application.profileImage
              ? `http://localhost:3000/${application.profileImage}`
              : null,
          };
        }),
      },
    });
  } catch (error) {
    console.error(
      "Hiba történt a felhasználó jelentkezéseinek lekérésekor",
      error
    );
    res.status(500).json({
      status: "error",
      message: "Szerver oldali hiba történt a jelentkezések lekérésekor",
    });
  }
};

exports.deleteApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const deletedApplication = await Apply.findByIdAndDelete(applicationId);

    if (!deletedApplication) {
      return res.status(404).json({
        status: "fail",
        message: "A jelentkezés nem található vagy már törölve lett.",
      });
    }

    if (deletedApplication.presentationFile) {
      fs.unlink(deletedApplication.presentationFile, (err) => {
        if (err) {
          console.error("Fájl törlése sikertelen:", err);
        }
      });
    }

    res.status(200).json({
      status: "success",
      message: "A jelentkezés sikeresen törölve.",
    });
  } catch (error) {
    console.error("Jelentkezés törlése közben hiba történt:", error);
    res.status(500).json({
      status: "error",
      message: "Szerver oldali hiba történt a jelentkezés törlése közben.",
    });
  }
};

exports.getFilteredApplications = async (req, res) => {
  try {
    const {
      search = "",
      selectedDay = "all",
      searchField = "name",
      sortOption = "default",
      conferenceId,
      page = 1,
      limit = 20,
    } = req.query;

    let query = { conference: conferenceId };

    if (search) {
      if (searchField === "name") {
        query.name = { $regex: search, $options: "i" };
      } else if (searchField === "email") {
        query.email = { $regex: search, $options: "i" };
      } else if (searchField === "phoneNumber") {
        query.phoneNumber = { $regex: search, $options: "i" };
      }
    }

    if (selectedDay !== "all") {
      query.selectedDays = {
        $elemMatch: { $eq: new Date(selectedDay) },
      };
    }
    let sortQuery = {};
    if (req.query.sortOption === "abc") {
      sortQuery.name = 1;
    } else if (req.query.sortOption === "newest") {
      sortQuery.createdAt = -1;
    }

    const totalItems = await Apply.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);
    const applicationsFilteredData = await Apply.find(query)
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      status: "success",
      totalItems,
      totalPages,
      currentPage: Number(page),
      applicationsFilteredData,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

exports.getFilteredSpeakersApplication = async (req, res) => {
  try {
    const {
      search = "",
      presentationTime = "all",
      searchField = "name",
      sortOption = "default",
      conferenceId,
      page = 1,
      limit = 20,
    } = req.query;

    console.log(req.query);

    let query = { conference: conferenceId, role: "speaker" };

    if (search) {
      query[searchField] = { $regex: search, $options: "i" };
    }

    if (presentationTime !== "all") {
      const dateParts = presentationTime.split(" ");
      const correctedDate = `${dateParts[1]} ${dateParts[2]} ${dateParts[3]} 00:00:00`;

      const presentationDate = new Date(correctedDate);
      let nextDay = new Date(presentationDate);
      nextDay.setDate(presentationDate.getDate() + 1);

      query.presentationTime = {
        $gte: presentationDate,
        $lt: nextDay,
      };
    }

    let sortQuery = {};
    switch (sortOption) {
      case "abc":
        sortQuery[searchField] = 1;
        break;
      case "newest":
        sortQuery.createdAt = -1;
        break;
      default:
        sortQuery.createdAt = 1;
        break;
    }

    const totalItems = await Apply.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);
    const speakerApplicationsData = await Apply.find(query)
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      status: "success",
      totalPages,
      totalItems,
      currentPage: Number(page),
      speakerApplicationsData,
    });
  } catch (err) {
    console.error("Error fetching filtered speaker applications", err);
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

exports.getConferencesWithApplicants = async (req, res) => {
  try {
    const applications = await Apply.find()
      .populate("conference", "title")
      .select("email conference");

    const conferenceEmailMap = {};
    applications.forEach(({ conference, email }) => {
      if (conferenceEmailMap[conference._id]) {
        conferenceEmailMap[conference._id].emails.push(email);
      } else {
        conferenceEmailMap[conference._id] = {
          title: conference.title,
          emails: [email],
        };
      }
    });

    const conferencesWithApplicants = Object.entries(conferenceEmailMap).map(
      ([id, { title, emails }]) => ({
        id,
        title,
        emails,
      })
    );

    console.log(conferencesWithApplicants);
    res.status(200).json({
      status: "success",
      confAndEmails: conferencesWithApplicants,
    });
  } catch (error) {
    console.error(
      "Hiba történt a konferenciák és jelentkezők lekérésekor",
      error
    );
    res.status(500).json({
      status: "error",
      message: "Szerver oldali hiba történt",
    });
  }
};
