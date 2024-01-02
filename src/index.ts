import "dotenv/config";
import mongoose from "mongoose"
import app from "./app";

const mongoURL = process.env.DB_URL;

if (!mongoURL) throw Error("Missing Url");

mongoose.connect(mongoURL).then(() => {
  // För att få allt att funka, lyssna på servern
  const port = parseInt(process.env.PORT || "3000");
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
});
