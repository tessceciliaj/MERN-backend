// CRUD controller for Posts 

import { Request, Response } from "express";
import Post from "../models/Post";
import { assertDefined } from "../utils/asserts";

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
    const limit = 3
    // const page = 2
    // populate = sök efter author, plocka ut username. Lägg till detta när du hämtar posts
    const posts = await Post
     // hämtar ut alla posts utan kommentarer 
    .find({}, '-comments')
    .limit(limit)
    // .skip(limit * (page - 1))
    .populate('author', 'userName')

    const totalCount = await Post.countDocuments();


    res.status(200).json({
        posts,
        totalPages: Math.ceil(limit/totalCount)
    })
}

export const getPosts = async (req: Request, res: Response) => {
    const { id } = req.params;

    const post = await Post.findById(id).populate('author').populate("comments.author")
   
    if(!post) {
        return res.status(404).json({message: 'No post fopund for id: ' + id})
    }

    res.status(200).json(post)
}