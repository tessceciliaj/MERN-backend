import express from "express";

// Skapa servern
const app = express();

// Använd servern via request och response
app.use("/", (req, res) => {
  console.log("Root route hit");

  res.send("Hello World");
});

// För att få allt att funka, lyssna på servern
app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
