const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Mappák elérési útvonalainak definiálása
const presentationsFolder = "uploads/presentations";
const imagesFolder = "uploads/images";
const profileImagesFolder = "uploads/profileImages";

// Mappák létrehozása, ha nem léteznek
if (!fs.existsSync(presentationsFolder)) {
  fs.mkdirSync(presentationsFolder, { recursive: true });
}
if (!fs.existsSync(imagesFolder)) {
  fs.mkdirSync(imagesFolder, { recursive: true });
}
if (!fs.existsSync(profileImagesFolder)) {
  fs.mkdirSync(profileImagesFolder, { recursive: true });
}

// Multer tárolási beállításai
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "presentationFile") {
      cb(null, presentationsFolder);
    } else if (file.fieldname === "imageFile") {
      cb(null, imagesFolder);
    } else if (file.fieldname === "profileImage") {
      cb(null, profileImagesFolder);
    }
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`,
    );
  },
});

// Fájltípusok szűrése
const fileFilter = (req, file, cb) => {
  if (
    file.fieldname === "presentationFile" &&
    (file.mimetype === "application/pdf" ||
      file.mimetype === "application/vnd.ms-powerpoint" ||
      file.mimetype.includes("presentationml.presentation"))
  ) {
    cb(null, true);
  } else if (
    file.fieldname === "imageFile" &&
    (file.mimetype === "image/jpeg" || file.mimetype === "image/png")
  ) {
    cb(null, true);
  } else if (
    file.fieldname === "profileImage" &&
    (file.mimetype === "image/jpeg" || file.mimetype === "image/png")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type"), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });
module.exports = upload;
