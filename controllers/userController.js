const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const emailService = require("../emailService");
const Apply = require("../models/applyModel");
const fs = require("fs");
const path = require("path");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = async (req, res, next) => {
  const { name, email, password, confirmPassword, role, phoneNumber } =
    req.body;

  console.log(req.body);

  if (password !== confirmPassword) {
    return res.status(400).json({
      status: "fail",
      message: "Jelszavak nem egyeznek.",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      status: "fail",
      message: "Jelszónak legalább 8 karakter hosszúságúnak kell lennie.",
    });
  }
  if (!email || !name || !password || !phoneNumber) {
    return res.status(400).json({
      status: "fail",
      message: "Minden mező kitöltése kötelező.",
    });
  }

  try {
    const pinCode = Math.floor(100000 + Math.random() * 900000);
    const pinCodeExpires = new Date(Date.now() + 5 * 60 * 1000);

    const newUser = await User.create({
      name,
      email,
      password,
      role,
      phoneNumber,
      pinCode,
      pinCodeExpires,
      isActive: false,
    });

    await emailService.sendConfirmRegistrationEmail(
      email,
      newUser.name,
      pinCode
    );

    res.status(201).json({
      status: "success",
      message: "Kérjük, ellenőrizze az e-mailjét a regisztráció befejezéséhez.",
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      res.status(400).json({
        status: "fail",
        message: "A megadott email cím már használatban van.",
      });
    } else if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      res.status(400).json({
        status: "fail",
        message: messages.join(". "),
      });
    } else {
      res.status(500).json({
        status: "error",
        message: "Valami hiba tortent a regisztracio soran.",
      });
    }
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  console.log(req.body);

  if (!email || !password) {
    return res.status(400).json({
      status: "fail",
      message: "Az email cím vagy a jelszó nincs megadva.",
    });
  }

  const user = await User.findOne({ email }).select("+password +isActive");

  if (!user) {
    return res.status(401).json({
      status: "fail",
      message: "Hibás email cím vagy jelszó!",
    });
  }

  const passwordCorrect = await bcrypt.compare(password, user.password);
  console.log(passwordCorrect);
  if (!passwordCorrect || !user.isActive) {
    let message = "Hibás email cím vagy jelszó!";
    if (passwordCorrect && !user.isActive) {
      message =
        "A felhasználói fiók még nem aktív. Kérjük, erősítse meg regisztrációját.";
    }
    return res.status(401).json({
      status: "fail",
      message: message,
    });
  }

  const token = signToken(user._id);

  const userForResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phoneNumber: user.phoneNumber,
  };

  res.status(200).json({
    status: "success",
    user: userForResponse,
    token,
  });
};

exports.getAllUsers = async (req, res) => {
  try {
    const {
      searchTerm,
      searchField,
      sortOption,
      page = 1,
      limit = 6,
    } = req.query;
    const query = {};

    if (searchTerm && searchField) {
      query[searchField] = { $regex: searchTerm, $options: "i" };
    }

    let sortOptions = {};
    switch (sortOption) {
      case "newest":
        sortOptions.createdAt = -1;
        break;
      case "abc":
        sortOptions.name = 1;
        break;
      default:
        sortOptions.createdAt = 1;
    }

    const totalItems = await User.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);
    const users = await User.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select("name email role createdAt");

    res.status(200).json({
      status: "success",
      results: users.length,
      totalItems,
      totalPages,
      currentPage: Number(page),
      users,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",

      message: err,
    });
  }
};

exports.logout = (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Sikeresen ki lett jelentkezve.",
  });
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "Nem talalhato felhaszbalo az alabbi ID-vel",
      });
    }

    const applications = await Apply.find({ user: user._id });
    applications.forEach(async (application) => {
      if (application.presentationFile) {
        fs.unlinkSync(
          path.resolve(
            __dirname,
            "../uploads/presentations",
            application.presentationFile
          )
        );
      }
      if (application.profileImage) {
        fs.unlinkSync(
          path.resolve(
            __dirname,
            "../uploads/profileImages",
            application.profileImage
          )
        );
      }

      await Apply.findByIdAndDelete(application._id);
    });

    res.status(200).json({
      status: "success",
      message:
        "Felhasznalo sikeresen torolve, valamint az osszes kapcsolodo jelentkezes.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Valami varatlan hiba tortent a felhasznalo torlese kozben.",
    });
  }
};

exports.updatePassword = async (req, res, next) => {
  const { userId, newPassword } = req.body;

  console.log(newPassword);

  if (newPassword.length < 8) {
    return res.status(400).json({
      status: "fail",
      message: "Jelszónak legalább 8 karakter hosszúságúnak kell lennie.",
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  const user = await User.findByIdAndUpdate(
    userId,
    {
      password: hashedPassword,
    },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "Felhasználó nem található.",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    },
  });
};

exports.updatePhoneNumber = async (req, res, next) => {
  const { userId, phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({
      status: "fail",
      message: "Telefonszám megadása kötelező.",
    });
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      phoneNumber: phoneNumber,
    },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "Felhasználó nem található.",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
      },
    },
  });
};

exports.fetchUser = async (req, res, next) => {
  const userId = req.user.id;

  const user = await User.findById(userId);

  console.log(user);

  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "A felhasználó nem található.",
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
      },
    },
  });
};

exports.confirmRegistration = async (req, res, next) => {
  const { email, pinCode } = req.body;

  console.log(email, pinCode);
  if (!email || !pinCode) {
    return res.status(400).json({
      status: "fail",
      message: "Email és PIN kód megadása kötelező.",
    });
  }

  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "Felhasználó nem található.",
    });
  }

  const isPinValid = user.pinCode === pinCode;
  const isPinExpired = user.pinCodeExpires < new Date();

  if (!isPinValid) {
    return res.status(400).json({
      status: "fail",
      message: "Hibás PIN kód.",
    });
  }

  if (isPinExpired) {
    return res.status(400).json({
      status: "fail",
      message: "A PIN kód lejárt.",
    });
  }

  user.isActive = true;
  user.pinCode = undefined;
  user.pinCodeExpires = undefined;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "A regisztráció megerősítése sikeres.",
  });
};

exports.requestNewPin = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      status: "fail",
      message: "Email cím megadása kötelező.",
    });
  }

  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "Felhasználó ezzel az email címmel nem található.",
    });
  }

  const now = new Date();
  if (
    user.lastPinRequest &&
    new Date(user.lastPinRequest).getTime() + 3 * 60 * 1000 > now.getTime()
  ) {
    const waitTime = Math.ceil(
      (new Date(user.lastPinRequest).getTime() +
        3 * 60 * 1000 -
        now.getTime()) /
        60000
    );
    return res.status(429).json({
      status: "fail",
      message: `Nem rég kértél PIN kódot. Várj még ${waitTime} percet, mielőtt újra próbálkozol.`,
    });
  }

  const pinCode = Math.floor(100000 + Math.random() * 900000);
  const pinCodeExpires = new Date(Date.now() + 5 * 60 * 1000);

  user.pinCode = pinCode;
  user.pinCodeExpires = pinCodeExpires;
  user.lastPinRequest = new Date();
  await user.save();

  try {
    await emailService.sendNewPinEmail(email, user.name, pinCode);
    res.status(200).json({
      status: "success",
      message: "Új PIN kód elküldve az email címre.",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message:
        "Nem sikerült elküldeni az emailt. Kérjük, próbálja meg újra később.",
    });
  }
};

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  console.log(email);

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "Nincs felhasználó ezzel az email címmel.",
    });
  }

  const pinCode = Math.floor(100000 + Math.random() * 900000);
  const pinCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  user.pinCode = pinCode;
  user.pinCodeExpires = pinCodeExpires;
  await user.save();

  const emailResponse = await emailService.sendForgotPasswordEmail(
    user.email,
    user.name,
    pinCode
  );
  if (emailResponse.success) {
    res.status(200).json({
      status: "success",
      message: "A PIN kód elküldve az email címre.",
    });
  } else {
    res.status(500).json({
      status: "error",
      message: emailResponse.message,
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  const { email, pinCode, newPassword, confirmPassword } = req.body;

  console.log(req.body);

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      status: "fail",
      message: "A jelszavak nem egyeznek.",
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({
      status: "fail",
      message: "Érvénytelen vagy lejárt PIN kód.",
    });
  }

  const isPinValid = user.pinCode === pinCode;
  const isPinExpired = user.pinCodeExpires < new Date();

  if (!isPinValid) {
    return res.status(400).json({
      status: "fail",
      message: "Hibás PIN kód.",
    });
  }

  if (isPinExpired) {
    return res.status(400).json({
      status: "fail",
      message: "A PIN kód lejárt.",
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      status: "fail",
      message: "Jelszónak legalább 8 karakter hosszúságúnak kell lennie.",
    });
  }
  console.log(newPassword);
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  const userId = user._id;

  const userPassword = await User.findByIdAndUpdate(
    userId,
    {
      password: hashedPassword,
    },
    { new: true }
  );
  user.pinCode = undefined;
  user.pinCodeExpires = undefined;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Jelszó sikeresen megváltoztatva.",
  });
};
