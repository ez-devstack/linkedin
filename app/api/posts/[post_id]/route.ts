import connectDB from "@/mongoDB/db";
import { Post } from "@/mongoDB/models/post";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: { post_id: string } }
) {
    await connectDB();

    try {
        const post = await Post.findById(params.post_id)

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 })
        }

        return NextResponse.json(post);

    } catch (error) {
        return NextResponse.json(
            { error: "Error occurred while fetching post" },
            { status: 500 }
        );
    }
}

export interface DeletePostRequestBody {
    userId: string;
}


export async function DELETE (
    request: Request,
    { params }: { params: { post_id: string } }
 ) {

    // auth().protect();

    await connectDB();
    const { userId }: DeletePostRequestBody = await request.json();


    try {
        const post = await Post.findById(params.post_id)

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 })
        }

        if (post.user.userId !== userId) {
            throw new Error("Post does not belong to user")
        }

        await post.removePost();

    } catch (error) {
        return NextResponse.json(
            { error: "Error occurred while fetching post" },
            { status: 500 }
        );
    }

}