import "dotenv/config";
import express from "express"
import mongoose from "mongoose"
import cors from 'cors'
import * as authController from "./controllers/auth"
import * as postsController from './controllers/posts'
import * as commentController from './controllers/comments'
import validateToken from "./middleware/validateToken"

// Skapa servern
const app = express()

//middleware
app.use(cors())
app.use(express.json())

app.post("/register", authController.register)
app.post("/login", authController.logIn)
app.get('/profile', validateToken, authController.profile)

app.post('/posts', validateToken, postsController.create)
app.get('/posts', postsController.getAllPosts)
app.get('/posts/:id', postsController.getPosts)

app.post('/posts/:postId/comments', validateToken, commentController.createComment)
app.delete('/posts/:postId/comments/:commentId', validateToken, commentController.deleteComment)

const mongoURL = process.env.DB_URL;

if (!mongoURL) throw Error("Missing Url");

mongoose.connect(mongoURL).then(() => {
  // För att få allt att funka, lyssna på servern
  const port = parseInt(process.env.PORT || "3000");
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
});
