'use server'

import { AddPostRequestBody } from "@/app/api/posts/route";
import generateSASToken, { containerName } from "@/lib/generateSASToken";
import { Post } from "@/mongoDB/models/post";
import { IUser } from "@/types/user";
import { BlobServiceClient } from "@azure/storage-blob";
import { currentUser } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";


export default async function createPostAction(formData: FormData) {
    const user = await currentUser();
    const postInput = formData.get("postInput") as string;
    const image = formData.get("image") as File;
    let image_url: string | undefined = undefined;

    console.log("user", user?.id)

    if (!user?.id) {
        throw new Error("User not signed in");
    }

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
            console.log("Uploading image to Azure Blob Storage", image);

            const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
            const sasToken = await generateSASToken();

            const blobServiceClient = new BlobServiceClient(
                `https://${accountName}.blob.core.windows.net?${sasToken}`,
            )

            const containerClient = blobServiceClient.getContainerClient(containerName);

            const timestamp = new Date().getTime();
            const file_name = `${randomUUID()}_${timestamp}.png`;

            const blockBlobClient = containerClient.getBlockBlobClient(file_name);

            const imageBuffer = await image.arrayBuffer();
            const res = await blockBlobClient.uploadData(imageBuffer);
            image_url = res._response.request.url;


            const body: AddPostRequestBody = {
                user: userDB,
                text: postInput,
                imageUrl: image_url,
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


    //revalidatePath '/' - home page
}