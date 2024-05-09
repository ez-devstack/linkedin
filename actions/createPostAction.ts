'use server'

import { AddPostRequestBody } from "@/app/api/posts/route";
import { Post } from "@/mongoDB/models/post";
import { IUser } from "@/types/user";
import { currentUser } from "@clerk/nextjs/server";

export default async function createPostAction(formData: FormData) {
    const user = await currentUser();
    if (!user) {
        throw new Error("User not signed in");
    }

    const postInput = formData.get("postInput") as string;
    const image = formData.get("image") as File;
    let imageUrl: string | undefined;

    if (!postInput) {
        throw new Error("Post input is required");
    }

    //define user
    const userDB: IUser = {
        userId: user.id,
        userImage: user.imageUrl,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
    }

    //upload image
    try {
        if (image.size > 0) {
            const body: AddPostRequestBody = {
                user: userDB,
                text: postInput,
                imageUrl: imageUrl,
            }
            await Post.create(body);

        } else {
            const body: AddPostRequestBody = {
                user: userDB,
                text: postInput,

            }
            await Post.create(body);
        }
    } catch (error: any) {
        throw new Error("Error when creating post", error);
    }



    //create post in DB


    //revalidatePath '/' - home page
}