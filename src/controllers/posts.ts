import { Request, Response } from "express";
import mongoose from "mongoose";
import Post from "../models/Post";
import { assertDefined } from "../utils/asserts";
import { uploadFile } from "../utils/gridFs";

export const create = async (req: Request, res: Response) => {
  assertDefined(req.userId)
  const {title, link, body } = req.body;

  const post = new Post({
      title,
      link,
      body,
      author: req.userId
  })

  try {
    const savedPost = await post.save()
    res.status(201).json(savedPost)
  } catch(error) {
      res.status(500).json({ message: 'Failed to create post'});
  }
}

export const getAllPosts = async (req: Request, res: Response) => {
  try {
  const limit = parseInt(req.query.limit?.toString() || "5");
  const page = parseInt(req.query.page?.toString() || "1");

  if (isNaN(page) || isNaN(limit)) {
    res.status(400).json({
      message: "Malformed query object number: " + req.query.toString(),
    });
  }

  const posts = await Post.aggregate([
    {
      $addFields: {
        sortValue: {
          $divide: [
            {
              $add: [
                { $ifNull: ["$score", 0] },
                1,
              ],
            },
            {
              $pow: [
                {
                  $add: [
                    1,
                    {
                      $divide: [
                        { $subtract: [new Date(), "$createdAt"] },
                        1000 * 60 * 60,
                      ],
                    },
                  ],
                },
                1.5,
              ],
            },
          ],
        },
      },
    },
    {
      $sort: { sortValue: -1 },
    },
    { $skip: limit * (page - 1) },
    { $limit: limit }, 
    {
      $addFields: {
        commentCount: {
          $size: {
            $ifNull: ["$comments", []], 
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              userName: 1,
            },
          },
        ],
        as: "author",
      },
    },
    { $unwind: "$author" },
    {
      $project: {
        _id: 1,
        title: 1,
        link: 1,
        body: 1,
        createdAt: 1,
        updatedAt: 1,
        score: 1,
        commentCount: 1,
        author: 1,
      },
    },
  ]);

  const totalCount = await Post.countDocuments();

  res.status(200).json({
    posts,
    totalPages: Math.ceil(totalCount / limit),
  });
} catch (error) {
  console.error('Error fetching posts:', error);
  res.status(500).json({ message: 'Failed to fetch posts' });
}
};

export const getPost = async (req: Request, res: Response) => {
  const { id } = req.params;

  const post = await Post.findById(id)
    .populate("author")
    .populate("comments.author");

  if (!post) {
    return res.status(404).json({ message: "No post found for id: " + id });
  }

  res.status(200).json(post);
};

export const updatePost = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, link, body } = req.body;
  assertDefined(req.userId);

  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "No post found for id: " + id });
    }

    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized to update this post" });
    }

    post.title = title || post.title;
    post.link = link || post.link;
    post.body = body || post.body;

    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to update post" });
  }
};


export const deletePost = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.userId; 

  try {
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "No post found for id: " + id });
    }

    if (post.author.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    const deletedPost = await Post.findByIdAndDelete(id);

    if (!deletedPost) {
      return res.status(500).json({ message: "Failed to delete post" });
    }

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete post" });
  }
};