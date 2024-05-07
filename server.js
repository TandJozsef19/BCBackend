const app = require("./app");
const http = require("http");
const mongoose = require("mongoose");

const dotenv = require("dotenv");
dotenv.config({ path: "./configure.env" });

const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

const port = process.env.PORT || 4000;
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Started on port: ${port}`);
});
mongoose
  .connect(DB)
  .then(() => {
    console.log("Sikeresen csatlakozva a MongoDB-hez!!");
  })
  .catch((err) => console.error("Csatlakozási hiba!", err));
