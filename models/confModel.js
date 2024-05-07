const mongoose = require("mongoose");

const menuOptionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, "A dátum megadása kötelező!"],
  },
  vegan: {
    type: String,
    required: [true, "A vegán menü részleteinek megadása kötelező!"],
  },
  vegetarian: {
    type: String,
    required: [true, "A vegetáriánus menü részleteinek megadása kötelező!"],
  },
  traditional: {
    type: String,
    required: [true, "A hagyományos menü részleteinek megadása kötelező!"],
  },
});

const facultativeProgramsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A program címének megadása kötelező!"],
  },
  cost: {
    type: Number,
    required: [true, "A program költségének megadása kötelező!"],
  },
  date: {
    type: Date,
    required: [true, "A program kezdetének megadása kötelező!"],
  },
});

const confSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A konferencia nevének megadása kötelező!"],
  },
  subTitle: {
    type: String,
    required: [true, "A konferencia alcímének megadása kötelező!"],
  },
  registrationCost: {
    type: String,
    required: [true, "Konferencia regisztrációs díja megadása kötelező!"],
  },
  price: {
    type: String,
    required: [true, "A napi díj megadása kötelező!"],
  },
  hotelForConference: {
    type: Boolean,
    required: false,
  },
  hotelRoomPrice: {
    type: Number,
    required: false,
  },
  startDate: {
    type: Date,
    required: [true, "A kezdő dátum megadása kötelező!"],
  },
  endDate: {
    type: Date,
    required: [true, "A befejező dátum megadása kötelező!"],
  },
  deadline: {
    type: Date,
    required: [true, "A határidő megadása kötelező!"],
  },
  country: {
    type: String,
    required: [true, "A konferencia országának megadása kötelező!"],
  },
  city: {
    type: String,
    required: [true, "A konferencia városának megadása kötelező!"],
  },
  location: {
    type: String,
    required: [true, "A konferencia helyszínének megadása kötelező!"],
  },
  topic: {
    type: String,
    required: [true, "Tema megadasa kotelezo"],
  },
  subTopic: {
    type: String,
    required: [true, "Al-Tema megadasa kotelezo"],
  },
  language: {
    type: String,
    required: [true, "A konferencia nyelvének megadása kötelező!"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  confDescription: {
    type: String,
    required: [true, "A konferencia leirásának megadása kötelező!"],
    default:
      "A konferenciának nincs leírása vagy a konferencia dokumentumába található.",
  },
  presentationFile: {
    type: String,
    required: [true, "A konferencia prezentációjának feltöltése kötelező!"],
  },
  menuOptions: [menuOptionSchema],
  facultativePrograms: [facultativeProgramsSchema],
  imageUrl: {
    type: String,
    required: [false, "A kép URL-jének megadása opcionális."],
  },
  highlightedTopics: {
    type: [String],
    required: [true, "A kiemelt témák megadása kötelező!"],
  },
  targetAudience: {
    type: [String],
    required: [true, "A célközönség megadása kötelező!"],
  },
});

const Conference = mongoose.model("Conference", confSchema);

module.exports = Conference;
