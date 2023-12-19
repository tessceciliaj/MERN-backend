import { Document, Model, Schema, Types, model } from "mongoose";

interface IComment extends Document {
    body: string;
    author: Types.ObjectId,
    createdAt: Date,
    updatedAt: Date,
}

const CommentSchema = new Schema<IComment> (
    {
        body: {
            type: String,
            required: true,
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }
    },
    {
        timestamps: true
    }
)

interface IPost extends Document {
    title: string,
    link?: string,
    body?: string,
    author: Types.ObjectId,
    createdAt: Date,
    updatedAt: Date,
    comments: IComment[],
}

interface IPostProps {
    commments: Types.DocumentArray<IComment>
}

type TPostModel = Model<IPost, {}, IPostProps>

const PostSchema = new Schema<IPost, TPostModel> (
{
    title: {
        type: String,
        required: true,
        trim: true
    },
    link: {
        type: String,
        trim: true
    },
    body: {
        type: String
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    comments: [CommentSchema]
},
    {
        timestamps: true
    }
)

const Post = model<IPost, TPostModel>('Post', PostSchema)

export default Post;