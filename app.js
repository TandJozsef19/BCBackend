const express = require("express");
const userRouter = require("./routes/userRoutes");
const articleRouter = require("./routes/articleRoutes");
const confRouter = require("./routes/confRoutes");
const applyRouter = require("./routes/applyRoutes");
const sendEmail = require("./routes/sendEmail");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const path = require("path");
const cors = require("cors");

const emailService = require("./emailService.js");

dotenv.config({ path: "./configure.env" });

const app = express();
app.set("trust proxy", true);

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.options("*", cors(corsOptions));

// Biztonsági middleware-ek
app.use(helmet());

// Kérések számának korlátozására
const limiter = rateLimit({
  max: 2000,
  windowMs: 60 * 60 * 1000, // 1 óra
  message: "Túl sok kérés erről az IP-ről, kérlek próbáld újra egy óra múlva!",
});
app.use("/api", limiter);

app.use(mongoSanitize()); // NoSQL injection ellen
app.use(xss()); // XSS támadások ellen

// HPP (HTTP Param Pollution) védelem
app.use(hpp());

app.use(express.json({ limit: "10kb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/users", userRouter);
app.use("/api/articles", articleRouter);
app.use("/api/conferences", confRouter);
app.use("/api/applications", applyRouter);
app.use("/api/email", sendEmail);

app.get("/", (req, res) => {
  res.send("Konferencia BACKEND!");
});

module.exports = app;
