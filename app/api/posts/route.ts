import connectDB from "@/mongoDB/db";
import { IPostBase, Post } from "@/mongoDB/models/post";
import { IUser } from "@/types/user";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export interface AddPostRequestBody {
    user: IUser;
    text: string;
    imageUrl?: string | null;
}


export async function POST(request: Request) {
    // auth().protect();

    const { user, text, imageUrl }: AddPostRequestBody = await request.json();

    try {
        await connectDB();

        const postData: IPostBase = {
            user,
            text,
            ...(imageUrl && { imageUrl }),
        }

        const post = await Post.create(postData);
        return NextResponse.json({ messsage: "Post created successfully", post });

    } catch (error) {
        return NextResponse.json(
            { error: `Error while creating the post ${error}` },
            { status: 500 }
        )
    }
}

export async function GET() {
    try {
        await connectDB();
        
        const posts = await Post.getAllPosts();
        return NextResponse.json(posts);

    } catch (error) {
        return NextResponse.json(
            { error: "Error occurred while fetching posts" },
            { status: 500 });
    }
}