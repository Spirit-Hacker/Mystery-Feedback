import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { User } from "next-auth";
import userModel from "@/models/User.model";

export async function GET(request: Request){
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if(!session || !session.user){
        if(!session || !session.user){
            return Response.json(
                {
                    success: false,
                    message: "Not Authenticated"
                },
                { status: 401 }
            );
        }
    }

    const userId = user._id;

    try {
        const user = await userModel.aggregate([
            { $match: { id: userId } },
            { $unwind: "$messages" },
            { $sort: { "messages.createdAt": -1 } },
            { $group: { _id: "$_id", messages: {$push: "$messages"} } }
        ]);

        if(!user || user.length <= 0){
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                { status: 404 }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Successfully fetched user messages",
                data: user[0].messages
            },
            { status: 200 }
        );
    }
    catch (error) {
        console.log("Failed to get user messages", error);
        return Response.json(
            {
                success: false,
                message: "Failed to get user messages"
            },
            { status: 500 }
        );
    }
}
